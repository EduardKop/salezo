-- SECURITY DEFINER function to connect a script to a project
-- when a project owner approves a connect request.
-- Bypasses RLS so the project owner can update a script they don't own.

CREATE OR REPLACE FUNCTION public.approve_script_connect_request(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_script_id  uuid;
  v_project_id uuid;
  v_status     text;
BEGIN
  -- Caller must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Fetch the request
  SELECT script_id, project_id, status
    INTO v_script_id, v_project_id, v_status
    FROM public.script_connect_requests
   WHERE id = p_request_id;

  IF v_script_id IS NULL THEN
    RAISE EXCEPTION 'request_not_found';
  END IF;

  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'request_already_resolved';
  END IF;

  -- Caller must own the project
  IF NOT EXISTS (
    SELECT 1 FROM public.projects
     WHERE id = v_project_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_project_owner';
  END IF;

  -- Connect the script (bypasses RLS)
  UPDATE public.scripts
     SET project_id = v_project_id, updated_at = now()
   WHERE id = v_script_id;

  -- Mark request as approved
  UPDATE public.script_connect_requests
     SET status = 'approved', updated_at = now()
   WHERE id = p_request_id;
END;
$$;
