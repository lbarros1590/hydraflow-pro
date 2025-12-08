/**
 * Tipos e dados para geração das tabelas do Anexo G (NTCB 01/2025)
 */

// Período de existência (Tabela 2 - Anexo A.3 NTCB 01 Parte 3)
export const EXISTENCE_PERIODS = [
  { id: 'pre_1984', label: 'Anterior à 29/08/1984', checked: false },
  { id: '1984_2006', label: 'De 29/08/1984 até 21/04/2006 (Dec. 857/1984)', checked: false },
  { id: '2006_2016', label: 'De 22/04/2006 até 25/07/2016 (Lei 8.399/2005)', checked: false },
  { id: '2016_2023', label: 'De 26/07/2016 até 18/08/2023 (Lei 10.402/2016)', checked: false },
  { id: 'pos_2023', label: 'A partir de 19/08/2023 (Lei 12.149/2023)', checked: true },
] as const;

export type ExistencePeriodId = typeof EXISTENCE_PERIODS[number]['id'];

// Classificação por altura (Tabela 9 da NTCB 01)
export const HEIGHT_CLASSES = [
  { type: 'I', name: 'EDIFICAÇÃO TÉRREA', heightRange: 'H≤6,00m' },
  { type: 'II', name: 'EDIFICAÇÃO BAIXA', heightRange: '6,00m<H≤12,00m' },
  { type: 'III', name: 'EDIFICAÇÃO DE ALTURA MÉDIA', heightRange: '12,00m<H≤23,00m' },
  { type: 'IV', name: 'EDIFICAÇÃO MEDIANAMENTE ALTA', heightRange: '23,00m<H≤30,00m' },
  { type: 'V', name: 'EDIFICAÇÃO ALTA', heightRange: '30,00m<H≤45,00m' },
  { type: 'VI', name: 'EDIFICAÇÃO MUITO ALTA', heightRange: 'H>45,00m' },
] as const;

export type HeightClassType = typeof HEIGHT_CLASSES[number]['type'];

// Classificação de risco por carga de incêndio (Tabela 10 da NTCB 01)
export const FIRE_RISK_CLASSES = [
  { risk: 'BAIXO', range: 'Até 300 MJ/m²' },
  { risk: 'MÉDIO', range: '300 a 500 MJ/m²' },
  { risk: 'ALTO', range: 'Acima de 500 MJ/m²' },
] as const;

export type FireRiskLevel = 'BAIXO' | 'MÉDIO' | 'ALTO';

// Grupos de ocupação (Tabela 8 da NTCB 01)
export const OCCUPANCY_GROUPS = [
  { group: 'A', use: 'RESIDENCIAL' },
  { group: 'B', use: 'SERVIÇO DE HOSPEDAGEM' },
  { group: 'C', use: 'COMERCIAL' },
  { group: 'D', use: 'SERVIÇO PROFISSIONAL' },
  { group: 'E', use: 'EDUCACIONAL E CULTURA FÍSICA' },
  { group: 'F', use: 'LOCAL DE REUNIÃO DE PÚBLICO' },
  { group: 'G', use: 'SERVIÇO AUTOMOTIVO' },
  { group: 'H', use: 'SERVIÇO DE SAÚDE E INSTITUCIONAL' },
  { group: 'I', use: 'INDUSTRIAL' },
  { group: 'J', use: 'DEPÓSITO' },
  { group: 'L', use: 'EXPLOSIVOS' },
  { group: 'M', use: 'ESPECIAL' },
] as const;

// Medidas de segurança contra incêndio e pânico (Seção 5.1.3)
export interface SafetyMeasure {
  id: string;
  label: string;
  category: 'basic' | 'special';
}

export const SAFETY_MEASURES: SafetyMeasure[] = [
  // Coluna 1
  { id: 'acesso_viatura', label: 'Acesso de viatura do CBMMT', category: 'basic' },
  { id: 'resistencia_fogo', label: 'Resistência ao fogo dos elementos de construção', category: 'basic' },
  { id: 'compartimentacao_vertical', label: 'Compartimentação vertical', category: 'basic' },
  { id: 'saidas_emergencia', label: 'Saídas de emergência', category: 'basic' },
  { id: 'controle_fumaca', label: 'Controle de fumaça', category: 'basic' },
  { id: 'brigada', label: 'Brigada de incêndio', category: 'basic' },
  { id: 'deteccao', label: 'Detecção de incêndio', category: 'basic' },
  { id: 'sinalizacao', label: 'Sinalização de emergência', category: 'basic' },
  { id: 'hidrantes', label: 'Hidrante e mangotinhos', category: 'basic' },
  { id: 'spda', label: 'Sistema de proteção contra descargas atmosféricas (SPDA)', category: 'basic' },
  { id: 'gases_limpos', label: 'Sistema fixo de gases limpos e CO₂', category: 'basic' },
  { id: 'resfriamento', label: 'Resfriamento', category: 'basic' },
  { id: 'plano_intervencao', label: 'Plano de intervenção de incêndio', category: 'basic' },
  // Coluna 2
  { id: 'isolamento_risco', label: 'Isolamento de Risco (Separação entre Edificações)', category: 'basic' },
  { id: 'compartimentacao_horizontal', label: 'Compartimentação horizontal', category: 'basic' },
  { id: 'controle_acabamento', label: 'Controle de materiais de acabamento e revestimento', category: 'basic' },
  { id: 'elevador_emergencia', label: 'Elevador de emergência', category: 'basic' },
  { id: 'iluminacao_emergencia', label: 'Iluminação de emergência', category: 'basic' },
  { id: 'alarme', label: 'Alarme de incêndio', category: 'basic' },
  { id: 'extintores', label: 'Extintores', category: 'basic' },
  { id: 'sprinklers', label: 'Chuveiros automáticos (sprinkler)', category: 'basic' },
  { id: 'espuma', label: 'Espuma', category: 'basic' },
  { id: 'supressao_explosoes', label: 'Sistema para monitoramento, supressão e alívio de explosões e/ou poeiras', category: 'basic' },
  { id: 'escada_pressurizada', label: 'Escada pressurizada', category: 'basic' },
  { id: 'outros', label: 'Outros (especificar):', category: 'basic' },
];

