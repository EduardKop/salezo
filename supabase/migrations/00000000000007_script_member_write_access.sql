-- ================================================================
-- Allow approved project members to write dialogs for project scripts
-- ================================================================

-- Project members (admin + sales_manager) can insert dialogs for scripts
-- they have access to through their project membership.
-- NOTE: The app layer (resolveScriptAccess) enforces the canEdit check.
-- This RLS policy is the DB-level permission gate.

DROP POLICY IF EXISTS "dialogs: project members insert" ON public.script_dialogs;
CREATE POLICY "dialogs: project members insert"
  ON public.script_dialogs FOR INSERT
  WITH CHECK (
    script_id IN (
      SELECT id FROM public.scripts
      WHERE project_id IS NOT NULL
        AND project_id IN (SELECT public.get_user_approved_projects())
    )
  );

-- Allow admin project members to delete dialogs (app layer also checks canManage)
DROP POLICY IF EXISTS "dialogs: project admins delete" ON public.script_dialogs;
CREATE POLICY "dialogs: project admins delete"
  ON public.script_dialogs FOR DELETE
  USING (
    script_id IN (
      SELECT id FROM public.scripts
      WHERE project_id IS NOT NULL
        AND project_id IN (SELECT public.get_user_managed_projects())
    )
  );
