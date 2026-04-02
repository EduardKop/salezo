-- SECURITY DEFINER function to create a script connect request.
-- Bypasses RLS INSERT check — validates ownership inside the function body.

CREATE OR REPLACE FUNCTION public.create_script_connect_request(
  p_script_id  uuid,
  p_project_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_script_owner      uuid;
  v_project_owner     uuid;
  v_membership_role   text;
  v_membership_status text;
  v_is_owner          boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  -- Caller must own the script
  SELECT owner_id INTO v_script_owner FROM public.scripts WHERE id = p_script_id;
  IF v_script_owner IS NULL THEN RAISE EXCEPTION 'script_not_found'; END IF;
  IF v_script_owner <> auth.uid() THEN RAISE EXCEPTION 'not_script_owner'; END IF;

  -- Check if caller owns the project
  SELECT owner_id INTO v_project_owner FROM public.projects WHERE id = p_project_id;
  v_is_owner := (v_project_owner = auth.uid());

  -- If not owner, require approved membership
  IF NOT v_is_owner THEN
    SELECT role, status INTO v_membership_role, v_membership_status
      FROM public.project_members
     WHERE project_id = p_project_id AND user_id = auth.uid();
    IF v_membership_status IS DISTINCT FROM 'approved' THEN
      RAISE EXCEPTION 'not_project_member';
    END IF;
  END IF;

  -- Owner or admin → direct connect
  IF v_is_owner OR v_membership_role = 'admin' THEN
    UPDATE public.scripts
       SET project_id = p_project_id, updated_at = now()
     WHERE id = p_script_id;
    RETURN 'direct';
  END IF;

  -- Member → create pending request
  INSERT INTO public.script_connect_requests (script_id, project_id, requester_id, status)
  VALUES (p_script_id, p_project_id, auth.uid(), 'pending')
  ON CONFLICT (script_id, project_id)
  DO UPDATE SET status = 'pending', updated_at = now();

  RETURN 'request';
END;
$$;
