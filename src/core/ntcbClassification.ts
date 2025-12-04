/**
 * Classificação conforme NTCB 19/2020 - Mato Grosso
 * Sistema de Proteção por Hidrantes e Mangotinhos
 * 
 * Toda a lógica de vazões, pressões e tipos de sistema vem EXCLUSIVAMENTE desta norma.
 */

import type { BuildingClassification, DemandConfig } from '../models/types';
import { Lmin_to_m3s } from './units';

// ============================================
// TIPOS DE SISTEMA (Tabela 1 - NTCB 19/2020)
// ============================================

export type SystemType = 1 | 2 | 3 | 4 | 5;

export interface SystemTypeConfig {
  type: SystemType;
  name: string;
  nozzleDiameter: number;        // mm
  hoseType: string;
  expeditions: 'simples' | 'duplo';
  minFlowPerHydrant: number;     // L/min - vazão mínima por hidrante
  minNozzlePressure: number;     // mca - pressão mínima no esguicho
  simultaneousHydrants: number;  // hidrantes simultâneos (sempre 2, exceto tipo 1 com único hidrante)
  maxHoseLength: number;         // metros
  description: string;
}

/**
 * Tabela 1 - NTCB 19/2020
 * Tipos de Sistemas de proteção por Hidrantes e/ou Mangotinhos
 */
export const SYSTEM_TYPES: Record<SystemType, SystemTypeConfig> = {
  1: {
    type: 1,
    name: 'Tipo 1 - Mangotinho',
    nozzleDiameter: 25,
    hoseType: 'Semirrígida',
    expeditions: 'simples',
    minFlowPerHydrant: 85,
    minNozzlePressure: 6,
    simultaneousHydrants: 2,
    maxHoseLength: 30,
    description: 'Sistema de mangotinho com mangueira semirrígida'
  },
  2: {
    type: 2,
    name: 'Tipo 2 - Hidrante',
    nozzleDiameter: 38,
    hoseType: 'Tipo 1 (residencial) ou Tipo 2',
    expeditions: 'simples',
    minFlowPerHydrant: 100,
    minNozzlePressure: 10,
    simultaneousHydrants: 2,
    maxHoseLength: 30,
    description: 'Sistema de hidrante padrão para risco baixo/médio'
  },
  3: {
    type: 3,
    name: 'Tipo 3 - Hidrante',
    nozzleDiameter: 38,
    hoseType: 'Tipo 2, 3, 4 ou 5',
    expeditions: 'simples',
    minFlowPerHydrant: 200,
    minNozzlePressure: 15,
    simultaneousHydrants: 2,
    maxHoseLength: 30,
    description: 'Sistema de hidrante para risco médio/alto'
  },
  4: {
    type: 4,
    name: 'Tipo 4 - Hidrante',
    nozzleDiameter: 63,
    hoseType: 'Tipo 2, 3, 4 ou 5',
    expeditions: 'simples',
    minFlowPerHydrant: 300,
    minNozzlePressure: 17,
    simultaneousHydrants: 2,
    maxHoseLength: 30,
    description: 'Sistema de hidrante para risco alto'
  },
  5: {
    type: 5,
    name: 'Tipo 5 - Hidrante Duplo',
    nozzleDiameter: 63,
    hoseType: 'Tipo 2, 3, 4 ou 5',
    expeditions: 'duplo',
    minFlowPerHydrant: 600,
    minNozzlePressure: 17,
    simultaneousHydrants: 2,
    maxHoseLength: 60,
    description: 'Sistema de hidrante duplo para risco especial'
  }
};

// ============================================
// CLASSIFICAÇÃO POR OCUPAÇÃO (Tabela 2 - NTCB 19/2020)
// ============================================

export type OccupancyGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'L' | 'M';

