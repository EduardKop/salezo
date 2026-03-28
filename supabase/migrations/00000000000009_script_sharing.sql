-- ================================================================
-- Script sharing via link-key (without project attachment)
-- ================================================================

-- 1. Add share_key to scripts (unique, nullable — only generated when owner shares)
ALTER TABLE public.scripts
  ADD COLUMN IF NOT EXISTS share_key text UNIQUE;

-- 2. Table: who accepted a share link
CREATE TABLE IF NOT EXISTS public.script_shares (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id   uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (script_id, user_id)
);

ALTER TABLE public.script_shares ENABLE ROW LEVEL SECURITY;

-- RLS: script owner can see all shares for their scripts
CREATE POLICY "script_shares: owner read"
  ON public.script_shares FOR SELECT
  USING (
    script_id IN (SELECT id FROM public.scripts WHERE owner_id = auth.uid())
  );

-- RLS: script owner can delete shares (revoke access)
CREATE POLICY "script_shares: owner delete"
  ON public.script_shares FOR DELETE
  USING (
    script_id IN (SELECT id FROM public.scripts WHERE owner_id = auth.uid())
  );

-- RLS: any authenticated user can insert (accept a share link)
CREATE POLICY "script_shares: authenticated insert"
  ON public.script_shares FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- RLS: user can read their own shares
CREATE POLICY "script_shares: own read"
  ON public.script_shares FOR SELECT
  USING (user_id = auth.uid());

-- 3. Extend scripts SELECT policy: shared users can read scripts
DROP POLICY IF EXISTS "scripts: shared users read" ON public.scripts;
CREATE POLICY "scripts: shared users read"
  ON public.scripts FOR SELECT
  USING (
    id IN (SELECT script_id FROM public.script_shares WHERE user_id = auth.uid())
  );

-- 4. Extend script_dialogs SELECT policy: shared users can read dialogs
DROP POLICY IF EXISTS "dialogs: shared users read" ON public.script_dialogs;
CREATE POLICY "dialogs: shared users read"
  ON public.script_dialogs FOR SELECT
  USING (
    script_id IN (SELECT script_id FROM public.script_shares WHERE user_id = auth.uid())
  );

-- 5. Lookup function for accepting a share key (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.accept_script_share(p_share_key text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_script_id uuid;
  v_owner_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT id, owner_id INTO v_script_id, v_owner_id
  FROM public.scripts
  WHERE share_key = trim(p_share_key)
  LIMIT 1;

  IF v_script_id IS NULL THEN
    RAISE EXCEPTION 'invalid_key';
  END IF;

  IF v_owner_id = auth.uid() THEN
    RAISE EXCEPTION 'own_script';
  END IF;

  INSERT INTO public.script_shares (script_id, user_id)
  VALUES (v_script_id, auth.uid())
  ON CONFLICT (script_id, user_id) DO NOTHING;

  RETURN v_script_id;
END;
$$;

-- 6. Add to realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'script_shares'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.script_shares;
  END IF;
END $$;
