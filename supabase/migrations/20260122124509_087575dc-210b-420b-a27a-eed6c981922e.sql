
-- Adicionar mais atividades para Grupo A - Residencial
INSERT INTO public.regulation_activities (state_iso, code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant)
VALUES
  -- A-1: Habitação Unifamiliar
  ('MT', '4110-7/00', 'Incorporação de empreendimentos imobiliários residenciais unifamiliares', 'A', 'A-1', 300, 'MJ/m²', false),
  ('MT', '4120-4/00', 'Construção de edifícios residenciais unifamiliares', 'A', 'A-1', 300, 'MJ/m²', false),
  ('MT', '6810-2/02', 'Aluguel de imóveis próprios residenciais unifamiliares', 'A', 'A-1', 300, 'MJ/m²', false),
  ('MT', '6821-8/01', 'Corretagem na compra e venda de imóveis residenciais', 'A', 'A-1', 300, 'MJ/m²', false),
  ('MT', '4399-1/03', 'Obras de acabamento em casas residenciais', 'A', 'A-1', 300, 'MJ/m²', false),
  
  -- A-2: Habitação Multifamiliar
  ('MT', '4110-7/01', 'Incorporação de empreendimentos imobiliários multifamiliares', 'A', 'A-2', 300, 'MJ/m²', false),
  ('MT', '4120-4/01', 'Construção de edifícios residenciais multifamiliares', 'A', 'A-2', 300, 'MJ/m²', false),
  ('MT', '6810-2/03', 'Aluguel de imóveis próprios residenciais multifamiliares', 'A', 'A-2', 300, 'MJ/m²', false),
  ('MT', '8111-7/00', 'Serviços combinados para apoio a edifícios residenciais', 'A', 'A-2', 200, 'MJ/m²', false),
  ('MT', '8121-4/00', 'Limpeza em prédios e domicílios residenciais', 'A', 'A-2', 200, 'MJ/m²', false),
  ('MT', '4329-1/01', 'Instalação de sistema de prevenção contra incêndio residencial', 'A', 'A-2', 300, 'MJ/m²', false),
  ('MT', '4321-5/00', 'Instalação e manutenção elétrica em edifícios residenciais', 'A', 'A-2', 300, 'MJ/m²', false),
  
  -- A-3: Habitação Coletiva
  ('MT', '5510-8/01', 'Albergues e alojamentos para trabalhadores', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '5590-6/01', 'Albergues juvenis', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '5590-6/02', 'Campings e acampamentos', 'A', 'A-3', 200, 'MJ/m²', false),
  ('MT', '8711-5/01', 'Clínicas e residências geriátricas com alojamento', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '8711-5/02', 'Instituições de longa permanência para idosos - ILPI', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '8730-1/01', 'Orfanatos e abrigos para crianças', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '8730-1/02', 'Albergues assistenciais', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '8711-5/03', 'Casas de repouso para idosos', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '8711-5/04', 'Centros de convivência para idosos com dormitório', 'A', 'A-3', 300, 'MJ/m²', false),
  ('MT', '8720-4/01', 'Residências terapêuticas', 'A', 'A-3', 300, 'MJ/m²', false)
ON CONFLICT DO NOTHING;