export interface OccupancyDivision {
  code: string;
  name: string;
  group: OccupancyGroup;
  description: string;
  systemTypeRules: Array<{
    condition?: string;          // ex: "até 300 MJ/m²", "acima de 1000 MJ/m²"
    maxFireLoad?: number;        // MJ/m² - limite de carga de incêndio
    minFireLoad?: number;        // MJ/m² - mínimo de carga de incêndio
    systemType: SystemType;
  }>;
}

/**
 * Tabela 2 - NTCB 19/2020 + NTCB 01/2025
 * Tipos de Sistema em função da Ocupação/Uso
 */
export const OCCUPANCY_DIVISIONS: OccupancyDivision[] = [
  // GRUPO A - RESIDENCIAL
  { code: 'A-1', name: 'Habitação unifamiliar', group: 'A', description: 'Casas térreas ou assobradadas', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'A-2', name: 'Habitação multifamiliar', group: 'A', description: 'Edifícios de apartamentos', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'A-3', name: 'Habitação coletiva', group: 'A', description: 'Pensionatos, internatos, alojamentos', 
    systemTypeRules: [{ systemType: 1 }] },
  
  // GRUPO B - SERVIÇO DE HOSPEDAGEM
  { code: 'B-1', name: 'Hotel e assemelhado', group: 'B', description: 'Hotéis, motéis, pousadas', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'B-2', name: 'Hotel residencial', group: 'B', description: 'Apart-hotéis', 
    systemTypeRules: [{ systemType: 2 }] },
  
  // GRUPO C - COMERCIAL
  { code: 'C-1', name: 'Comércio baixa carga', group: 'C', description: 'Armarinhos, artigos de metal', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'C-2', name: 'Comércio média/alta carga', group: 'C', description: 'Lojas, supermercados', 
    systemTypeRules: [
      { condition: 'até 1000 MJ/m²', maxFireLoad: 1000, systemType: 2 },
      { condition: 'acima de 1000 MJ/m²', minFireLoad: 1000, systemType: 3 }
    ] },
  { code: 'C-3', name: 'Shopping centers', group: 'C', description: 'Centro de compras', 
    systemTypeRules: [{ systemType: 4 }] },
  
  // GRUPO D - SERVIÇOS PROFISSIONAIS
  { code: 'D-1', name: 'Prestação de serviços', group: 'D', description: 'Escritórios, instituições financeiras', 
    systemTypeRules: [
      { condition: 'até 300 MJ/m²', maxFireLoad: 300, systemType: 1 },
      { condition: 'acima de 300 MJ/m²', minFireLoad: 300, systemType: 2 }
    ] },
  { code: 'D-2', name: 'Agência bancária', group: 'D', description: 'Agências bancárias', 
    systemTypeRules: [
      { condition: 'até 300 MJ/m²', maxFireLoad: 300, systemType: 1 },
      { condition: 'acima de 300 MJ/m²', minFireLoad: 300, systemType: 2 }
    ] },
  { code: 'D-3', name: 'Serviço de reparação', group: 'D', description: 'Lavanderias, assistência técnica', 
    systemTypeRules: [
      { condition: 'até 300 MJ/m²', maxFireLoad: 300, systemType: 1 },
      { condition: 'acima de 300 MJ/m²', minFireLoad: 300, systemType: 2 }
    ] },
  { code: 'D-4', name: 'Laboratório', group: 'D', description: 'Laboratórios de análises', 
    systemTypeRules: [
      { condition: 'até 300 MJ/m²', maxFireLoad: 300, systemType: 1 },
      { condition: 'acima de 300 MJ/m²', minFireLoad: 300, systemType: 2 }
    ] },
  
  // GRUPO E - EDUCACIONAL
  { code: 'E-1', name: 'Escola em geral', group: 'E', description: 'Escolas de 1º, 2º e 3º graus', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'E-2', name: 'Escola especial', group: 'E', description: 'Escolas de artes, línguas', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'E-3', name: 'Espaço cultura física', group: 'E', description: 'Academias, ginástica', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'E-4', name: 'Centro treinamento', group: 'E', description: 'Escolas profissionais', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'E-5', name: 'Pré-escola', group: 'E', description: 'Creches, jardins de infância', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'E-6', name: 'Escola portadores deficiência', group: 'E', description: 'Escolas especiais', 
    systemTypeRules: [{ systemType: 1 }] },
  
  // GRUPO F - LOCAL DE REUNIÃO DE PÚBLICO
  { code: 'F-1', name: 'Local valor inestimável', group: 'F', description: 'Museus, bibliotecas', 
    systemTypeRules: [
      { condition: 'até 300 MJ/m²', maxFireLoad: 300, systemType: 1 },
      { condition: 'acima de 300 MJ/m²', minFireLoad: 300, systemType: 2 }
    ] },
  { code: 'F-2', name: 'Local religioso e velório', group: 'F', description: 'Igrejas, capelas', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-3', name: 'Centro esportivo', group: 'F', description: 'Estádios, ginásios', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-4', name: 'Estação/terminal', group: 'F', description: 'Estações, aeroportos', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-5', name: 'Arte cênica', group: 'F', description: 'Teatros, cinemas', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-6', name: 'Clubes sociais', group: 'F', description: 'Clubes, restaurantes dançantes', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-7', name: 'Construção provisória', group: 'F', description: 'Circos, parques', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-8', name: 'Local para refeição', group: 'F', description: 'Restaurantes, lanchonetes', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-9', name: 'Recreação pública', group: 'F', description: 'Parques recreativos', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-10', name: 'Exposição objetos/animais', group: 'F', description: 'Salões de exposição', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'F-11', name: 'Boates', group: 'F', description: 'Casas noturnas, discotecas', 
    systemTypeRules: [{ systemType: 2 }] },
  
  // GRUPO G - SERVIÇOS AUTOMOTIVOS
  { code: 'G-1', name: 'Garagem sem acesso público', group: 'G', description: 'Garagens automáticas', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'G-2', name: 'Garagem com acesso público', group: 'G', description: 'Garagens coletivas', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'G-3', name: 'Local abastecimento', group: 'G', description: 'Postos de combustível', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'G-4', name: 'Serviço conservação', group: 'G', description: 'Oficinas mecânicas', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'G-5', name: 'Hangares', group: 'G', description: 'Abrigos para aeronaves', 
    systemTypeRules: [{ systemType: 4 }] },
  
  // GRUPO H - SAÚDE E INSTITUCIONAL
  { code: 'H-1', name: 'Hospital veterinário', group: 'H', description: 'Clínicas veterinárias', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'H-2', name: 'Asilos e similares', group: 'H', description: 'Asilos, abrigos geriátricos', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'H-3', name: 'Hospital', group: 'H', description: 'Hospitais e assemelhados', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'H-4', name: 'Edificações públicas', group: 'H', description: 'Tribunais, quartéis', 
    systemTypeRules: [{ systemType: 2 }] },
  { code: 'H-5', name: 'Local restrição liberdade', group: 'H', description: 'Prisões, manicômios', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'H-6', name: 'Clínicas médicas', group: 'H', description: 'Consultórios, ambulatórios', 
    systemTypeRules: [{ systemType: 1 }] },
  
  // GRUPO I - INDUSTRIAL
  { code: 'I-1', name: 'Industrial baixo potencial', group: 'I', description: 'Até 300 MJ/m²', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'I-2', name: 'Industrial médio potencial', group: 'I', description: '301 a 1200 MJ/m²', 
    systemTypeRules: [
      { condition: 'até 800 MJ/m²', maxFireLoad: 800, systemType: 2 },
      { condition: 'acima de 800 MJ/m²', minFireLoad: 800, systemType: 3 }
    ] },
  { code: 'I-3', name: 'Industrial alto potencial', group: 'I', description: 'Acima de 1200 MJ/m²', 
    systemTypeRules: [{ systemType: 4 }] },
  
  // GRUPO J - DEPÓSITOS
  { code: 'J-1', name: 'Depósito incombustível', group: 'J', description: 'Materiais incombustíveis', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'J-2', name: 'Depósito baixa carga', group: 'J', description: 'Até 300 MJ/m²', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'J-3', name: 'Depósito média carga', group: 'J', description: '301 a 1200 MJ/m²', 
    systemTypeRules: [
      { condition: 'até 800 MJ/m²', maxFireLoad: 800, systemType: 2 },
      { condition: 'acima de 800 MJ/m²', minFireLoad: 800, systemType: 3 }
    ] },
  { code: 'J-4', name: 'Depósito alta carga', group: 'J', description: 'Acima de 1200 MJ/m²', 
    systemTypeRules: [{ systemType: 4 }] },
  
  // GRUPO L - EXPLOSIVOS
  { code: 'L-1', name: 'Comércio explosivos', group: 'L', description: 'Comércio de fogos', 
    systemTypeRules: [{ systemType: 3 }] },
  { code: 'L-2', name: 'Indústria explosivos', group: 'L', description: 'Fabricação de explosivos', 
    systemTypeRules: [{ systemType: 4 }] },
  { code: 'L-3', name: 'Depósito explosivos', group: 'L', description: 'Depósito de explosivos', 
    systemTypeRules: [{ systemType: 4 }] },
  
  // GRUPO M - ESPECIAL
  { code: 'M-1', name: 'Túnel', group: 'M', description: 'Túneis', 
    systemTypeRules: [{ systemType: 3 }] },
  { code: 'M-3', name: 'Central telefônica', group: 'M', description: 'Centrais de comunicação', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'M-4', name: 'Propriedade em transf.', group: 'M', description: 'Edificações em construção', 
    systemTypeRules: [{ systemType: 1 }] },
  { code: 'M-5', name: 'Silos', group: 'M', description: 'Silos e armazéns', 
    systemTypeRules: [{ systemType: 3 }] },
  { code: 'M-8', name: 'Parques eólicos/solares', group: 'M', description: 'Usinas de energia renovável', 
    systemTypeRules: [{ systemType: 1 }] },
];

