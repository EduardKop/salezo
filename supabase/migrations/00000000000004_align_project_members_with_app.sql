-- Align the database contract with the app's current project membership model.

DO $$
BEGIN
  CREATE TYPE public.project_member_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.project_members
  ADD COLUMN IF NOT EXISTS status public.project_member_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS user_name text,
  ADD COLUMN IF NOT EXISTS user_email text;

UPDATE public.project_members AS pm
SET
  user_name = COALESCE(pm.user_name, p.full_name, split_part(p.email, '@', 1), 'Unknown User'),
  user_email = COALESCE(pm.user_email, p.email)
FROM public.profiles AS p
WHERE p.id = pm.user_id
  AND (pm.user_name IS NULL OR pm.user_email IS NULL);

ALTER TABLE public.project_members
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.project_members
  ALTER COLUMN role TYPE text
  USING CASE role::text
    WHEN 'Owner' THEN 'owner'
    WHEN 'ROP' THEN 'admin'
    WHEN 'Manager' THEN 'sales_manager'
    WHEN 'TeamLead' THEN 'viewer'
    ELSE lower(role::text)
  END;

ALTER TABLE public.project_members
  ALTER COLUMN role SET DEFAULT 'sales_manager';

ALTER TABLE public.project_members
  DROP CONSTRAINT IF EXISTS project_members_role_check;

ALTER TABLE public.project_members
  ADD CONSTRAINT project_members_role_check
  CHECK (role IN ('owner', 'admin', 'sales_manager', 'viewer'));

CREATE INDEX IF NOT EXISTS idx_pm_status ON public.project_members USING btree(status);

CREATE OR REPLACE FUNCTION public.get_user_projects()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id
  FROM public.projects
  WHERE owner_id = auth.uid()
  UNION
  SELECT project_id
  FROM public.project_members
  WHERE user_id = auth.uid()
    AND status IN ('approved', 'pending')
$$;

CREATE OR REPLACE FUNCTION public.get_user_approved_projects()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id
  FROM public.projects
  WHERE owner_id = auth.uid()
  UNION
  SELECT project_id
  FROM public.project_members
  WHERE user_id = auth.uid()
    AND status = 'approved'
$$;

CREATE OR REPLACE FUNCTION public.get_user_managed_projects()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id
  FROM public.projects
  WHERE owner_id = auth.uid()
  UNION
  SELECT project_id
  FROM public.project_members
  WHERE user_id = auth.uid()
    AND status = 'approved'
    AND role IN ('owner', 'admin')
$$;