-- Adicionar mais atividades para Grupo G - Serviços Automotivos
INSERT INTO public.regulation_activities (state_iso, code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant)
VALUES
  -- G-1: Garagem sem acesso ao público
  ('MT', '5223-1/00', 'Estacionamento de veículos automatizado', 'G', 'G-1', 200, 'MJ/m²', false),
  ('MT', '5229-0/01', 'Serviços de reboque de veículos com garagem própria', 'G', 'G-1', 300, 'MJ/m²', false),
  ('MT', '4930-2/01', 'Transporte rodoviário de carga com garagem própria', 'G', 'G-1', 300, 'MJ/m²', false),
  ('MT', '4921-3/01', 'Transporte rodoviário coletivo com garagem de ônibus', 'G', 'G-1', 300, 'MJ/m²', false),
  ('MT', '4922-1/01', 'Transporte rodoviário de passageiros com garagem', 'G', 'G-1', 300, 'MJ/m²', false),
  ('MT', '5212-5/00', 'Carga e descarga com estacionamento de veículos', 'G', 'G-1', 300, 'MJ/m²', false),
  
  -- G-2: Garagem com acesso ao público
  ('MT', '5223-1/01', 'Estacionamento rotativo de veículos', 'G', 'G-2', 200, 'MJ/m²', false),
  ('MT', '5223-1/02', 'Estacionamento de shopping centers', 'G', 'G-2', 200, 'MJ/m²', false),
  ('MT', '5223-1/03', 'Estacionamento de hospitais e clínicas', 'G', 'G-2', 200, 'MJ/m²', false),
  ('MT', '5223-1/04', 'Estacionamento de aeroportos', 'G', 'G-2', 200, 'MJ/m²', false),
  ('MT', '5223-1/05', 'Estacionamento de terminais rodoviários', 'G', 'G-2', 200, 'MJ/m²', false),
  ('MT', '7711-0/00', 'Locação de automóveis sem condutor', 'G', 'G-2', 200, 'MJ/m²', false),
  ('MT', '7719-5/01', 'Locação de embarcações com garagem', 'G', 'G-2', 300, 'MJ/m²', false),
  
  -- G-3: Locais para abastecimento de veículos
  ('MT', '4731-8/01', 'Comércio varejista de gasolina - posto de combustível', 'G', 'G-3', 700, 'MJ/m²', true),
  ('MT', '4731-8/02', 'Comércio varejista de diesel e biodiesel', 'G', 'G-3', 700, 'MJ/m²', true),
  ('MT', '4731-8/03', 'Comércio varejista de GNV (gás natural veicular)', 'G', 'G-3', 1000, 'MJ/m²', true),
  ('MT', '4731-8/04', 'Comércio varejista de álcool combustível', 'G', 'G-3', 700, 'MJ/m²', true),
  ('MT', '4731-8/05', 'Posto de abastecimento de veículos elétricos', 'G', 'G-3', 300, 'MJ/m²', false),
  ('MT', '4784-9/00', 'Comércio varejista de GLP (gás liquefeito) em botijões', 'G', 'G-3', 1000, 'MJ/m²', true),
  ('MT', '5250-8/04', 'Organização logística do transporte de cargas com abastecimento', 'G', 'G-3', 700, 'MJ/m²', true),
  
  -- G-4: Serviços de conservação e reparação de veículos
  ('MT', '4520-0/01', 'Serviços de manutenção e reparação mecânica de veículos', 'G', 'G-4', 400, 'MJ/m²', false),
  ('MT', '4520-0/02', 'Serviços de lanternagem ou funilaria', 'G', 'G-4', 500, 'MJ/m²', false),
  ('MT', '4520-0/03', 'Serviços de pintura de veículos automotores', 'G', 'G-4', 700, 'MJ/m²', true),
  ('MT', '4520-0/04', 'Serviços de borracharia para veículos', 'G', 'G-4', 500, 'MJ/m²', false),
  ('MT', '4520-0/05', 'Serviços de alinhamento e balanceamento', 'G', 'G-4', 300, 'MJ/m²', false),
  ('MT', '4520-0/06', 'Serviços de lavagem e polimento de veículos', 'G', 'G-4', 200, 'MJ/m²', false),
  ('MT', '4520-0/07', 'Serviços de instalação de acessórios automotivos', 'G', 'G-4', 400, 'MJ/m²', false),
  ('MT', '4520-0/08', 'Serviços de vidraçaria e capotaria para veículos', 'G', 'G-4', 500, 'MJ/m²', false),
  ('MT', '4530-7/01', 'Comércio por atacado de peças e acessórios novos', 'G', 'G-4', 400, 'MJ/m²', false),
  ('MT', '4530-7/02', 'Comércio por atacado de pneumáticos e câmaras-de-ar', 'G', 'G-4', 600, 'MJ/m²', false),
  ('MT', '4541-2/01', 'Comércio por atacado de motocicletas', 'G', 'G-4', 400, 'MJ/m²', false),
  ('MT', '4541-2/02', 'Comércio por atacado de peças para motocicletas', 'G', 'G-4', 400, 'MJ/m²', false),
  ('MT', '4543-9/00', 'Manutenção e reparação de motocicletas', 'G', 'G-4', 400, 'MJ/m²', false),
  ('MT', '3312-1/02', 'Manutenção e reparação de máquinas agrícolas', 'G', 'G-4', 400, 'MJ/m²', false),
  
  -- G-5: Hangares
  ('MT', '5111-1/00', 'Transporte aéreo de passageiros regular com hangar', 'G', 'G-5', 500, 'MJ/m²', false),
  ('MT', '5112-9/00', 'Transporte aéreo de passageiros não-regular com hangar', 'G', 'G-5', 500, 'MJ/m²', false),
  ('MT', '5120-0/00', 'Transporte aéreo de carga com hangar', 'G', 'G-5', 600, 'MJ/m²', false),
  ('MT', '5130-7/00', 'Transporte espacial com hangar', 'G', 'G-5', 800, 'MJ/m²', true),
  ('MT', '3316-4/01', 'Manutenção e reparação de aeronaves exceto motores', 'G', 'G-5', 600, 'MJ/m²', false),
  ('MT', '3316-4/02', 'Manutenção e reparação de motores de aeronaves', 'G', 'G-5', 700, 'MJ/m²', false),
  ('MT', '3041-5/00', 'Fabricação de aeronaves', 'G', 'G-5', 800, 'MJ/m²', true),
  ('MT', '3042-3/00', 'Fabricação de turbinas, motores e peças para aeronaves', 'G', 'G-5', 800, 'MJ/m²', true),
  ('MT', '5240-1/01', 'Operação de aeroportos e campos de aterrissagem', 'G', 'G-5', 500, 'MJ/m²', false)