// ============================================
// RESERVA TÉCNICA DE INCÊNDIO (Tabela 3 - NTCB 19/2020)
// ============================================

export interface RTIConfig {
  areaRange: [number, number];  // [min, max] m²
  volumes: Record<SystemType, number>;  // m³
}

/**
 * Tabela 3 - NTCB 19/2020
 * Volume mínimo da Reserva Técnica de Incêndio (RTI) em m³
 */
export const RTI_TABLE: RTIConfig[] = [
  { areaRange: [0, 2500], volumes: { 1: 5, 2: 8, 3: 12, 4: 28, 5: 32 } },
  { areaRange: [2500, 5000], volumes: { 1: 8, 2: 12, 3: 18, 4: 32, 5: 48 } },
  { areaRange: [5000, 10000], volumes: { 1: 12, 2: 18, 3: 25, 4: 48, 5: 64 } },
  { areaRange: [10000, 20000], volumes: { 1: 18, 2: 25, 3: 35, 4: 64, 5: 96 } },
  { areaRange: [20000, 50000], volumes: { 1: 25, 2: 35, 3: 48, 4: 96, 5: 120 } },
  { areaRange: [50000, Infinity], volumes: { 1: 35, 2: 48, 3: 70, 4: 120, 5: 180 } },
];

// ============================================
// FUNÇÕES DE ENQUADRAMENTO
// ============================================

