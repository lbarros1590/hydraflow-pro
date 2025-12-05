/**
 * NTCB 13/2020 - Tabelas de Densidade Populacional
 */

export interface OccupancyDensity {
  code: string;
  group: string;
  description: string;
  densityM2PerPerson: number;  // 1 pessoa por X m²
  densityDescription: string;
  notes?: string;
}

// Tabela 1 - NTCB 13/2020 - Dados para dimensionamento das saídas
export const OCCUPANCY_DENSITIES: OccupancyDensity[] = [
  // GRUPO A - RESIDENCIAL
  { code: 'A-1', group: 'Residencial', description: 'Habitação unifamiliar', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  { code: 'A-2', group: 'Residencial', description: 'Habitação multifamiliar', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  { code: 'A-3', group: 'Residencial', description: 'Habitação coletiva', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  
  // GRUPO B - SERVIÇOS DE HOSPEDAGEM
  { code: 'B-1', group: 'Hospedagem', description: 'Hotel', densityM2PerPerson: 15, densityDescription: '1 Pessoa/15m²' },
  { code: 'B-2', group: 'Hospedagem', description: 'Hotel residencial', densityM2PerPerson: 15, densityDescription: '1 Pessoa/15m²' },
  
  // GRUPO C - COMERCIAL
  { code: 'C-1', group: 'Comercial', description: 'Comércio com baixa carga de incêndio', densityM2PerPerson: 6, densityDescription: '1 Pessoa/6m²' },
  { code: 'C-2', group: 'Comercial', description: 'Comércio com média e alta carga de incêndio', densityM2PerPerson: 5, densityDescription: '1 Pessoa/5m²' },
  { code: 'C-3', group: 'Comercial', description: 'Shopping centers', densityM2PerPerson: 5, densityDescription: '1 Pessoa/5m²' },
  
  // GRUPO D - SERVIÇOS PROFISSIONAIS
  { code: 'D-1', group: 'Serviços', description: 'Local para prestação de serviço profissional', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  { code: 'D-2', group: 'Serviços', description: 'Agência bancária', densityM2PerPerson: 5, densityDescription: '1 Pessoa/5m²' },
  { code: 'D-3', group: 'Serviços', description: 'Serviço de reparação', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  { code: 'D-4', group: 'Serviços', description: 'Laboratório', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  
  // GRUPO E - EDUCACIONAL E CULTURA FÍSICA
  { code: 'E-1', group: 'Educacional', description: 'Escola em geral', densityM2PerPerson: 1.5, densityDescription: '1 Pessoa/1,5m²' },
  { code: 'E-2', group: 'Educacional', description: 'Escola especial', densityM2PerPerson: 1.5, densityDescription: '1 Pessoa/1,5m²' },
  { code: 'E-3', group: 'Educacional', description: 'Espaço para cultura física', densityM2PerPerson: 4, densityDescription: '1 Pessoa/4m²' },
  { code: 'E-4', group: 'Educacional', description: 'Centro de treinamento profissional', densityM2PerPerson: 1.5, densityDescription: '1 Pessoa/1,5m²' },
  { code: 'E-5', group: 'Educacional', description: 'Pré-escola', densityM2PerPerson: 3, densityDescription: '1 Pessoa/3m²' },
  { code: 'E-6', group: 'Educacional', description: 'Escola para portadores de deficiência', densityM2PerPerson: 3, densityDescription: '1 Pessoa/3m²' },
  
  // GRUPO F - LOCAIS DE REUNIÃO DE PÚBLICO
  { code: 'F-1', group: 'Reunião de Público', description: 'Local onde há objeto de valor', densityM2PerPerson: 3, densityDescription: '1 Pessoa/3m²' },
  { code: 'F-2', group: 'Reunião de Público', description: 'Templo religioso', densityM2PerPerson: 1, densityDescription: '1 Pessoa/1m²' },
  { code: 'F-3', group: 'Reunião de Público', description: 'Centro esportivo', densityM2PerPerson: 1.5, densityDescription: '1 Pessoa/1,5m²', notes: 'Conforme nº de assentos se houver' },
  { code: 'F-4', group: 'Reunião de Público', description: 'Estação e terminal de passageiro', densityM2PerPerson: 1.5, densityDescription: '1 Pessoa/1,5m²' },
  { code: 'F-5', group: 'Reunião de Público', description: 'Arte cênica e auditório', densityM2PerPerson: 1, densityDescription: '1 Pessoa/1m²', notes: 'Conforme nº de assentos' },
  { code: 'F-6', group: 'Reunião de Público', description: 'Clube social e diversão', densityM2PerPerson: 2, densityDescription: '1 Pessoa/2m²' },
  { code: 'F-7', group: 'Reunião de Público', description: 'Construção provisória', densityM2PerPerson: 1.5, densityDescription: '1 Pessoa/1,5m²' },
  { code: 'F-8', group: 'Reunião de Público', description: 'Local para refeição', densityM2PerPerson: 1, densityDescription: '1 Pessoa/1m²' },
  { code: 'F-9', group: 'Reunião de Público', description: 'Recreação pública', densityM2PerPerson: 1.5, densityDescription: '1 Pessoa/1,5m²' },
  { code: 'F-10', group: 'Reunião de Público', description: 'Exposição de objetos e animais', densityM2PerPerson: 3, densityDescription: '1 Pessoa/3m²' },
  { code: 'F-11', group: 'Reunião de Público', description: 'Local para recreação noturna', densityM2PerPerson: 1, densityDescription: '1 Pessoa/1m²' },
  
  // GRUPO G - SERVIÇOS AUTOMOTIVOS
  { code: 'G-1', group: 'Automotivo', description: 'Garagem sem acesso de público', densityM2PerPerson: 30, densityDescription: '1 Pessoa/30m²' },
  { code: 'G-2', group: 'Automotivo', description: 'Garagem com acesso de público', densityM2PerPerson: 30, densityDescription: '1 Pessoa/30m²' },
  { code: 'G-3', group: 'Automotivo', description: 'Serviço de conservação', densityM2PerPerson: 20, densityDescription: '1 Pessoa/20m²' },
  { code: 'G-4', group: 'Automotivo', description: 'Serviço de reparação', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  { code: 'G-5', group: 'Automotivo', description: 'Hangares', densityM2PerPerson: 50, densityDescription: '1 Pessoa/50m²' },
  
  // GRUPO H - SERVIÇOS DE SAÚDE E INSTITUCIONAL
  { code: 'H-1', group: 'Saúde', description: 'Hospital veterinário', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  { code: 'H-2', group: 'Saúde', description: 'Local onde pessoas requerem cuidados especiais', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  { code: 'H-3', group: 'Saúde', description: 'Hospital e assemelhado', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  { code: 'H-4', group: 'Saúde', description: 'Prédio e instalação vinculada às forças armadas', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  { code: 'H-5', group: 'Saúde', description: 'Local onde a liberdade das pessoas sofre restrição', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  { code: 'H-6', group: 'Saúde', description: 'Clínica e consultório', densityM2PerPerson: 7, densityDescription: '1 Pessoa/7m²' },
  
  // GRUPO I - INDUSTRIAL
  { code: 'I-1', group: 'Industrial', description: 'Indústria com baixa carga de incêndio', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  { code: 'I-2', group: 'Industrial', description: 'Indústria com média carga de incêndio', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  { code: 'I-3', group: 'Industrial', description: 'Indústria com alta carga de incêndio', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  
  // GRUPO J - DEPÓSITOS
  { code: 'J-1', group: 'Depósitos', description: 'Depósito de material incombustível', densityM2PerPerson: 30, densityDescription: '1 Pessoa/30m²' },
  { code: 'J-2', group: 'Depósitos', description: 'Depósito com baixa carga de incêndio', densityM2PerPerson: 30, densityDescription: '1 Pessoa/30m²' },
  { code: 'J-3', group: 'Depósitos', description: 'Depósito com média carga de incêndio', densityM2PerPerson: 30, densityDescription: '1 Pessoa/30m²' },
  { code: 'J-4', group: 'Depósitos', description: 'Depósito com alta carga de incêndio', densityM2PerPerson: 30, densityDescription: '1 Pessoa/30m²' },
  
  // GRUPO L - EXPLOSIVOS
  { code: 'L-1', group: 'Explosivos', description: 'Comércio de fogos de artifício', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  { code: 'L-2', group: 'Explosivos', description: 'Indústria de material explosivo', densityM2PerPerson: 20, densityDescription: '1 Pessoa/20m²' },
  { code: 'L-3', group: 'Explosivos', description: 'Depósito de material explosivo', densityM2PerPerson: 50, densityDescription: '1 Pessoa/50m²' },
  
  // GRUPO M - ESPECIAIS
  { code: 'M-1', group: 'Especiais', description: 'Túnel', densityM2PerPerson: 20, densityDescription: '1 Pessoa/20m²' },
  { code: 'M-3', group: 'Especiais', description: 'Central de comunicação e energia', densityM2PerPerson: 10, densityDescription: '1 Pessoa/10m²' },
  { code: 'M-4', group: 'Especiais', description: 'Edificação em construção', densityM2PerPerson: 20, densityDescription: '1 Pessoa/20m²' },
  { code: 'M-5', group: 'Especiais', description: 'Silos', densityM2PerPerson: 50, densityDescription: '1 Pessoa/50m²' },
  { code: 'M-8', group: 'Especiais', description: 'Parques eólicos e solares', densityM2PerPerson: 100, densityDescription: '1 Pessoa/100m²' },
];

/**
 * Busca os dados de densidade por código de ocupação
 */
export function getOccupancyDensity(code: string): OccupancyDensity | undefined {
  return OCCUPANCY_DENSITIES.find(d => d.code === code);
}

/**
 * Lista ocupações por grupo
 */
export function getOccupanciesByGroup(group: string): OccupancyDensity[] {
  return OCCUPANCY_DENSITIES.filter(d => d.group === group);
}

/**
 * Lista todos os grupos únicos
 */
export function getOccupancyGroups(): string[] {
  return [...new Set(OCCUPANCY_DENSITIES.map(d => d.group))];
}
