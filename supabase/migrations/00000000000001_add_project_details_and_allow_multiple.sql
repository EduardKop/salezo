ALTER TABLE public.projects ADD COLUMN details jsonb DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.enforce_free_project_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_count int;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM public.projects
  WHERE owner_id = NEW.owner_id AND plan = 'free';

  -- IF existing_count >= 1 THEN
  --   RAISE EXCEPTION 'Free plan allows only 1 project. Upgrade to create more.';
  -- END IF;
  RETURN NEW;
END;
$$;