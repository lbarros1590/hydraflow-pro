-- =============================================
-- FASE 1: Infraestrutura de Arquivos e Compartilhamento
-- =============================================

-- Tabela para arquivos do projeto
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_category TEXT NOT NULL DEFAULT 'outros',
  file_url TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para revisões/anotações
CREATE TABLE public.project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.project_files(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  page_number INTEGER,
  position_x FLOAT,
  position_y FLOAT,
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  priority TEXT DEFAULT 'normal',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para compartilhamento de projetos
CREATE TABLE public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  permission TEXT DEFAULT 'view',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, shared_with_email)
);

-- Adicionar colunas ao hydraulic_calculations
ALTER TABLE public.hydraulic_calculations
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Cálculo Principal',
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS accessories JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS connections JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS report_data JSONB DEFAULT '{}';

-- Storage bucket para arquivos de projeto (privado)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- RLS Policies para project_files
-- =============================================
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project files"
ON public.project_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.project_shares ps
    WHERE ps.project_id = project_files.project_id 
    AND (ps.shared_with_user_id = auth.uid() OR ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

CREATE POLICY "Users can insert own project files"
ON public.project_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.project_shares ps
    WHERE ps.project_id = project_files.project_id 
    AND ps.permission = 'edit'
    AND (ps.shared_with_user_id = auth.uid() OR ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

CREATE POLICY "Users can update own project files"
ON public.project_files FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own project files"
ON public.project_files FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
);

-- =============================================
-- RLS Policies para project_reviews
-- =============================================
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project reviews"
ON public.project_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.project_shares ps
    WHERE ps.project_id = project_reviews.project_id 
    AND (ps.shared_with_user_id = auth.uid() OR ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

CREATE POLICY "Users can insert project reviews"
ON public.project_reviews FOR INSERT
WITH CHECK (
  reviewer_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.project_shares ps
      WHERE ps.project_id = project_reviews.project_id 
      AND ps.permission IN ('comment', 'edit')
      AND (ps.shared_with_user_id = auth.uid() OR ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  )
);

CREATE POLICY "Users can update own reviews"
ON public.project_reviews FOR UPDATE
USING (reviewer_id = auth.uid());

CREATE POLICY "Project owners can update any review"
ON public.project_reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own reviews"
ON public.project_reviews FOR DELETE
USING (reviewer_id = auth.uid());

-- =============================================
-- RLS Policies para project_shares
-- =============================================
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage shares"
ON public.project_shares FOR ALL
USING (owner_id = auth.uid());

CREATE POLICY "Users can view shares for their projects"
ON public.project_shares FOR SELECT
USING (
  owner_id = auth.uid() 
  OR shared_with_user_id = auth.uid()
  OR shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- =============================================
-- Storage Policies para project-files
-- =============================================
CREATE POLICY "Users can view own project files storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own project files storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own project files storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own project files storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- Atualizar policy de projects para considerar compartilhamento
-- =============================================
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;

CREATE POLICY "Users can view own or shared projects"
ON public.projects FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.project_shares ps
    WHERE ps.project_id = projects.id 
    AND (ps.shared_with_user_id = auth.uid() OR ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

-- Trigger para updated_at em project_files
CREATE TRIGGER update_project_files_updated_at
BEFORE UPDATE ON public.project_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();