/**
 * TAREFA 5: Matriz de Exigências Automática
 * Baseado em NTCB 01/2025 - Tabela 6A
 * 
 * Função getMandatoryMeasures que substitui a seleção manual
 */

import type { MandatoryMeasures } from '../models/project';

// ============================================
// INTERFACE DE ENTRADA
// ============================================

export interface RequirementsInput {
  area: number;                // Área total em m²
  height: number;              // Altura total em metros
  division: string;            // Divisão NTCB (ex: "C-2", "I-3")
  state: string;               // Estado (ex: "MT", "SP")
  fireLoad?: number;           // Carga de incêndio em MJ/m²
  hasBasement?: boolean;       // Possui subsolo
  basementFloors?: number;     // Número de subsolos
  hasAtrium?: boolean;         // Possui átrio
  hasMezzanine?: boolean;      // Possui mezanino
  specialRisks?: string[];     // Riscos especiais
}

export interface RequirementsResult {
  measures: MandatoryMeasures;
  warnings: RequirementWarning[];
  summary: RequirementsSummary;
}

export interface RequirementWarning {
  measure: string;
  reason: string;
  reference: string;           // Referência normativa
  isRequired: boolean;
}

export interface RequirementsSummary {
  totalMeasures: number;
  requiredMeasures: number;
  riskClass: 'baixo' | 'medio' | 'alto';
  heightClass: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
}

// ============================================
// CONSTANTES DE LIMITES (NTCB 01/2025)
// ============================================

const LIMITS = {
  // Área mínima para exigência de hidrantes
  HYDRANT_MIN_AREA: 750,
  HYDRANT_MIN_HEIGHT: 12,
  
  // Área mínima para alarme/detecção
  ALARM_MIN_AREA: 750,
  ALARM_MIN_HEIGHT: 12,
  
  // Área mínima para sprinklers
  SPRINKLER_MIN_AREA: 5000,
  SPRINKLER_MIN_HEIGHT: 23,
  
  // SPDA
  SPDA_MIN_AREA: 750,
  
  // Controle de fumaça
  SMOKE_CONTROL_MIN_HEIGHT: 60,
  
  // Compartimentação
  COMPARTMENT_MIN_AREA: 2500,
  COMPARTMENT_MIN_HEIGHT: 12,
};

// ============================================
// CLASSIFICAÇÃO DE ALTURA (NTCB 01)
// ============================================

export function getHeightClass(height: number): 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' {
  if (height <= 6) return 'I';
  if (height <= 12) return 'II';
  if (height <= 23) return 'III';
  if (height <= 30) return 'IV';
  if (height <= 60) return 'V';
  return 'VI';
}

// ============================================
// CLASSIFICAÇÃO DE RISCO
// ============================================

export function getRiskClass(fireLoad: number): 'baixo' | 'medio' | 'alto' {
  if (fireLoad <= 300) return 'baixo';
  if (fireLoad <= 1200) return 'medio';
  return 'alto';
}

// ============================================
// VERIFICAÇÃO DE OCUPAÇÕES ESPECIAIS
// ============================================

function isResidential(division: string): boolean {
  return division.startsWith('A-');
}

function isPublicAssembly(division: string): boolean {
  return division.startsWith('F-');
}

function isHealthcare(division: string): boolean {
  return ['H-2', 'H-3', 'H-5'].includes(division);
}

function isHighRiskIndustrial(division: string): boolean {
  return ['I-3', 'J-4', 'L-1', 'L-2', 'L-3'].includes(division);
}

