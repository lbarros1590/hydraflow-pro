-- Adicionar divisões M-2, M-6 e M-7 do Grupo M (Especial) conforme NTCB 01/2025

-- M-2: Líquidos e gases combustíveis e inflamáveis
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  ('4681-8/01', 'Comércio atacadista de álcool carburante, biodiesel, gasolina', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('4681-8/02', 'Comércio atacadista de combustíveis realizado por TRR', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('4681-8/03', 'Comércio atacadista de combustíveis de origem vegetal', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('4681-8/04', 'Comércio atacadista de combustíveis de origem mineral em bruto', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('4681-8/05', 'Comércio atacadista de lubrificantes', 'M', 'M-2', 800, 'MJ/m²', true, 'MT'),
  ('4682-6/00', 'Comércio atacadista de gás liquefeito de petróleo (GLP)', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('3520-5/01', 'Produção de gás; processamento de gás natural', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('3520-5/02', 'Distribuição de combustíveis gasosos por redes urbanas', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('1921-7/00', 'Fabricação de produtos do refino de petróleo', 'M', 'M-2', 1500, 'MJ/m²', true, 'MT'),
  ('1922-5/01', 'Formulação de combustíveis', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('1922-5/02', 'Rerrefino de óleos lubrificantes', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('1931-4/00', 'Fabricação de álcool', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('1932-2/00', 'Fabricação de biocombustíveis', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT')
ON CONFLICT DO NOTHING;

-- M-6: Locais com restrição de movimentação
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  ('8711-5/01', 'Clínicas e residências geriátricas com restrição de mobilidade', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8711-5/02', 'Instituições de longa permanência para idosos', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8711-5/03', 'Atividades de assistência a deficientes físicos, imunodeprimidos e convalescentes', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8711-5/04', 'Centros de apoio a pacientes com câncer e AIDS', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8711-5/05', 'Condomínios residenciais para idosos com serviços assistenciais', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8720-4/01', 'Atividades de centros de assistência psicossocial', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8720-4/99', 'Atividades de assistência psicossocial e à saúde a portadores de distúrbios psíquicos', 'M', 'M-6', 300, 'MJ/m²', true, 'MT')
ON CONFLICT DO NOTHING;

-- M-7: Edificações especiais (torres de transmissão, plataformas, etc.)
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  ('4222-7/01', 'Construção de redes de abastecimento de água, coleta de esgoto', 'M', 'M-7', 200, 'MJ/m²', false, 'MT'),
  ('4222-7/02', 'Construção de redes de transportes por dutos', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  ('4221-9/01', 'Construção de barragens e represas para geração de energia', 'M', 'M-7', 300, 'MJ/m²', false, 'MT'),
  ('4221-9/02', 'Construção de estações e redes de distribuição de energia', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('4221-9/03', 'Manutenção de redes de distribuição de energia elétrica', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('4221-9/04', 'Construção de estações e redes de telecomunicações', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  ('4221-9/05', 'Manutenção de estações e redes de telecomunicações', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  ('0600-0/01', 'Extração de petróleo e gás natural (plataformas)', 'M', 'M-7', 1500, 'MJ/m²', true, 'MT'),
  ('0600-0/02', 'Extração e beneficiamento de xisto', 'M', 'M-7', 1200, 'MJ/m²', true, 'MT'),
  ('0600-0/03', 'Extração e beneficiamento de areias betuminosas', 'M', 'M-7', 1200, 'MJ/m²', true, 'MT')
ON CONFLICT DO NOTHING;