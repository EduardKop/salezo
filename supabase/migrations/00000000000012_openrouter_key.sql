-- Add OpenRouter API key to profiles (encrypted at rest by Supabase)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS openrouter_api_key text;

-- Only the owner can read/update their own key
DROP POLICY IF EXISTS "profiles: own key update" ON public.profiles;
CREATE POLICY "profiles: own key update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
