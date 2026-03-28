-- =============================================================
-- Scripts & Dialogs
-- =============================================================

-- 1. Scripts table
CREATE TABLE public.scripts (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        text,
  sales_type   text        NOT NULL CHECK (sales_type IN ('phone', 'chat', 'in_person')),
  project_id   uuid        REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

-- 2. Script Dialogs (each row = one recorded conversation)
CREATE TABLE public.script_dialogs (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id    uuid        NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  turns        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_scripts_owner      ON public.scripts USING btree(owner_id);
CREATE INDEX idx_scripts_project    ON public.scripts USING btree(project_id);
CREATE INDEX idx_dialogs_script     ON public.script_dialogs USING btree(script_id);

-- Enable RLS
ALTER TABLE public.scripts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_dialogs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Scripts: creator can do everything
CREATE POLICY "scripts: owner all"
  ON public.scripts FOR ALL
  USING (owner_id = auth.uid());

-- Scripts: project members can read scripts connected to their projects
CREATE POLICY "scripts: project members read"
  ON public.scripts FOR SELECT
  USING (
    project_id IS NOT NULL AND
    project_id IN (SELECT public.get_user_projects())
  );

-- Script Dialogs: owner of parent script can do everything
CREATE POLICY "dialogs: script owner all"
  ON public.script_dialogs FOR ALL
  USING (
    script_id IN (
      SELECT id FROM public.scripts WHERE owner_id = auth.uid()
    )
  );

-- Script Dialogs: project members can read dialogs for connected scripts
CREATE POLICY "dialogs: project members read"
  ON public.script_dialogs FOR SELECT
  USING (
    script_id IN (
      SELECT id FROM public.scripts
      WHERE project_id IS NOT NULL
        AND project_id IN (SELECT public.get_user_projects())
    )
  );

-- Updated_at trigger for scripts
CREATE TRIGGER trg_scripts_updated_at
  BEFORE UPDATE ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.scripts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.script_dialogs;
