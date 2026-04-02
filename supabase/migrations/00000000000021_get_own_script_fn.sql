-- SECURITY DEFINER: script owner reads their own script (bypasses RLS pooler issue)
CREATE OR REPLACE FUNCTION public.get_own_script(p_script_id uuid)
RETURNS TABLE (
  id          uuid,
  owner_id    uuid,
  title       text,
  description text,
  sales_type  text,
  project_id  uuid,
  share_key   text,
  created_at  timestamptz,
  updated_at  timestamptz,
  project_name text
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
      s.created_at, s.updated_at,
      proj.name AS project_name
    FROM public.scripts s
    LEFT JOIN public.projects proj ON proj.id = s.project_id
    WHERE s.id = p_script_id
      AND s.owner_id = auth.uid();
END;
$$;

-- SECURITY DEFINER: script owner reads dialogs of their own script
CREATE OR REPLACE FUNCTION public.get_own_script_dialogs(p_script_id uuid)
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

  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM public.scripts WHERE id = p_script_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'not_script_owner';
  END IF;

  RETURN QUERY
    SELECT sd.id, sd.script_id, sd.turns, sd.created_at
    FROM public.script_dialogs sd
    WHERE sd.script_id = p_script_id
    ORDER BY sd.created_at ASC;
END;
$$;

-- SECURITY DEFINER: insert a dialog to a script the user owns
CREATE OR REPLACE FUNCTION public.save_script_dialog(
  p_script_id uuid,
  p_turns     jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  -- Must own the script OR be approved member of the project
  IF NOT EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = p_script_id AND (
      s.owner_id = auth.uid()
      OR (s.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = s.project_id
          AND pm.user_id = auth.uid()
          AND pm.status = 'approved'
          AND pm.role IN ('owner','admin','sales_manager')
      ))
      OR (s.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = s.project_id AND p.owner_id = auth.uid()
      ))
    )
  ) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  INSERT INTO public.script_dialogs (script_id, turns)
  VALUES (p_script_id, p_turns)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
