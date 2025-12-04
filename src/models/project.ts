/**
 * Interfaces de Projeto para Dimensionamento Completo de Edificações
 * Baseado em NTCB 01/2025 - Anexo G
 */

// ============================================
// SETOR DA EDIFICAÇÃO
// ============================================

export interface BuildingSector {
  id: string;
  name: string;
  occupancyCode: string;        // Código da divisão NTCB (ex: "C-2")
  occupancyName?: string;       // Nome da ocupação
  cnaeCode?: string;            // Código CNAE (opcional)
  area: number;                 // Área do setor em m²
  floorHeight: number;          // Pé-direito em metros
  numberOfFloors: number;       // Número de pavimentos
  fireLoad?: number;            // Carga de incêndio específica (MJ/m²)
  population?: number;          // População calculada ou informada
  notes?: string;               // Observações
}

// ============================================
// CONFIGURAÇÃO DO PROJETO
// ============================================

export type RiskClass = 'baixo' | 'medio' | 'alto';

export interface ProjectConfig {
  // Identificação
  projectName: string;
  projectNumber?: string;
  clientName?: string;
  address?: string;
  city?: string;
  state?: string;
  
  // Dados gerais da edificação
  totalArea: number;            // Área total construída em m²
  totalHeight: number;          // Altura total em metros
  numberOfFloors: number;       // Número total de pavimentos
  yearBuilt?: number;           // Ano de construção
  
  // Setores
  sectors: BuildingSector[];
  
  // Classificação de risco (calculada ou definida)
  riskClass: RiskClass;
  
  // Dados complementares
  hasBasement: boolean;         // Possui subsolo
  basementFloors?: number;      // Número de subsolos
  hasRooftop: boolean;          // Possui cobertura habitável
  
  // Características especiais
  hasAtrium: boolean;           // Possui átrio
  hasMezzanine: boolean;        // Possui mezanino
  hasExternalArea: boolean;     // Possui área externa coberta
  
  // Metadados
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// MEDIDAS DE PROTEÇÃO OBRIGATÓRIAS
// ============================================

export interface MandatoryMeasures {
  // Grupo 1 - Proteção Passiva
  accessRoutes: boolean;                    // Acesso de viaturas
  compartmentalization: boolean;             // Compartimentação horizontal/vertical
  emergencyExits: boolean;                  // Saídas de emergência
  controlConstructionMaterials: boolean;    // Controle de materiais de construção
  controlFinishingMaterials: boolean;       // Controle de acabamento
  
  // Grupo 2 - Proteção Ativa
  fireExtinguishers: boolean;               // Extintores
  hydrants: boolean;                        // Hidrantes/mangotinhos
  automaticSprinklers: boolean;             // Sprinklers automáticos
  fireAlarm: boolean;                       // Alarme de incêndio
  smokeDetection: boolean;                  // Detecção de fumaça
  emergencyLighting: boolean;               // Iluminação de emergência
  safetySignage: boolean;                   // Sinalização de emergência
  smokeControl: boolean;                    // Controle de fumaça
  
  // Grupo 3 - Sistemas Especiais
  gasDetection: boolean;                    // Detecção de gases
  specialExtinguishing: boolean;            // Sistemas especiais de extinção
  brigadeTraining: boolean;                 // Brigada de incêndio
  emergencyPlan: boolean;                   // Plano de emergência
  lightningProtection: boolean;             // SPDA (para-raios)
}

// ============================================
// RESULTADOS DE CÁLCULO
// ============================================

export interface PopulationResult {
  sectorId: string;
  sectorName: string;
  area: number;
  occupancyCode: string;
  method: string;
  factor: string;
  population: number;
}

export interface ExitCalculation {
  totalPopulation: number;
  unitsRequired: number;             // UP necessárias
  widthRequired: number;             // Largura total em metros
  numberOfExits: number;             // Número de saídas recomendado
  doorWidth: number;                 // Largura de portas (m)
  corridorWidth: number;             // Largura de corredores (m)
  stairWidth: number;                // Largura de escadas (m)
  capacityPerUP: number;             // Capacidade por UP
}

export interface ExtinguisherCalculation {
  riskClass: RiskClass;
  coverageRadius: number;            // metros
  coverageArea: number;              // m²
  quantityRequired: number;
  type: string;                      // Tipo recomendado
  capacity: string;                  // Capacidade
}

export interface HydrantCalculation {
  systemType: number;
  flowPerHydrant: number;            // L/min
  simultaneousHydrants: number;
  totalFlow: number;                 // L/min
  minPressure: number;               // mca
  reserveVolume: number;             // m³
}

export interface FireLoadCalculation {
  sectorId: string;
  sectorName: string;
  area: number;
  specificFireLoad: number;          // MJ/m²
  totalFireLoad: number;             // MJ
  riskClass: RiskClass;
}

// ============================================
// RESULTADO COMPLETO DO PROJETO
// ============================================

export interface ProjectResult {
  config: ProjectConfig;
  
  // Medidas obrigatórias
  mandatoryMeasures: MandatoryMeasures;
  
  // Cálculos
  populationResults: PopulationResult[];
  totalPopulation: number;
  
  fireLoadResults: FireLoadCalculation[];
  totalFireLoad: number;                    // MJ total
  averageFireLoad: number;                  // MJ/m² média ponderada
  
  exitCalculation: ExitCalculation;
  extinguisherCalculation: ExtinguisherCalculation;
  hydrantCalculation?: HydrantCalculation;
  
  // Verificações
  checks: {
    passed: boolean;
    warnings: string[];
    errors: string[];
  };
  
  // Metadados
  calculatedAt: Date;
}

// ============================================
// TABELAS DO ANEXO G
// ============================================

export interface AnexoG_Table5_1_2_Row {
  pavimento: string;
  setor: string;
  ocupacao: string;
  divisao: string;
  area: number;
  cargaIncendio: number;
  cargaTotal: number;
}

export interface AnexoG_Table6_3_Row {
  pavimento: string;
  populacao: number;
  capacidade: number;
  larguraMinima: number;
  larguraProjeto: number;
  numeroSaidas: number;
}

export interface AnexoG_Table6_4_Row {
  area: string;
  tipoExtintor: string;
  quantidade: number;
  capacidade: string;
  distanciaMaxima: number;
}

export interface AnexoG_Table6_7_Row {
  trecho: string;
  vazao: number;              // L/min
  comprimento: number;        // m
  leq: number;                // m (comprimento equivalente)
  diametro: number;           // mm
  j: number;                  // m/m (perda unitária)
  deltaH: number;             // m (perda de carga)
  cota: number;               // m
  pressao: number;            // mca
}

export interface AnexoGTables {
  table5_1_2: AnexoG_Table5_1_2_Row[];
  table6_3: AnexoG_Table6_3_Row[];
  table6_4: AnexoG_Table6_4_Row[];
  table6_7: AnexoG_Table6_7_Row[];
}
