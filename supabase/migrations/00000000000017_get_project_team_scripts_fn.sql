-- Returns scripts connected to projects owned by the caller,
-- but NOT owned by the caller (i.e. team member scripts).
CREATE OR REPLACE FUNCTION public.get_project_team_scripts()
RETURNS TABLE (
  id           uuid,
  owner_id     uuid,
  title        text,
  description  text,
  sales_type   text,
  project_id   uuid,
  share_key    text,
  created_at   timestamptz,
  updated_at   timestamptz,
  project_name text,
  member_name  text,
  member_email text,
  dialog_count bigint,
  share_count  bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  RETURN QUERY
    SELECT
      s.id,
      s.owner_id,
      s.title,
      s.description,
      s.sales_type,
      s.project_id,
      s.share_key,
      s.created_at,
      s.updated_at,
      proj.name                               AS project_name,
      p.full_name                             AS member_name,
      p.email                                 AS member_email,
      COUNT(DISTINCT sd.id)::bigint           AS dialog_count,
      COUNT(DISTINCT ss.id)::bigint           AS share_count
    FROM public.scripts s
    JOIN public.projects  proj ON proj.id = s.project_id
    JOIN public.profiles  p    ON p.id    = s.owner_id
    LEFT JOIN public.script_dialogs sd ON sd.script_id = s.id
    LEFT JOIN public.script_shares  ss ON ss.script_id = s.id
    WHERE proj.owner_id = auth.uid()
      AND s.owner_id   <> auth.uid()
    GROUP BY s.id, proj.name, p.full_name, p.email
    ORDER BY s.updated_at DESC;
END;
$$;
