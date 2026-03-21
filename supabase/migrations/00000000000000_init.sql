-- =============================================================
-- Salezo OS — Full database schema
-- ORDER: Extensions → Enums → Tables → Indexes → RLS → Policies → Functions → Triggers → Realtime
-- =============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================
-- ENUM TYPES
-- =============================================================

CREATE TYPE public.global_role AS ENUM ('Owner', 'ROP', 'TeamLead', 'Manager');
CREATE TYPE public.join_request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.app_language AS ENUM ('EN', 'RU');

-- =============================================================
-- TABLES
-- All tables are created first so policies can freely reference them
-- =============================================================

-- 1. Profiles (1-to-1 with auth.users)
CREATE TABLE public.profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  email           text UNIQUE,
  avatar_url      text,
  global_role     global_role DEFAULT 'Manager'::global_role NOT NULL,
  language        app_language DEFAULT 'EN'::app_language NOT NULL,
  onboarding_done boolean     DEFAULT false NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

-- 2. Projects (workspaces / tenants)
CREATE TABLE public.projects (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  join_key      text        UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 8)),
  owner_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  details       jsonb       DEFAULT '[]'::jsonb,
  plan          text        DEFAULT 'free' NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL
);

-- 3. Project Members (many-to-many: users ↔ projects)
CREATE TABLE public.project_members (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role          global_role NOT NULL DEFAULT 'Manager'::global_role,
  joined_at     timestamptz DEFAULT now() NOT NULL,
  UNIQUE (project_id, user_id)
);

-- 4. Per-user permissions (JSONB map, e.g. { "can_see_revenue": true })
CREATE TABLE public.member_permissions (
  id          uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   uuid    NOT NULL REFERENCES public.project_members(id) ON DELETE CASCADE,
  permissions jsonb   NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE (member_id)
);

-- 5. Join Requests
CREATE TABLE public.join_requests (
  id            uuid                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    uuid                  NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requester_id  uuid                  NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        join_request_status   DEFAULT 'pending'::join_request_status NOT NULL,
  assigned_role global_role           DEFAULT 'Manager'::global_role,
  message       text,
  created_at    timestamptz           DEFAULT now() NOT NULL,
  resolved_at   timestamptz,
  UNIQUE (project_id, requester_id)
);

-- 6. Notifications
CREATE TABLE public.notifications (
  id          uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text    NOT NULL,
  payload     jsonb   NOT NULL DEFAULT '{}'::jsonb,
  is_read     boolean DEFAULT false NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_profiles_global_role  ON public.profiles USING btree(global_role);
CREATE INDEX idx_profiles_onboarding   ON public.profiles USING btree(onboarding_done) WHERE onboarding_done = false;

CREATE INDEX idx_projects_owner        ON public.projects USING btree(owner_id);
CREATE INDEX idx_projects_join_key     ON public.projects USING btree(join_key);
CREATE INDEX idx_projects_name_trgm    ON public.projects USING gin(name gin_trgm_ops);

CREATE INDEX idx_pm_project            ON public.project_members USING btree(project_id);
CREATE INDEX idx_pm_user               ON public.project_members USING btree(user_id);
CREATE INDEX idx_pm_role               ON public.project_members USING btree(role);

CREATE INDEX idx_perms_jsonb           ON public.member_permissions USING gin(permissions);
CREATE INDEX idx_perms_member          ON public.member_permissions USING btree(member_id);

CREATE INDEX idx_jr_project            ON public.join_requests USING btree(project_id);
CREATE INDEX idx_jr_requester          ON public.join_requests USING btree(requester_id);
CREATE INDEX idx_jr_status             ON public.join_requests USING btree(status) WHERE status = 'pending';

CREATE INDEX idx_notif_user            ON public.notifications USING btree(user_id);
CREATE INDEX idx_notif_unread          ON public.notifications USING btree(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notif_created         ON public.notifications USING btree(created_at DESC);

-- =============================================================
-- ROW LEVEL SECURITY — enable on ALL tables first
-- =============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- RLS HELPER FUNCTIONS
-- =============================================================

CREATE OR REPLACE FUNCTION public.get_user_projects()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT project_id
    FROM public.project_members
    WHERE user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_managed_projects()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT project_id
    FROM public.project_members
    WHERE user_id = auth.uid() AND role IN ('Owner', 'ROP');
END;
$$;

-- =============================================================
-- RLS POLICIES
-- Created AFTER all tables exist to avoid forward-reference errors
-- =============================================================

-- profiles
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- projects
CREATE POLICY "projects: members can read"
  ON public.projects FOR SELECT
  USING (id IN (SELECT public.get_user_projects()));

CREATE POLICY "projects: owner update"
  ON public.projects FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "projects: owner delete"
  ON public.projects FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "projects: authenticated insert"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- project_members
CREATE POLICY "members: own read"
  ON public.project_members FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "members: project read"
  ON public.project_members FOR SELECT
  USING (project_id IN (SELECT public.get_user_projects()));

CREATE POLICY "members: owner/rop manage"
  ON public.project_members FOR ALL
  USING (project_id IN (SELECT public.get_user_managed_projects()));

-- member_permissions
CREATE POLICY "perms: own read"
  ON public.member_permissions FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "perms: owner/rop write"
  ON public.member_permissions FOR ALL
  USING (
    member_id IN (
      SELECT id FROM public.project_members
      WHERE project_id IN (SELECT public.get_user_managed_projects())
    )
  );

-- join_requests
CREATE POLICY "jr: requester read"
  ON public.join_requests FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "jr: requester insert"
  ON public.join_requests FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "jr: owner/rop read"
  ON public.join_requests FOR SELECT
  USING (project_id IN (SELECT public.get_user_managed_projects()));

CREATE POLICY "jr: owner/rop update"
  ON public.join_requests FOR UPDATE
  USING (project_id IN (SELECT public.get_user_managed_projects()));

-- notifications
CREATE POLICY "notif: own all"
  ON public.notifications FOR ALL USING (user_id = auth.uid());

-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- 1. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Enforce 1 free project per user
CREATE OR REPLACE FUNCTION public.enforce_free_project_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_count int;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM public.projects
  WHERE owner_id = NEW.owner_id AND plan = 'free';

  -- IF existing_count >= 1 THEN
  --   RAISE EXCEPTION 'Free plan allows only 1 project. Upgrade to create more.';
  -- END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_free_project_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_project_limit();

-- 4. On join request accepted/rejected → add member + notify
CREATE OR REPLACE FUNCTION public.handle_join_request_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_member_id uuid;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (NEW.project_id, NEW.requester_id, NEW.assigned_role)
    ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role
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

CREATE TRIGGER trg_join_request_accepted
  BEFORE UPDATE ON public.join_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_join_request_accepted();

-- 5. On join request created → notify Owner/ROP
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
      'project_id',      NEW.project_id,
      'requester_id',    NEW.requester_id
    )
  FROM public.project_members pm
  WHERE pm.project_id = NEW.project_id
    AND pm.role IN ('Owner', 'ROP');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_join_request_created
  AFTER INSERT ON public.join_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_join_request_created();

-- 6. On project created → auto-add owner as member + create permissions
CREATE OR REPLACE FUNCTION public.handle_project_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_member_id uuid;
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'Owner')
  RETURNING id INTO new_member_id;

  INSERT INTO public.member_permissions (member_id)
  VALUES (new_member_id)
  ON CONFLICT (member_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_project_created();

-- =============================================================
-- REALTIME
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.join_requests;
