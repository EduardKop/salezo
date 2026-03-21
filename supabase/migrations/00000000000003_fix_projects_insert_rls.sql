-- Fix: ensure the INSERT policy on projects allows authenticated users to create projects
-- Drop and recreate to avoid "policy already exists" errors

DROP POLICY IF EXISTS "projects: authenticated insert" ON public.projects;

CREATE POLICY "projects: authenticated insert"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
