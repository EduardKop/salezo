-- Allow project owners to read + update scripts connected to their projects
-- (even if they don't own the script)

DROP POLICY IF EXISTS "scripts: project owner read" ON public.scripts;
CREATE POLICY "scripts: project owner read"
  ON public.scripts FOR SELECT
  USING (
    project_id IS NOT NULL AND
    project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
  );

-- Allow project owner to disconnect (set project_id = NULL) team scripts
DROP POLICY IF EXISTS "scripts: project owner disconnect" ON public.scripts;
CREATE POLICY "scripts: project owner disconnect"
  ON public.scripts FOR UPDATE
  USING (
    project_id IS NOT NULL AND
    project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    -- Only allow setting project_id to NULL (disconnect), not changing other project
    project_id IS NULL
  );

-- Allow project owner to read dialogs of team scripts connected to their projects
DROP POLICY IF EXISTS "dialogs: project owner read" ON public.script_dialogs;
CREATE POLICY "dialogs: project owner read"
  ON public.script_dialogs FOR SELECT
  USING (
    script_id IN (
      SELECT s.id FROM public.scripts s
      JOIN public.projects p ON p.id = s.project_id
      WHERE p.owner_id = auth.uid()
    )
  );
