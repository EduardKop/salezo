-- Fix infinite recursion in scripts RLS caused by "scripts: shared users read"
-- policy referencing script_shares which references scripts.
-- Solution: use SECURITY DEFINER helper function to break the cycle.

CREATE OR REPLACE FUNCTION public.get_user_shared_script_ids()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT script_id
    FROM public.script_shares
    WHERE user_id = auth.uid();
END;
$$;

-- Replace the recursive policy with one using the helper function
DROP POLICY IF EXISTS "scripts: shared users read" ON public.scripts;
CREATE POLICY "scripts: shared users read"
  ON public.scripts FOR SELECT
  USING (id IN (SELECT public.get_user_shared_script_ids()));

-- Same fix for dialogs
DROP POLICY IF EXISTS "dialogs: shared users read" ON public.script_dialogs;
CREATE POLICY "dialogs: shared users read"
  ON public.script_dialogs FOR SELECT
  USING (
    script_id IN (SELECT public.get_user_shared_script_ids())
  );
