-- Add description column to store context notes for AI
ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS description text;
