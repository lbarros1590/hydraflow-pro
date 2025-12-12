-- TAREFA 1: Tabela regulation_activities (Regulation Engine)
-- Permite consulta dinâmica de atividades por estado

CREATE TABLE public.regulation_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_iso varchar(5) NOT NULL DEFAULT 'MT',
  code varchar(50) NOT NULL,
  description text NOT NULL,
  occupancy_group varchar(5) NOT NULL,
  occupancy_division varchar(10) NOT NULL,
  fire_load_value integer NOT NULL,
  fire_load_unit varchar(20) NOT NULL DEFAULT 'MJ/m²',
  is_risk_determinant boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para busca eficiente
CREATE INDEX idx_regulation_activities_state ON public.regulation_activities(state_iso);
CREATE INDEX idx_regulation_activities_code ON public.regulation_activities(code);
CREATE INDEX idx_regulation_activities_division ON public.regulation_activities(occupancy_division);
CREATE INDEX idx_regulation_activities_description ON public.regulation_activities USING gin(to_tsvector('portuguese', description));

-- Enable RLS
ALTER TABLE public.regulation_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública para autenticados
CREATE POLICY "Authenticated users can read activities"
ON public.regulation_activities
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins podem gerenciar
CREATE POLICY "Admins can manage activities"
ON public.regulation_activities
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_regulation_activities_updated_at
BEFORE UPDATE ON public.regulation_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- SEED DATA: Dados iniciais da NTCB 07/2020 (MT)
INSERT INTO public.regulation_activities (state_iso, code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant) VALUES
-- Grupo A - Residencial
('MT', 'A-2', 'Habitação multifamiliar - Edifícios de apartamentos', 'A', 'A-2', 300, 'MJ/m²', false),
('MT', 'A-3', 'Habitação coletiva - Pensionatos, internatos, alojamentos', 'A', 'A-3', 300, 'MJ/m²', false),

-- Grupo C - Comercial
('MT', 'C-2-VESTUARIO', 'Comércio varejista - Lojas de vestuário, calçados, tecidos', 'C', 'C-2', 300, 'MJ/m²', false),
('MT', 'C-2-MOVEIS', 'Comércio varejista - Lojas de móveis', 'C', 'C-2', 500, 'MJ/m²', false),
('MT', 'C-2-PNEUS', 'Comércio varejista - Lojas de pneus e borrachas', 'C', 'C-2', 1200, 'MJ/m²', true),
('MT', 'C-2-TINTAS', 'Comércio varejista - Lojas de tintas e vernizes', 'C', 'C-2', 1000, 'MJ/m²', true),
('MT', 'C-3', 'Shopping centers - Centro de compras', 'C', 'C-3', 600, 'MJ/m²', false),

-- Grupo D - Serviços Profissionais
('MT', 'D-1', 'Prestação de serviços - Escritórios em geral', 'D', 'D-1', 700, 'MJ/m²', false),
('MT', 'D-2', 'Agência bancária', 'D', 'D-2', 300, 'MJ/m²', false),
('MT', 'D-4', 'Laboratório - Laboratórios de análises', 'D', 'D-4', 500, 'MJ/m²', false),

-- Grupo E - Educacional
('MT', 'E-1', 'Escola em geral - Escolas de 1º, 2º e 3º graus', 'E', 'E-1', 300, 'MJ/m²', false),
('MT', 'E-5', 'Pré-escola - Creches, jardins de infância', 'E', 'E-5', 300, 'MJ/m²', false),

-- Grupo F - Reunião de Público
('MT', 'F-5', 'Arte cênica - Teatros, cinemas, auditórios', 'F', 'F-5', 500, 'MJ/m²', false),
('MT', 'F-8', 'Local para refeição - Restaurantes, lanchonetes, bares', 'F', 'F-8', 300, 'MJ/m²', false),
('MT', 'F-11', 'Boates - Casas noturnas, discotecas', 'F', 'F-11', 300, 'MJ/m²', true),

-- Grupo H - Saúde
('MT', 'H-3', 'Hospital - Hospitais e assemelhados', 'H', 'H-3', 300, 'MJ/m²', true),
('MT', 'H-6', 'Clínicas médicas - Consultórios, ambulatórios', 'H', 'H-6', 300, 'MJ/m²', false),

-- Grupo I - Industrial
('MT', 'I-1', 'Industrial baixo potencial - Até 300 MJ/m²', 'I', 'I-1', 300, 'MJ/m²', false),
('MT', 'I-2-MADEIRA', 'Industrial - Fabricação de móveis de madeira', 'I', 'I-2', 800, 'MJ/m²', true),
('MT', 'I-3', 'Industrial alto potencial - Acima de 1200 MJ/m²', 'I', 'I-3', 1500, 'MJ/m²', true),

-- Grupo J - Depósitos
('MT', 'J-2', 'Depósito baixa carga - Até 300 MJ/m²', 'J', 'J-2', 300, 'MJ/m²', false),
('MT', 'J-3-MADEIRA', 'Depósito de madeira - Madeira serrada, compensados', 'J', 'J-3', 800, 'MJ/m²', true),
('MT', 'J-4', 'Depósito alta carga - Acima de 1200 MJ/m²', 'J', 'J-4', 1500, 'MJ/m²', true);
