-- SECURITY DEFINER function to return pending script connect requests
-- for projects owned by the calling user.
-- Bypasses RLS on script_connect_requests and profiles.

CREATE OR REPLACE FUNCTION public.get_script_connect_requests()
RETURNS TABLE (
  id              uuid,
  script_id       uuid,
  project_id      uuid,
  requester_id    uuid,
  status          text,
  created_at      timestamptz,
  requester_email text,
  requester_name  text,
  requester_avatar text,
  script_title    text,
  script_description text,
  script_sales_type  text,
  project_name    text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  RETURN QUERY
    SELECT
      scr.id,
      scr.script_id,
      scr.project_id,
      scr.requester_id,
      scr.status,
      scr.created_at,
      p.email         AS requester_email,
      p.full_name     AS requester_name,
      p.avatar_url    AS requester_avatar,
      s.title         AS script_title,
      s.description   AS script_description,
      s.sales_type    AS script_sales_type,
      proj.name       AS project_name
    FROM public.script_connect_requests scr
    JOIN public.projects    proj ON proj.id  = scr.project_id
    JOIN public.scripts     s    ON s.id     = scr.script_id
    JOIN public.profiles    p    ON p.id     = scr.requester_id
    WHERE proj.owner_id = auth.uid()
      AND scr.status    = 'pending'
    ORDER BY scr.created_at DESC;
END;
$$;
