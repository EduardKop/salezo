-- =====================================================
-- FIX RLS for project_members UPDATE/DELETE (RECURSION ERROR)
-- We must use a SECURITY DEFINER function to bypass the infinite loop
-- =====================================================

-- Step 1: Create a safe function to get projects you can MANAGE
CREATE OR REPLACE FUNCTION public.get_user_manageable_project_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  -- Projects the user owns
  SELECT id FROM projects WHERE owner_id = auth.uid()
  UNION
  -- Projects where the user is an admin
  SELECT project_id FROM project_members
  WHERE user_id = auth.uid()
    AND status = 'approved'
    AND role = 'admin'
$$;

-- Step 2: Use this safe function in the UPDATE policy
DROP POLICY IF EXISTS "members_update_policy" ON project_members;
CREATE POLICY "members_update_policy" ON project_members
  FOR UPDATE USING (
    project_id IN (SELECT public.get_user_manageable_project_ids())
  );

-- Step 3: Use this safe function in the DELETE policy
DROP POLICY IF EXISTS "members_delete_policy" ON project_members;
CREATE POLICY "members_delete_policy" ON project_members
  FOR DELETE USING (
    project_id IN (SELECT public.get_user_manageable_project_ids())
  );