// Riscos especiais
export const SPECIAL_RISKS: SafetyMeasure[] = [
  { id: 'liquidos_inflamaveis', label: 'Armazenamento de líquidos combustíveis e/ou inflamáveis', category: 'special' },
  { id: 'gases_combustiveis', label: 'Armazenamento de gases combustíveis', category: 'special' },
  { id: 'produtos_perigosos', label: 'Armazenamento de produtos perigosos', category: 'special' },
  { id: 'radioativos', label: 'Instalações radioativas, nucleares, radiografia industrial ou congêneres', category: 'special' },
  { id: 'central_glp', label: 'Instalação predial de gás liquefeito de petróleo (Central de GLP)', category: 'special' },
  { id: 'fogos_artificio', label: 'Armazenamento de fogos de artifício e/ou explosivos', category: 'special' },
  { id: 'vasos_pressao', label: 'Vasos sob pressão', category: 'special' },
  { id: 'heliponto', label: 'Heliponto ou heliporto', category: 'special' },
  { id: 'outros_especiais', label: 'Outros (especificar):', category: 'special' },
];

// Dados de escadas (Seção 6.3.1)
export interface StairData {
  id: string;
  name: string;
  type: 'NE' | 'EP' | 'PF'; // NE = Não Enclausurada, EP = Enclausurada Protegida, PF = Prova de Fumaça
  material: string;
  width: number; // metros
  heightPerRun: number; // altura a vencer por lanço (m)
  guardRailHeight: number; // altura do guarda-corpo (m)
  handrail: {
    height: number;
    diameterCircular?: number;
    widthRectangular?: number;
    wallClearance: number; // mm
  };
  steps: {
    quantityPerRun: number;
    riserHeight: number; // cm - espelho
    treadDepth: number; // cm - passo
  };
  landing?: {
    quantity?: number;
    length?: number;
    width?: number;
  };
}

// Dados de acesso de viaturas (Seção 6.2)
export interface VehicleAccessData {
  roads: {
    width: number; // metros
    freeHeight: number | 'LIVRE'; // metros ou "LIVRE"
    loadCapacity: number; // kg
    turnType?: string; // tipo de contorno
  }[];
  gates: {
    width: number;
    height: number | 'LIVRE';
  }[];
}

// Resistência ao fogo (Seção 6.1)
export interface FireResistanceData {
  division: string;
  height: string;
  wallType: string;
  wallThickness: string;
  trrf: {
    required: number;
    existing: {
      integrity: number;
      tightness: number;
      thermalInsulation: number;
      trrf: number;
    };
  };
}

// Controle de materiais de acabamento (NTCB 12/2020)
export interface FinishingMaterialsData {
  groupDivision: string;
  floor: string;
  wallsPartitions: string;
  ceilingRoof: string;
  facade: string;
}

// Hidrantes e mangotinhos (Seção 6.7)
export interface HydrantSystemData {
  systemType: string;
  nozzle: {
    type: string;
    diameterMm: number;
  };
  hose: {
    type: string;
    lengthM: number;
    diameterMm: number;
  };
  expeditions: string;
  hydrantCount: number;
  minFlow: number;
  minPressure: number;
}

// Helper para classificar altura
export function getHeightClass(heightM: number): typeof HEIGHT_CLASSES[number] {
  if (heightM <= 6) return HEIGHT_CLASSES[0];
  if (heightM <= 12) return HEIGHT_CLASSES[1];
  if (heightM <= 23) return HEIGHT_CLASSES[2];
  if (heightM <= 30) return HEIGHT_CLASSES[3];
  if (heightM <= 45) return HEIGHT_CLASSES[4];
  return HEIGHT_CLASSES[5];
}

// Helper para classificar risco por carga de incêndio
export function getFireRiskLevel(fireLoadMJm2: number): FireRiskLevel {
  if (fireLoadMJm2 <= 300) return 'BAIXO';
  if (fireLoadMJm2 <= 500) return 'MÉDIO';
  return 'ALTO';
}

// Helper para obter grupo de ocupação
export function getOccupancyGroup(divisionCode: string): typeof OCCUPANCY_GROUPS[number] | undefined {
  const group = divisionCode?.charAt(0)?.toUpperCase();
  return OCCUPANCY_GROUPS.find(g => g.group === group);
}
