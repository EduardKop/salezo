-- ================================================================
-- Script connect requests
-- When a project MEMBER (non-owner) wants to connect their script
-- to the project, it creates a request that the project OWNER approves.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.script_connect_requests (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id    uuid        NOT NULL REFERENCES public.scripts(id)  ON DELETE CASCADE,
  project_id   uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requester_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (script_id, project_id)           -- one pending request per script+project
);

ALTER TABLE public.script_connect_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_script_connect_requests_updated_at
  BEFORE UPDATE ON public.script_connect_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

-- Requester can see & insert their own requests
CREATE POLICY "scr: requester read"
  ON public.script_connect_requests FOR SELECT
  USING (requester_id = auth.uid());

CREATE POLICY "scr: requester insert"
  ON public.script_connect_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Project owner can read all requests for their projects
CREATE POLICY "scr: owner read"
  ON public.script_connect_requests FOR SELECT
  USING (
    project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
  );

-- Project owner can update (approve/reject) requests for their projects
CREATE POLICY "scr: owner update"
  ON public.script_connect_requests FOR UPDATE
  USING (
    project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
  );

-- Requester can delete (cancel) their own pending requests
CREATE POLICY "scr: requester delete"
  ON public.script_connect_requests FOR DELETE
  USING (requester_id = auth.uid());

-- Realtime
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'script_connect_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.script_connect_requests;
  END IF;
END $$;
