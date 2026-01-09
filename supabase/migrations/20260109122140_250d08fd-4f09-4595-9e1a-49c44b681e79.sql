-- Adicionar ocupações dos Grupos L (Explosivos) e M (Especial) que faltam no banco de dados
-- Baseado em NTCB 07/2020 e NTCB 01/2025

-- GRUPO L - EXPLOSIVOS
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  ('4789-0/06', 'Comércio varejista de fogos de artifício e artigos pirotécnicos', 'L', 'L-1', 500, 'MJ/m²', true, 'MT'),
  ('4789-0/99', 'Comércio varejista de explosivos e acessórios', 'L', 'L-1', 500, 'MJ/m²', true, 'MT'),
  ('2092-4/01', 'Fabricação de pólvoras, explosivos e detonantes', 'L', 'L-2', 1000, 'MJ/m²', true, 'MT'),
  ('2092-4/02', 'Fabricação de artigos pirotécnicos', 'L', 'L-2', 1000, 'MJ/m²', true, 'MT'),
  ('2092-4/03', 'Fabricação de fósforos de segurança', 'L', 'L-2', 800, 'MJ/m²', true, 'MT'),
  ('2550-1/02', 'Fabricação de armas de fogo e munições', 'L', 'L-2', 1000, 'MJ/m²', true, 'MT'),
  ('5212-5/00', 'Depósito de explosivos e inflamáveis', 'L', 'L-3', 1000, 'MJ/m²', true, 'MT'),
  ('5250-8/01', 'Comércio atacadista de fogos de artifício', 'L', 'L-3', 800, 'MJ/m²', true, 'MT')
ON CONFLICT DO NOTHING;

-- GRUPO M - ESPECIAL
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  ('4291-0/00', 'Obras de engenharia civil - Túneis', 'M', 'M-1', 300, 'MJ/m²', true, 'MT'),
  ('4120-4/00', 'Construção de edifícios', 'M', 'M-4', 500, 'MJ/m²', true, 'MT'),
  ('4211-1/01', 'Construção de rodovias e ferrovias', 'M', 'M-4', 500, 'MJ/m²', true, 'MT'),
  ('6110-8/01', 'Serviços de telefonia fixa comutada (STFC)', 'M', 'M-3', 600, 'MJ/m²', true, 'MT'),
  ('6120-5/01', 'Telefonia móvel celular', 'M', 'M-3', 600, 'MJ/m²', true, 'MT'),
  ('6130-2/00', 'Telecomunicações por satélite', 'M', 'M-3', 600, 'MJ/m²', true, 'MT'),
  ('6141-8/00', 'Operadoras de televisão por assinatura por cabo', 'M', 'M-3', 500, 'MJ/m²', true, 'MT'),
  ('6311-9/00', 'Tratamento de dados, provedores de serviços de aplicação e hospedagem (data centers)', 'M', 'M-3', 700, 'MJ/m²', true, 'MT'),
  ('5211-7/01', 'Armazéns gerais - emissão de warrant (silos)', 'M', 'M-5', 800, 'MJ/m²', true, 'MT'),
  ('5211-7/02', 'Guarda-móveis', 'M', 'M-5', 700, 'MJ/m²', true, 'MT'),
  ('0161-0/01', 'Serviços de pulverização e controle de pragas agrícolas (hangares agrícolas)', 'M', 'M-5', 600, 'MJ/m²', true, 'MT'),
  ('3511-5/01', 'Geração de energia elétrica (parques eólicos)', 'M', 'M-8', 100, 'MJ/m²', false, 'MT'),
  ('3511-5/02', 'Atividades de coordenação e controle de energia elétrica', 'M', 'M-8', 100, 'MJ/m²', false, 'MT'),
  ('3519-1/00', 'Geração de energia elétrica de outras fontes (solar)', 'M', 'M-8', 100, 'MJ/m²', false, 'MT')
ON CONFLICT DO NOTHING;