/**
 * Determina o tipo de sistema baseado na ocupação e carga de incêndio
 */
export function getSystemType(
  occupancyCode: string,
  fireLoadMJm2: number
): SystemType {
  const division = OCCUPANCY_DIVISIONS.find(d => d.code === occupancyCode);
  if (!division) {
    throw new Error(`Ocupação não encontrada: ${occupancyCode}`);
  }

  // Encontra a regra aplicável baseada na carga de incêndio
  for (const rule of division.systemTypeRules) {
    if (!rule.maxFireLoad && !rule.minFireLoad) {
      return rule.systemType;
    }
    if (rule.maxFireLoad && fireLoadMJm2 <= rule.maxFireLoad) {
      return rule.systemType;
    }
    if (rule.minFireLoad && fireLoadMJm2 > rule.minFireLoad) {
      return rule.systemType;
    }
  }

  // Retorna a primeira regra como fallback
  return division.systemTypeRules[0].systemType;
}

/**
 * Obtém a configuração do tipo de sistema
 */
export function getSystemConfig(systemType: SystemType): SystemTypeConfig {
  return SYSTEM_TYPES[systemType];
}

/**
 * Calcula a RTI necessária
 */
export function calculateRTI(systemType: SystemType, totalAreaM2: number): number {
  for (const config of RTI_TABLE) {
    if (totalAreaM2 > config.areaRange[0] && totalAreaM2 <= config.areaRange[1]) {
      return config.volumes[systemType];
    }
  }
  // Para áreas maiores que 50000m²
  return RTI_TABLE[RTI_TABLE.length - 1].volumes[systemType];
}