function isExplosives(division: string): boolean {
  return division.startsWith('L-');
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Determina as medidas obrigatórias baseado nos parâmetros do projeto
 * Conforme NTCB 01/2025 - Tabela 6A
 */
export function getMandatoryMeasures(input: RequirementsInput): RequirementsResult {
  const { 
    area, 
    height, 
    division, 
    state,
    fireLoad = 300, 
    hasBasement = false, 
    basementFloors = 0,
    hasAtrium = false,
    specialRisks = []
  } = input;

  const riskClass = getRiskClass(fireLoad);
  const heightClass = getHeightClass(height);
  const warnings: RequirementWarning[] = [];

  // Verificações de ocupações especiais
  const isHealthcareOccupancy = isHealthcare(division);
  const isPublicAssemblyOccupancy = isPublicAssembly(division);
  const isHighRiskOccupancy = isHighRiskIndustrial(division);
  const isExplosivesOccupancy = isExplosives(division);
  const isResidentialOccupancy = isResidential(division);

  // ========== GRUPO 1 - PROTEÇÃO PASSIVA ==========
  
  const accessRoutes = height > 12 || area > 750;
  if (accessRoutes) {
    warnings.push({
      measure: 'Acesso de Viaturas',
      reason: height > 12 ? `Altura > 12m (${height}m)` : `Área > 750m² (${area}m²)`,
      reference: 'NTCB 01/2025 - Tabela 6A',
      isRequired: true
    });
  }

  const compartmentalization = area > LIMITS.COMPARTMENT_MIN_AREA || height > LIMITS.COMPARTMENT_MIN_HEIGHT;
  if (compartmentalization) {
    warnings.push({
      measure: 'Compartimentação',
      reason: area > LIMITS.COMPARTMENT_MIN_AREA 
        ? `Área > ${LIMITS.COMPARTMENT_MIN_AREA}m² (${area}m²)` 
        : `Altura > ${LIMITS.COMPARTMENT_MIN_HEIGHT}m (${height}m)`,
      reference: 'NTCB 01/2025 - Tabela 6A',
      isRequired: true
    });
  }

  const emergencyExits = true; // SEMPRE obrigatório
  
  const controlConstructionMaterials = area > 750 || height > 12;
  
  const controlFinishingMaterials = area > 750 || isPublicAssemblyOccupancy;

  // ========== GRUPO 2 - PROTEÇÃO ATIVA ==========
  
  const fireExtinguishers = true; // SEMPRE obrigatório
  
  const hydrants = area > LIMITS.HYDRANT_MIN_AREA || 
                   height > LIMITS.HYDRANT_MIN_HEIGHT ||
                   isPublicAssemblyOccupancy ||
                   isHighRiskOccupancy;

  if (hydrants) {
    const reasons = [];
    if (area > LIMITS.HYDRANT_MIN_AREA) reasons.push(`Área > ${LIMITS.HYDRANT_MIN_AREA}m²`);
    if (height > LIMITS.HYDRANT_MIN_HEIGHT) reasons.push(`Altura > ${LIMITS.HYDRANT_MIN_HEIGHT}m`);
    if (isPublicAssemblyOccupancy) reasons.push('Reunião de público');
    if (isHighRiskOccupancy) reasons.push('Ocupação de alto risco');
    
    warnings.push({
      measure: 'Sistema de Hidrantes',
      reason: reasons.join(', '),
      reference: 'NTCB 01/2025 - Tabela 6A, NTCB 19/2020',
      isRequired: true
    });
  }

  const automaticSprinklers = area > LIMITS.SPRINKLER_MIN_AREA ||
                               height > LIMITS.SPRINKLER_MIN_HEIGHT ||
                               isHighRiskOccupancy ||
                               (hasBasement && basementFloors > 1);

  if (automaticSprinklers) {
    warnings.push({
      measure: 'Sprinklers Automáticos',
      reason: area > LIMITS.SPRINKLER_MIN_AREA 
        ? `Área > ${LIMITS.SPRINKLER_MIN_AREA}m²` 
        : height > LIMITS.SPRINKLER_MIN_HEIGHT 
          ? `Altura > ${LIMITS.SPRINKLER_MIN_HEIGHT}m`
          : 'Ocupação de alto risco ou múltiplos subsolos',
      reference: 'NTCB 01/2025 - Tabela 6A',
      isRequired: true
    });
  }

  const fireAlarm = area > LIMITS.ALARM_MIN_AREA ||
                    height > LIMITS.ALARM_MIN_HEIGHT ||
                    isHealthcareOccupancy ||
                    isPublicAssemblyOccupancy ||
                    (isResidentialOccupancy && height > 12);

  if (fireAlarm) {
    warnings.push({
      measure: 'Sistema de Alarme',
      reason: 'Exigido por norma para esta configuração',
      reference: 'NTCB 01/2025 - Tabela 6A, NTCB 17/2020',
      isRequired: true
    });
  }

  const smokeDetection = isHealthcareOccupancy ||
                          height > 23 ||
                          hasBasement ||
                          riskClass === 'alto';

  const emergencyLighting = true; // SEMPRE obrigatório
  
  const safetySignage = true; // SEMPRE obrigatório

  const smokeControl = height > LIMITS.SMOKE_CONTROL_MIN_HEIGHT ||
                        (hasBasement && basementFloors > 1) ||
                        hasAtrium;

  // ========== GRUPO 3 - SISTEMAS ESPECIAIS ==========
  
  const gasDetection = isExplosivesOccupancy || specialRisks.includes('glp') || specialRisks.includes('inflamaveis');
  
  const specialExtinguishing = isExplosivesOccupancy || isHighRiskOccupancy;
  
  const brigadeTraining = area > 750 || isPublicAssemblyOccupancy;
  
  const emergencyPlan = area > 750 || isPublicAssemblyOccupancy || isHealthcareOccupancy;
  
  const lightningProtection = area > LIMITS.SPDA_MIN_AREA || height > 12;

  // Montar objeto de medidas
  const measures: MandatoryMeasures = {
    accessRoutes,
    compartmentalization,
    emergencyExits,
    controlConstructionMaterials,
    controlFinishingMaterials,
    fireExtinguishers,
    hydrants,
    automaticSprinklers,
    fireAlarm,
    smokeDetection,
    emergencyLighting,
    safetySignage,
    smokeControl,
    gasDetection,
    specialExtinguishing,
    brigadeTraining,
    emergencyPlan,
    lightningProtection,
  };

  // Contagem
  const totalMeasures = Object.keys(measures).length;
  const requiredMeasures = Object.values(measures).filter(v => v === true).length;

  return {
    measures,
    warnings,
    summary: {
      totalMeasures,
      requiredMeasures,
      riskClass,
      heightClass,
    }
  };
}

/**
 * Converte medidas em lista de strings para exibição
 */
export function getMeasuresList(measures: MandatoryMeasures): string[] {
  const list: string[] = [];
  
  if (measures.accessRoutes) list.push('Acesso de viaturas');
  if (measures.compartmentalization) list.push('Compartimentação horizontal e vertical');
  if (measures.emergencyExits) list.push('Saídas de emergência');
  if (measures.controlConstructionMaterials) list.push('Controle de materiais de construção');
  if (measures.controlFinishingMaterials) list.push('Controle de materiais de acabamento');
  if (measures.fireExtinguishers) list.push('Extintores');
  if (measures.hydrants) list.push('Sistema de hidrantes e/ou mangotinhos');
  if (measures.automaticSprinklers) list.push('Sprinklers automáticos');
  if (measures.fireAlarm) list.push('Alarme de incêndio');
  if (measures.smokeDetection) list.push('Detecção de fumaça');
  if (measures.emergencyLighting) list.push('Iluminação de emergência');
  if (measures.safetySignage) list.push('Sinalização de emergência');
  if (measures.smokeControl) list.push('Controle de fumaça');
  if (measures.gasDetection) list.push('Detecção de gases');
  if (measures.specialExtinguishing) list.push('Sistemas especiais de extinção');
  if (measures.brigadeTraining) list.push('Brigada de incêndio');
  if (measures.emergencyPlan) list.push('Plano de emergência');
  if (measures.lightningProtection) list.push('SPDA (Proteção contra descargas atmosféricas)');
  
  return list;
}