CREATE OR REPLACE FUNCTION public.get_project_by_join_key(p_join_key text)
RETURNS TABLE (
  id uuid,
  owner_id uuid,
  name text,
  join_key text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.id, p.owner_id, p.name, p.join_key
  FROM public.projects AS p
  WHERE p.join_key = upper(trim(p_join_key))
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.request_project_access(
  p_join_key text,
  p_user_id uuid,
  p_user_email text,
  p_user_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_project public.projects%ROWTYPE;
  existing_member public.project_members%ROWTYPE;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT *
  INTO target_project
  FROM public.projects
  WHERE join_key = upper(trim(p_join_key))
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_key';
  END IF;

  IF target_project.owner_id = p_user_id THEN
    RAISE EXCEPTION 'already_owner';
  END IF;

  SELECT *
  INTO existing_member
  FROM public.project_members
  WHERE project_id = target_project.id
    AND user_id = p_user_id
  LIMIT 1;

  IF FOUND THEN
    IF existing_member.status = 'approved' THEN
      RAISE EXCEPTION 'already_member';
    END IF;

    IF existing_member.status = 'pending' THEN
      RAISE EXCEPTION 'already_requested';
    END IF;
  END IF;

  INSERT INTO public.project_members (
    project_id,
    user_id,
    status,
    role,
    user_name,
    user_email
  )
  VALUES (
    target_project.id,
    p_user_id,
    'pending',
    'sales_manager',
    NULLIF(trim(p_user_name), ''),
    NULLIF(trim(p_user_email), '')
  )
  ON CONFLICT (project_id, user_id) DO UPDATE SET
    status = 'pending',
    role = 'sales_manager',
    user_name = EXCLUDED.user_name,
    user_email = EXCLUDED.user_email;

  RETURN target_project.id;
END;
$$;

DROP POLICY IF EXISTS "members: project read" ON public.project_members;
DROP POLICY IF EXISTS "members: owner/rop manage" ON public.project_members;
DROP POLICY IF EXISTS "members: requester insert" ON public.project_members;
DROP POLICY IF EXISTS "members: requester update" ON public.project_members;
DROP POLICY IF EXISTS "members: managers insert" ON public.project_members;
DROP POLICY IF EXISTS "members: managers update" ON public.project_members;
DROP POLICY IF EXISTS "members: managers delete" ON public.project_members;

CREATE POLICY "members: project read"
  ON public.project_members FOR SELECT
  USING (project_id IN (SELECT public.get_user_approved_projects()));

CREATE POLICY "members: managers update"
  ON public.project_members FOR UPDATE
  USING (
    project_id IN (SELECT public.get_user_managed_projects())
    AND role <> 'owner'
  )
  WITH CHECK (
    project_id IN (SELECT public.get_user_managed_projects())
    AND role <> 'owner'
  );

CREATE POLICY "members: managers delete"
  ON public.project_members FOR DELETE
  USING (
    project_id IN (SELECT public.get_user_managed_projects())
    AND role <> 'owner'
  );

CREATE OR REPLACE FUNCTION public.handle_join_request_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_member_id uuid;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.project_members (
      project_id,
      user_id,
      role,
      status,
      user_name,
      user_email
    )
    SELECT
      NEW.project_id,
      NEW.requester_id,
      CASE NEW.assigned_role::text
        WHEN 'Owner' THEN 'owner'
        WHEN 'ROP' THEN 'admin'
        WHEN 'TeamLead' THEN 'viewer'
        ELSE 'sales_manager'
      END,
      'approved',
      COALESCE(p.full_name, split_part(p.email, '@', 1), 'Unknown User'),
      p.email
    FROM public.profiles AS p
    WHERE p.id = NEW.requester_id
    ON CONFLICT (project_id, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      user_name = COALESCE(public.project_members.user_name, EXCLUDED.user_name),
      user_email = COALESCE(public.project_members.user_email, EXCLUDED.user_email)
    RETURNING id INTO new_member_id;

    INSERT INTO public.member_permissions (member_id)
    VALUES (new_member_id)
    ON CONFLICT (member_id) DO NOTHING;

    NEW.resolved_at = now();

    INSERT INTO public.notifications (user_id, type, payload)
    VALUES (
      NEW.requester_id,
      'accepted',
      jsonb_build_object('project_id', NEW.project_id, 'role', NEW.assigned_role)
    );
  END IF;

  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    NEW.resolved_at = now();
    INSERT INTO public.notifications (user_id, type, payload)
    VALUES (
      NEW.requester_id,
      'rejected',
      jsonb_build_object('project_id', NEW.project_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_join_request_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, payload)
  SELECT
    pm.user_id,
    'join_request',
    jsonb_build_object(
      'join_request_id', NEW.id,
      'project_id', NEW.project_id,
      'requester_id', NEW.requester_id
    )
  FROM public.project_members AS pm
  WHERE pm.project_id = NEW.project_id
    AND pm.status = 'approved'
    AND pm.role IN ('owner', 'admin');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_project_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_member_id uuid;
  owner_name text;
  owner_email text;
BEGIN
  SELECT
    COALESCE(full_name, split_part(email, '@', 1), 'Owner'),
    email
  INTO owner_name, owner_email
  FROM public.profiles
  WHERE id = NEW.owner_id;

  INSERT INTO public.project_members (
    project_id,
    user_id,
    role,
    status,
    user_name,
    user_email
  )
  VALUES (
    NEW.id,
    NEW.owner_id,
    'owner',
    'approved',
    owner_name,
    owner_email
  )
  RETURNING id INTO new_member_id;

  INSERT INTO public.member_permissions (member_id)
  VALUES (new_member_id)
  ON CONFLICT (member_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'project_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
END $$;
