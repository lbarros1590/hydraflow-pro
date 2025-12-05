-- Tabela para cálculos de separação (NTCB 09/2020)
CREATE TABLE public.separation_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Cálculo de Separação',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  buildings JSONB DEFAULT '[]'::jsonb,
  calculations JSONB DEFAULT '[]'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para cálculos de saídas de emergência (NTCB 13/2020)
CREATE TABLE public.emergency_exit_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Cálculo de Saídas',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  buildings JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.separation_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_exit_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for separation_calculations
CREATE POLICY "Users can view own separation calculations"
ON public.separation_calculations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = separation_calculations.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create own separation calculations"
ON public.separation_calculations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = separation_calculations.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update own separation calculations"
ON public.separation_calculations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = separation_calculations.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete own separation calculations"
ON public.separation_calculations FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = separation_calculations.project_id AND projects.user_id = auth.uid()
));

-- RLS Policies for emergency_exit_calculations
CREATE POLICY "Users can view own emergency exit calculations"
ON public.emergency_exit_calculations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = emergency_exit_calculations.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create own emergency exit calculations"
ON public.emergency_exit_calculations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = emergency_exit_calculations.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update own emergency exit calculations"
ON public.emergency_exit_calculations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = emergency_exit_calculations.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete own emergency exit calculations"
ON public.emergency_exit_calculations FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = emergency_exit_calculations.project_id AND projects.user_id = auth.uid()
));

-- Triggers for updated_at
CREATE TRIGGER update_separation_calculations_updated_at
BEFORE UPDATE ON public.separation_calculations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_exit_calculations_updated_at
BEFORE UPDATE ON public.emergency_exit_calculations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();