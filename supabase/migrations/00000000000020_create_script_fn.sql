-- SECURITY DEFINER: create a script bypassing RLS INSERT check
CREATE OR REPLACE FUNCTION public.create_script(
  p_sales_type  text,
  p_title       text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  INSERT INTO public.scripts (owner_id, sales_type, title, description)
  VALUES (auth.uid(), p_sales_type, p_title, p_description)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