ON CONFLICT DO NOTHING;

-- Adicionar mais atividades para Grupo J - Depósitos
INSERT INTO public.regulation_activities (state_iso, code, description, occupancy_group, occupancy_division, fire_load_value, fire_load_unit, is_risk_determinant)
VALUES
  -- J-1: Depósito de materiais incombustíveis
  ('MT', '5211-7/01', 'Armazéns gerais para materiais incombustíveis', 'J', 'J-1', 50, 'MJ/m²', false),
  ('MT', '5211-7/02', 'Guarda-móveis metálicos', 'J', 'J-1', 100, 'MJ/m²', false),
  ('MT', '0810-0/06', 'Extração de areia, cascalho e pedregulho', 'J', 'J-1', 50, 'MJ/m²', false),
  ('MT', '0810-0/07', 'Extração de argila e beneficiamento', 'J', 'J-1', 50, 'MJ/m²', false),
  ('MT', '2391-5/01', 'Britamento de pedras - depósito', 'J', 'J-1', 50, 'MJ/m²', false),
  ('MT', '2392-3/00', 'Aparelhamento de pedras para construção - depósito', 'J', 'J-1', 50, 'MJ/m²', false),
  ('MT', '2330-3/01', 'Depósito de cimento e argamassa', 'J', 'J-1', 100, 'MJ/m²', false),
  ('MT', '2320-6/00', 'Depósito de tijolos e telhas cerâmicas', 'J', 'J-1', 50, 'MJ/m²', false),
  ('MT', '4679-6/01', 'Comércio atacadista de materiais de construção incombustíveis', 'J', 'J-1', 100, 'MJ/m²', false),
  ('MT', '2341-9/00', 'Depósito de produtos cerâmicos refratários', 'J', 'J-1', 50, 'MJ/m²', false),
  
  -- J-2: Depósito de baixa carga de incêndio (até 300 MJ/m²)
  ('MT', '5211-7/03', 'Armazéns gerais para produtos em geral - baixa carga', 'J', 'J-2', 250, 'MJ/m²', false),
  ('MT', '5211-7/04', 'Depósito de móveis e objetos domésticos', 'J', 'J-2', 300, 'MJ/m²', false),
  ('MT', '4693-1/00', 'Comércio atacadista de mercadorias em geral', 'J', 'J-2', 300, 'MJ/m²', false),
  ('MT', '4639-7/01', 'Comércio atacadista de produtos alimentícios - baixa carga', 'J', 'J-2', 250, 'MJ/m²', false),
  ('MT', '4637-1/01', 'Comércio atacadista de café torrado - depósito', 'J', 'J-2', 300, 'MJ/m²', false),
  ('MT', '4632-0/01', 'Comércio atacadista de cereais e leguminosas', 'J', 'J-2', 250, 'MJ/m²', false),
  ('MT', '4634-6/01', 'Comércio atacadista de carnes bovinas e suínas', 'J', 'J-2', 200, 'MJ/m²', false),
  ('MT', '4634-6/02', 'Comércio atacadista de aves vivas e abatidas', 'J', 'J-2', 200, 'MJ/m²', false),
  ('MT', '4633-8/01', 'Comércio atacadista de frutas e verduras', 'J', 'J-2', 150, 'MJ/m²', false),
  ('MT', '4631-1/00', 'Comércio atacadista de leite e laticínios', 'J', 'J-2', 200, 'MJ/m²', false),
  ('MT', '4635-4/01', 'Comércio atacadista de água mineral', 'J', 'J-2', 100, 'MJ/m²', false),
  ('MT', '4635-4/02', 'Comércio atacadista de refrigerantes', 'J', 'J-2', 250, 'MJ/m²', false),
  ('MT', '5222-2/00', 'Terminais rodoviários e ferroviários de carga', 'J', 'J-2', 300, 'MJ/m²', false),
  
  -- J-3: Depósito de média carga de incêndio (301 a 1200 MJ/m²)
  ('MT', '5211-7/05', 'Armazéns gerais para produtos diversos - média carga', 'J', 'J-3', 600, 'MJ/m²', false),
  ('MT', '4671-1/00', 'Comércio atacadista de madeira e produtos derivados', 'J', 'J-3', 800, 'MJ/m²', true),
  ('MT', '4672-9/00', 'Comércio atacadista de ferragens e ferramentas', 'J', 'J-3', 400, 'MJ/m²', false),
  ('MT', '4673-7/00', 'Comércio atacadista de material elétrico', 'J', 'J-3', 500, 'MJ/m²', false),
  ('MT', '4674-5/00', 'Comércio atacadista de cimento', 'J', 'J-3', 400, 'MJ/m²', false),
  ('MT', '4681-8/01', 'Comércio atacadista de álcool carburante e biodiesel', 'J', 'J-3', 1000, 'MJ/m²', true),
  ('MT', '4681-8/02', 'Comércio atacadista de combustíveis realizado em TRR', 'J', 'J-3', 1000, 'MJ/m²', true),
  ('MT', '4683-4/00', 'Comércio atacadista de defensivos agrícolas', 'J', 'J-3', 800, 'MJ/m²', true),
  ('MT', '4684-2/01', 'Comércio atacadista de resinas e elastômeros', 'J', 'J-3', 900, 'MJ/m²', true),
  ('MT', '4684-2/02', 'Comércio atacadista de solventes', 'J', 'J-3', 1000, 'MJ/m²', true),
  ('MT', '4686-9/01', 'Comércio atacadista de papel e papelão em bruto', 'J', 'J-3', 700, 'MJ/m²', false),
  ('MT', '4686-9/02', 'Comércio atacadista de embalagens', 'J', 'J-3', 600, 'MJ/m²', false),
  ('MT', '4687-7/01', 'Comércio atacadista de resíduos de papel e papelão', 'J', 'J-3', 800, 'MJ/m²', true),
  ('MT', '4687-7/02', 'Comércio atacadista de resíduos e sucatas metálicos', 'J', 'J-3', 300, 'MJ/m²', false),
  ('MT', '4651-6/01', 'Comércio atacadista de equipamentos de informática', 'J', 'J-3', 500, 'MJ/m²', false),
  ('MT', '4652-4/00', 'Comércio atacadista de componentes eletrônicos', 'J', 'J-3', 600, 'MJ/m²', false),
  ('MT', '4641-9/01', 'Comércio atacadista de tecidos', 'J', 'J-3', 800, 'MJ/m²', true),
  ('MT', '4641-9/02', 'Comércio atacadista de artigos de cama, mesa e banho', 'J', 'J-3', 700, 'MJ/m²', false),
  ('MT', '4642-7/01', 'Comércio atacadista de roupas e acessórios para uso pessoal', 'J', 'J-3', 700, 'MJ/m²', false),
  ('MT', '4642-7/02', 'Comércio atacadista de roupas e acessórios para uso profissional', 'J', 'J-3', 700, 'MJ/m²', false),
  ('MT', '4649-4/01', 'Comércio atacadista de móveis e artigos de colchoaria', 'J', 'J-3', 800, 'MJ/m²', true),
  ('MT', '4649-4/02', 'Comércio atacadista de artigos de tapeçaria', 'J', 'J-3', 700, 'MJ/m²', false),
  
  -- J-4: Depósito de alta carga de incêndio (acima de 1200 MJ/m²)
  ('MT', '5211-7/06', 'Armazéns gerais para produtos inflamáveis', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '5211-7/07', 'Depósito de tintas, vernizes e solventes', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '4682-6/00', 'Comércio atacadista de gás liquefeito de petróleo (GLP)', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '4681-8/03', 'Comércio atacadista de gasolina', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '4681-8/04', 'Comércio atacadista de óleo diesel', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '4681-8/05', 'Comércio atacadista de querosene', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '4681-8/06', 'Comércio atacadista de óleo combustível', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '4681-8/07', 'Comércio atacadista de lubrificantes', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '2092-4/01', 'Depósito de fósforos', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '2092-4/02', 'Depósito de artigos pirotécnicos', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '1610-2/01', 'Depósito de madeira bruta', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '1610-2/02', 'Depósito de madeira serrada', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '1621-8/00', 'Depósito de madeira laminada e compensada', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '2029-1/00', 'Depósito de produtos químicos diversos', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '2063-1/00', 'Depósito de cosméticos, produtos de perfumaria e higiene', 'J', 'J-4', 1200, 'MJ/m²', true),
  ('MT', '2073-8/00', 'Depósito de impermeabilizantes, solventes e produtos afins', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '1710-9/00', 'Depósito de celulose e pasta mecânica', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '1721-4/00', 'Depósito de papel', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '2212-9/00', 'Depósito de pneus e câmaras-de-ar', 'J', 'J-4', 1500, 'MJ/m²', true),
  ('MT', '2219-6/00', 'Depósito de artefatos de borracha', 'J', 'J-4', 1400, 'MJ/m²', true),
  ('MT', '2229-3/01', 'Depósito de embalagens plásticas', 'J', 'J-4', 1300, 'MJ/m²', true),
  ('MT', '2229-3/02', 'Depósito de artefatos plásticos diversos', 'J', 'J-4', 1300, 'MJ/m²', true)
ON CONFLICT DO NOTHING;
