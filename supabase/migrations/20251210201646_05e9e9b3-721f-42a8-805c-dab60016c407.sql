-- Ativar todos os estados do Brasil
UPDATE available_states SET is_active = true;

-- Inserir estados que podem estar faltando
INSERT INTO available_states (code, name, is_active, regulations_version) VALUES
  ('AC', 'Acre', true, 'NTCB 2020'),
  ('AL', 'Alagoas', true, 'NTCB 2020'),
  ('AP', 'Amapá', true, 'NTCB 2020'),
  ('AM', 'Amazonas', true, 'NTCB 2020'),
  ('BA', 'Bahia', true, 'NTCB 2020'),
  ('CE', 'Ceará', true, 'NTCB 2020'),
  ('DF', 'Distrito Federal', true, 'NTCB 2020'),
  ('ES', 'Espírito Santo', true, 'NTCB 2020'),
  ('GO', 'Goiás', true, 'NTCB 2020'),
  ('MA', 'Maranhão', true, 'NTCB 2020'),
  ('MG', 'Minas Gerais', true, 'NTCB 2020'),
  ('MS', 'Mato Grosso do Sul', true, 'NTCB 2020'),
  ('PA', 'Pará', true, 'NTCB 2020'),
  ('PB', 'Paraíba', true, 'NTCB 2020'),
  ('PR', 'Paraná', true, 'NTCB 2020'),
  ('PE', 'Pernambuco', true, 'NTCB 2020'),
  ('PI', 'Piauí', true, 'NTCB 2020'),
  ('RJ', 'Rio de Janeiro', true, 'NTCB 2020'),
  ('RN', 'Rio Grande do Norte', true, 'NTCB 2020'),
  ('RS', 'Rio Grande do Sul', true, 'NTCB 2020'),
  ('RO', 'Rondônia', true, 'NTCB 2020'),
  ('RR', 'Roraima', true, 'NTCB 2020'),
  ('SC', 'Santa Catarina', true, 'NTCB 2020'),
  ('SP', 'São Paulo', true, 'IT 2019'),
  ('SE', 'Sergipe', true, 'NTCB 2020'),
  ('TO', 'Tocantins', true, 'NTCB 2020')
ON CONFLICT (code) DO UPDATE SET is_active = true;