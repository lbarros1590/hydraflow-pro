-- Add more states to available_states
INSERT INTO available_states (code, name, is_active, regulations_version) VALUES
('GO', 'Goiás', false, NULL),
('SP', 'São Paulo', false, NULL),
('RJ', 'Rio de Janeiro', false, NULL),
('MG', 'Minas Gerais', false, NULL),
('DF', 'Distrito Federal', false, NULL),
('PR', 'Paraná', false, NULL),
('SC', 'Santa Catarina', false, NULL),
('RS', 'Rio Grande do Sul', false, NULL),
('BA', 'Bahia', false, NULL),
('PE', 'Pernambuco', false, NULL),
('CE', 'Ceará', false, NULL),
('PA', 'Pará', false, NULL),
('AM', 'Amazonas', false, NULL),
('ES', 'Espírito Santo', false, NULL),
('MS', 'Mato Grosso do Sul', false, NULL)
ON CONFLICT (code) DO NOTHING;

-- Create table for state-specific regulations/documents
CREATE TABLE IF NOT EXISTS state_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL REFERENCES available_states(code) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  content_text TEXT,
  version TEXT,
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(state_code, code)
);

-- Enable RLS
ALTER TABLE state_regulations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read regulations
CREATE POLICY "Anyone can view regulations" ON state_regulations
FOR SELECT USING (true);

-- Only admins can manage regulations
CREATE POLICY "Admins can manage regulations" ON state_regulations
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for regulation PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('regulations', 'regulations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for regulations bucket
CREATE POLICY "Anyone can view regulation files"
ON storage.objects FOR SELECT
USING (bucket_id = 'regulations');

CREATE POLICY "Admins can upload regulation files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'regulations' AND public.has_role(auth.uid(), 'admin'));

-- Insert default NTCB regulations for MT
INSERT INTO state_regulations (state_code, code, title, description, category) VALUES
('MT', 'NTCB 01', 'Procedimentos Administrativos', 'Procedimentos para aprovação de projetos de PSCIP', 'Administrativo'),
('MT', 'NTCB 08', 'Saídas de Emergência', 'Dimensionamento de rotas de fuga e saídas de emergência', 'Arquitetônico'),
('MT', 'NTCB 19', 'Sistema de Hidrantes', 'Projeto e instalação de sistemas de hidrantes e mangotinhos', 'Hidráulico'),
('MT', 'NTCB 20', 'Chuveiros Automáticos', 'Sistemas de sprinklers automáticos', 'Hidráulico'),
('MT', 'NTCB 22', 'Extintores', 'Proteção por extintores de incêndio', 'Proteção'),
('MT', 'NTCB 23', 'Sinalização de Emergência', 'Sinalização de segurança contra incêndio', 'Sinalização'),
('MT', 'NTCB 25', 'Iluminação de Emergência', 'Sistemas de iluminação de emergência', 'Elétrico'),
('MT', 'NTCB 27', 'Alarme de Incêndio', 'Sistemas de detecção e alarme de incêndio', 'Eletrônico')
ON CONFLICT (state_code, code) DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_state_regulations_updated_at
BEFORE UPDATE ON state_regulations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();