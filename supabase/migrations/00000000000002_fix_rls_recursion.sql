-- Fix infinite recursion in RLS policies by using SECURITY DEFINER functions

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

-- Drop problematic policies
DROP POLICY IF EXISTS "projects: members can read" ON public.projects;
DROP POLICY IF EXISTS "members: project read" ON public.project_members;
DROP POLICY IF EXISTS "members: owner/rop manage" ON public.project_members;
DROP POLICY IF EXISTS "perms: owner/rop write" ON public.member_permissions;
DROP POLICY IF EXISTS "jr: owner/rop read" ON public.join_requests;
DROP POLICY IF EXISTS "jr: owner/rop update" ON public.join_requests;

-- Recreate policies using the security definer functions

-- projects
CREATE POLICY "projects: members can read"
  ON public.projects FOR SELECT
  USING (id IN (SELECT public.get_user_projects()));

-- project_members
CREATE POLICY "members: project read"
  ON public.project_members FOR SELECT
  USING (project_id IN (SELECT public.get_user_projects()));

CREATE POLICY "members: owner/rop manage"
  ON public.project_members FOR ALL
  USING (project_id IN (SELECT public.get_user_managed_projects()));

-- member_permissions
CREATE POLICY "perms: owner/rop write"
  ON public.member_permissions FOR ALL
  USING (
    member_id IN (
      SELECT id FROM public.project_members
      WHERE project_id IN (SELECT public.get_user_managed_projects())
    )
  );

-- join_requests
CREATE POLICY "jr: owner/rop read"
  ON public.join_requests FOR SELECT
  USING (project_id IN (SELECT public.get_user_managed_projects()));

CREATE POLICY "jr: owner/rop update"
  ON public.join_requests FOR UPDATE
  USING (project_id IN (SELECT public.get_user_managed_projects()));