-- ================================================================
-- Fix script access: allow project owner/admin to UPDATE scripts,
-- tighten dialog INSERT to exclude viewer role
-- ================================================================

-- 1. Allow project owner + admin to UPDATE scripts linked to their projects
DROP POLICY IF EXISTS "scripts: project managers update" ON public.scripts;
CREATE POLICY "scripts: project managers update"
  ON public.scripts FOR UPDATE
  USING (
    project_id IS NOT NULL
    AND project_id IN (SELECT public.get_user_managed_projects())
  )
  WITH CHECK (
    project_id IS NOT NULL
    AND project_id IN (SELECT public.get_user_managed_projects())
  );

-- 2. Tighten dialog INSERT: only approved members with editable roles (not viewer)
--    Replace the old broad policy from migration 0007
DROP POLICY IF EXISTS "dialogs: project members insert" ON public.script_dialogs;
CREATE POLICY "dialogs: project members insert"
  ON public.script_dialogs FOR INSERT
  WITH CHECK (
    script_id IN (
      SELECT s.id FROM public.scripts s
      WHERE s.project_id IS NOT NULL
        AND s.project_id IN (
          SELECT pm.project_id
          FROM public.project_members pm
          WHERE pm.user_id = auth.uid()
            AND pm.status = 'approved'
            AND pm.role IN ('owner', 'admin', 'sales_manager')
        )
    )
  );