/**
 * Cria a configuração de demanda baseada no enquadramento normativo
 * 
 * IMPORTANTE: Vazão e pressão são determinadas pela norma, não pelo usuário
 */
export function createNTCBDemandConfig(
  occupancyCode: string,
  fireLoadMJm2: number,
  totalAreaM2: number
): {
  systemType: SystemType;
  systemConfig: SystemTypeConfig;
  demandConfig: DemandConfig;
  rtiVolume: number;
} {
  const systemType = getSystemType(occupancyCode, fireLoadMJm2);
  const systemConfig = getSystemConfig(systemType);
  const rtiVolume = calculateRTI(systemType, totalAreaM2);

  // Vazão por hidrante vem da norma (não é editável)
  const flowPerHydrant = systemConfig.minFlowPerHydrant;
  const simultaneousHydrants = systemConfig.simultaneousHydrants;
  const totalFlow = flowPerHydrant * simultaneousHydrants;

  // Tempo de autonomia baseado na RTI
  const autonomyMinutes = (rtiVolume * 1000) / totalFlow;

  const demandConfig: DemandConfig = {
    flowPerHydrant,
    flowPerHydrantM3s: Lmin_to_m3s(flowPerHydrant),
    simultaneousHydrants,
    totalFlow,
    totalFlowM3s: Lmin_to_m3s(totalFlow),
    minNozzlePressure: systemConfig.minNozzlePressure,
    reserveVolume: rtiVolume * 1000, // em litros
    hoseLength: systemConfig.maxHoseLength,
    hoseDiameter: systemConfig.nozzleDiameter,
  };

  return {
    systemType,
    systemConfig,
    demandConfig,
    rtiVolume,
  };
}

/**
 * Obtém lista de ocupações por grupo
 */
export function getOccupanciesByGroup(group: OccupancyGroup): OccupancyDivision[] {
  return OCCUPANCY_DIVISIONS.filter(d => d.group === group);
}

/**
 * Lista todos os grupos de ocupação
 */
export const OCCUPANCY_GROUPS: { group: OccupancyGroup; name: string }[] = [
  { group: 'A', name: 'Residencial' },
  { group: 'B', name: 'Serviço de Hospedagem' },
  { group: 'C', name: 'Comercial' },
  { group: 'D', name: 'Serviços Profissionais' },
  { group: 'E', name: 'Educacional e Cultura Física' },
  { group: 'F', name: 'Local de Reunião de Público' },
  { group: 'G', name: 'Serviços Automotivos' },
  { group: 'H', name: 'Saúde e Institucional' },
  { group: 'I', name: 'Industrial' },
  { group: 'J', name: 'Depósitos' },
  { group: 'L', name: 'Explosivos' },
  { group: 'M', name: 'Especial' },
];
