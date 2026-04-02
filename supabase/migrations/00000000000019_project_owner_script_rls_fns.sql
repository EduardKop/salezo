-- ================================================================
-- SECURITY DEFINER functions for project owner script access
-- Bypasses RLS for read and disconnect operations
-- ================================================================

-- 1. Allow project owner to read a script connected to their project
CREATE OR REPLACE FUNCTION public.get_script_as_project_owner(p_script_id uuid)
RETURNS TABLE (
  id          uuid,
  owner_id    uuid,
  title       text,
  description text,
  sales_type  text,
  project_id  uuid,
  share_key   text,
  created_at  timestamptz,
  updated_at  timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  RETURN QUERY
    SELECT
      s.id, s.owner_id, s.title, s.description,
      s.sales_type, s.project_id, s.share_key,
      s.created_at, s.updated_at
    FROM public.scripts s
    JOIN public.projects p ON p.id = s.project_id
    WHERE s.id = p_script_id
      AND p.owner_id = auth.uid();
END;
$$;

-- 2. Project owner disconnects a team script from their project
CREATE OR REPLACE FUNCTION public.disconnect_team_script(p_script_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT project_id INTO v_project_id
    FROM public.scripts WHERE id = p_script_id;

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'script_not_connected';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = v_project_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_project_owner';
  END IF;

  UPDATE public.scripts
     SET project_id = NULL, updated_at = now()
   WHERE id = p_script_id;
END;
$$;

-- 3. Project owner reads dialogs of a team script
CREATE OR REPLACE FUNCTION public.get_script_dialogs_as_project_owner(p_script_id uuid)
RETURNS TABLE (
  id         uuid,
  script_id  uuid,
  turns      jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  -- Verify caller owns the project this script belongs to
  IF NOT EXISTS (
    SELECT 1 FROM public.scripts s
    JOIN public.projects p ON p.id = s.project_id
    WHERE s.id = p_script_id AND p.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_project_owner';
  END IF;

  RETURN QUERY
    SELECT sd.id, sd.script_id, sd.turns, sd.created_at
    FROM public.script_dialogs sd
    WHERE sd.script_id = p_script_id
    ORDER BY sd.created_at ASC;
END;
$$;
