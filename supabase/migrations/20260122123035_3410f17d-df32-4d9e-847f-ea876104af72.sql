-- Adicionar mais atividades CNAE para M-2, M-6 e M-7

-- M-2: Líquidos e gases combustíveis e inflamáveis (mais atividades)
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  -- Postos de combustíveis e derivados
  ('4731-8/00', 'Comércio varejista de combustíveis para veículos automotores', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('4732-6/00', 'Comércio varejista de lubrificantes', 'M', 'M-2', 800, 'MJ/m²', true, 'MT'),
  ('4784-9/00', 'Comércio varejista de gás liquefeito de petróleo (GLP)', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  
  -- Transporte e armazenagem de combustíveis
  ('4930-2/01', 'Transporte rodoviário de produtos perigosos', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('4930-2/02', 'Transporte rodoviário de combustíveis', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('4950-7/00', 'Trânsito e transporte por dutos', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('5212-5/00', 'Carga e descarga - terminais de combustíveis', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  
  -- Indústria química de combustíveis
  ('2021-5/00', 'Fabricação de produtos petroquímicos básicos', 'M', 'M-2', 1500, 'MJ/m²', true, 'MT'),
  ('2029-1/00', 'Fabricação de produtos químicos orgânicos não especificados', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('2051-7/00', 'Fabricação de defensivos agrícolas', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('2061-4/00', 'Fabricação de sabões e detergentes sintéticos', 'M', 'M-2', 800, 'MJ/m²', true, 'MT'),
  ('2062-2/00', 'Fabricação de produtos de limpeza e polimento', 'M', 'M-2', 800, 'MJ/m²', true, 'MT'),
  ('2063-1/00', 'Fabricação de cosméticos, produtos de perfumaria e de higiene pessoal', 'M', 'M-2', 700, 'MJ/m²', true, 'MT'),
  ('2071-1/00', 'Fabricação de tintas, vernizes, esmaltes e lacas', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT'),
  ('2072-0/00', 'Fabricação de tintas de impressão', 'M', 'M-2', 900, 'MJ/m²', true, 'MT'),
  ('2073-8/00', 'Fabricação de impermeabilizantes, solventes e produtos afins', 'M', 'M-2', 1200, 'MJ/m²', true, 'MT'),
  ('2091-6/00', 'Fabricação de adesivos e selantes', 'M', 'M-2', 900, 'MJ/m²', true, 'MT'),
  
  -- Gases industriais
  ('2014-2/00', 'Fabricação de gases industriais', 'M', 'M-2', 800, 'MJ/m²', true, 'MT'),
  ('5250-8/02', 'Atividades de operador de terminal de gás', 'M', 'M-2', 1000, 'MJ/m²', true, 'MT')
ON CONFLICT DO NOTHING;

-- M-6: Locais com restrição de movimentação (mais atividades)
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  -- Estabelecimentos de saúde com internação
  ('8610-1/01', 'Atividades de atendimento hospitalar - UTI', 'M', 'M-6', 400, 'MJ/m²', true, 'MT'),
  ('8610-1/02', 'Atividades de atendimento em pronto-socorro e unidades hospitalares para atendimento a urgências', 'M', 'M-6', 400, 'MJ/m²', true, 'MT'),
  ('8621-6/01', 'UTI móvel', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8621-6/02', 'Serviços móveis de atendimento a urgências, exceto por UTI móvel', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/01', 'Laboratórios de anatomia patológica e citológica', 'M', 'M-6', 400, 'MJ/m²', true, 'MT'),
  ('8640-2/02', 'Laboratórios clínicos', 'M', 'M-6', 400, 'MJ/m²', true, 'MT'),
  ('8640-2/03', 'Serviços de diálise e nefrologia', 'M', 'M-6', 350, 'MJ/m²', true, 'MT'),
  ('8640-2/04', 'Serviços de tomografia', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/05', 'Serviços de diagnóstico por imagem com uso de radiação ionizante', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/06', 'Serviços de ressonância magnética', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/07', 'Serviços de diagnóstico por imagem sem uso de radiação ionizante', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/08', 'Serviços de diagnóstico por registro gráfico - ECG, EEG', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/09', 'Serviços de diagnóstico por métodos ópticos - endoscopia', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/10', 'Serviços de quimioterapia', 'M', 'M-6', 350, 'MJ/m²', true, 'MT'),
  ('8640-2/11', 'Serviços de radioterapia', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/12', 'Serviços de hemoterapia', 'M', 'M-6', 350, 'MJ/m²', true, 'MT'),
  ('8640-2/13', 'Serviços de litotripsia', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8640-2/14', 'Serviços de bancos de células e tecidos humanos', 'M', 'M-6', 350, 'MJ/m²', true, 'MT'),
  
  -- Instituições de acolhimento
  ('8730-1/01', 'Orfanatos', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8730-1/02', 'Albergues assistenciais', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8730-1/99', 'Atividades de assistência social prestadas em residências coletivas e particulares', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  
  -- Restrição de liberdade
  ('8423-0/00', 'Justiça - casas de detenção e custódia', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8424-8/00', 'Segurança e ordem pública - unidades prisionais', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  
  -- Reabilitação
  ('8650-0/01', 'Atividades de enfermagem', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8650-0/02', 'Atividades de profissionais da nutrição', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8650-0/03', 'Atividades de psicologia e psicanálise', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8650-0/04', 'Atividades de fisioterapia', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8650-0/05', 'Atividades de terapia ocupacional', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8650-0/06', 'Atividades de fonoaudiologia', 'M', 'M-6', 300, 'MJ/m²', true, 'MT'),
  ('8650-0/07', 'Atividades de terapia de nutrição enteral e parenteral', 'M', 'M-6', 350, 'MJ/m²', true, 'MT')
ON CONFLICT DO NOTHING;

-- M-7: Edificações especiais (mais atividades)
INSERT INTO regulation_activities (code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant, state_iso)
VALUES 
  -- Torres e antenas
  ('6190-6/01', 'Provedores de acesso às redes de comunicações - torres de telecomunicações', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('6190-6/02', 'Provedores de voz sobre protocolo internet (VOIP)', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('6190-6/99', 'Outras atividades de telecomunicações - infraestrutura de rede', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  
  -- Instalações portuárias e aeroportuárias
  ('5211-7/99', 'Depósitos de mercadorias para terceiros, exceto armazéns gerais e guarda-móveis - terminais portuários', 'M', 'M-7', 600, 'MJ/m²', true, 'MT'),
  ('5231-1/01', 'Administração da infraestrutura portuária', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  ('5231-1/02', 'Atividades do operador portuário', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  ('5231-1/03', 'Gestão de terminais aquaviários', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  ('5232-0/00', 'Atividades de agenciamento marítimo', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('5239-7/01', 'Serviços de praticagem', 'M', 'M-7', 300, 'MJ/m²', false, 'MT'),
  ('5240-1/01', 'Operação dos aeroportos e campos de aterrissagem', 'M', 'M-7', 600, 'MJ/m²', true, 'MT'),
  ('5240-1/99', 'Atividades auxiliares dos transportes aéreos', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  
  -- Subestações e instalações elétricas
  ('3514-0/00', 'Distribuição de energia elétrica - subestações', 'M', 'M-7', 500, 'MJ/m²', true, 'MT'),
  ('3513-1/00', 'Comércio atacadista de energia elétrica', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('3512-3/00', 'Transmissão de energia elétrica - linhas de transmissão', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  
  -- Mineração e extração
  ('0710-3/01', 'Extração de minério de ferro', 'M', 'M-7', 300, 'MJ/m²', false, 'MT'),
  ('0710-3/02', 'Pelotização, sinterização e outros beneficiamentos de minério de ferro', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('0721-9/01', 'Extração de minério de alumínio', 'M', 'M-7', 300, 'MJ/m²', false, 'MT'),
  ('0721-9/02', 'Beneficiamento de minério de alumínio', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('0891-6/00', 'Extração de minerais para fabricação de adubos, fertilizantes e produtos químicos', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('0892-4/01', 'Extração de sal marinho', 'M', 'M-7', 200, 'MJ/m²', false, 'MT'),
  ('0892-4/02', 'Extração de sal-gema', 'M', 'M-7', 200, 'MJ/m²', false, 'MT'),
  ('0892-4/03', 'Refino e outros tratamentos do sal', 'M', 'M-7', 300, 'MJ/m²', false, 'MT'),
  
  -- Tratamento de água e esgoto
  ('3600-6/01', 'Captação, tratamento e distribuição de água - ETA', 'M', 'M-7', 300, 'MJ/m²', false, 'MT'),
  ('3600-6/02', 'Distribuição de água por caminhões', 'M', 'M-7', 200, 'MJ/m²', false, 'MT'),
  ('3701-1/00', 'Gestão de redes de esgoto - ETE', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('3702-9/00', 'Atividades relacionadas a esgoto, exceto a gestão de redes', 'M', 'M-7', 400, 'MJ/m²', true, 'MT'),
  ('3811-4/00', 'Coleta de resíduos não-perigosos - usinas de reciclagem', 'M', 'M-7', 600, 'MJ/m²', true, 'MT'),
  ('3812-2/00', 'Coleta de resíduos perigosos', 'M', 'M-7', 800, 'MJ/m²', true, 'MT'),
  ('3821-1/00', 'Tratamento e disposição de resíduos não-perigosos', 'M', 'M-7', 600, 'MJ/m²', true, 'MT'),
  ('3822-0/00', 'Tratamento e disposição de resíduos perigosos', 'M', 'M-7', 1000, 'MJ/m²', true, 'MT')
ON CONFLICT DO NOTHING;