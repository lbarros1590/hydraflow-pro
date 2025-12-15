/**
 * Motor de Regras para Exigências de Proteção contra Incêndio
 * Baseado em NTCB 01/2025 (Tabela 6A)
 * 
 * REFATORADO: Removida dependência de ntcbData.ts
 * Agora usa fireLoad diretamente do BuildingSector (vindo do banco regulation_activities)
 */

import type { ProjectConfig, MandatoryMeasures, BuildingSector, RiskClass } from '../models/project';

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
  
  // Classificação de risco por carga de incêndio (MJ/m²)
  FIRE_LOAD_LOW_MAX: 300,
  FIRE_LOAD_MEDIUM_MAX: 1200,
};

// ============================================
// FUNÇÕES DE CLASSIFICAÇÃO
// ============================================

/**
 * Determina a classe de risco predominante
 * REFATORADO: Usa fireLoad do setor (vindo do banco) em vez de consultar arquivo estático
 */
export function determineRiskClass(sectors: BuildingSector[]): RiskClass {
  if (sectors.length === 0) return 'baixo';
  
  const risks = sectors.map(sector => {
    // Usa fireLoad do setor (que veio da seleção no banco regulation_activities)
    // Se não houver, assume risco médio como fallback seguro
    const fireLoad = sector.fireLoad ?? 700;
    
    if (fireLoad <= LIMITS.FIRE_LOAD_LOW_MAX) return 'baixo';
    if (fireLoad <= LIMITS.FIRE_LOAD_MEDIUM_MAX) return 'medio';
    return 'alto';
  });
  
  // Retorna o maior risco encontrado
  if (risks.includes('alto')) return 'alto';
  if (risks.includes('medio')) return 'medio';
  return 'baixo';
}

/**
 * Verifica se é ocupação residencial
 */
function isResidential(occupancyCode: string): boolean {
  return occupancyCode.startsWith('A-');
}

/**
 * Verifica se é ocupação de reunião de público
 */
function isPublicAssembly(occupancyCode: string): boolean {
  return occupancyCode.startsWith('F-');
}

/**
 * Verifica se é ocupação hospitalar
 */
function isHealthcare(occupancyCode: string): boolean {
  return ['H-2', 'H-3', 'H-5'].includes(occupancyCode);
}

/**
 * Verifica se é ocupação industrial ou depósito de alto risco
 */
function isHighRiskIndustrial(occupancyCode: string): boolean {
  return ['I-3', 'J-4', 'L-1', 'L-2', 'L-3'].includes(occupancyCode);
}

/**
 * Verifica se é ocupação com risco de explosivos
 */
function isExplosives(occupancyCode: string): boolean {
  return occupancyCode.startsWith('L-');
}

// ============================================
// FUNÇÃO PRINCIPAL DE DETERMINAÇÃO DE EXIGÊNCIAS
// ============================================

/**
 * Determina as medidas obrigatórias baseado na configuração do projeto
 * Conforme NTCB 01/2025 - Tabela 6A
 */
export function determineRequirements(config: ProjectConfig): MandatoryMeasures {
  const { totalArea, totalHeight, sectors, riskClass, hasBasement, basementFloors } = config;
  
  // Verifica características especiais
  const hasHealthcare = sectors.some(s => isHealthcare(s.occupancyCode));
  const hasPublicAssembly = sectors.some(s => isPublicAssembly(s.occupancyCode));
  const hasHighRisk = sectors.some(s => isHighRiskIndustrial(s.occupancyCode));
  const hasExplosives = sectors.some(s => isExplosives(s.occupancyCode));
  const hasResidential = sectors.some(s => isResidential(s.occupancyCode));
  
  // Número de subsolos
  const subsoloCount = hasBasement ? (basementFloors ?? 1) : 0;
  
  return {
    // ========== GRUPO 1 - PROTEÇÃO PASSIVA ==========
    
    // Acesso de viaturas - sempre obrigatório para edificações > 12m ou área > 750m²
    accessRoutes: totalHeight > 12 || totalArea > 750,
    
    // Compartimentação - obrigatória para edificações > 2500m² ou > 12m
    compartmentalization: totalArea > LIMITS.COMPARTMENT_MIN_AREA || totalHeight > LIMITS.COMPARTMENT_MIN_HEIGHT,
    
    // Saídas de emergência - SEMPRE obrigatório
    emergencyExits: true,
    
    // Controle de materiais - obrigatório para > 750m² ou > 12m
    controlConstructionMaterials: totalArea > 750 || totalHeight > 12,
    
    // Controle de acabamento - obrigatório para > 750m² ou reunião de público
    controlFinishingMaterials: totalArea > 750 || hasPublicAssembly,
    
    // ========== GRUPO 2 - PROTEÇÃO ATIVA ==========
    
    // Extintores - SEMPRE obrigatório
    fireExtinguishers: true,
    
    // Hidrantes/mangotinhos
    hydrants: totalArea > LIMITS.HYDRANT_MIN_AREA || 
              totalHeight > LIMITS.HYDRANT_MIN_HEIGHT ||
              hasPublicAssembly ||
              hasHighRisk,
    
    // Sprinklers automáticos
    automaticSprinklers: totalArea > LIMITS.SPRINKLER_MIN_AREA ||
                         totalHeight > LIMITS.SPRINKLER_MIN_HEIGHT ||
                         hasHighRisk ||
                         (hasBasement && subsoloCount > 1),
    
    // Alarme de incêndio
    fireAlarm: totalArea > LIMITS.ALARM_MIN_AREA ||
               totalHeight > LIMITS.ALARM_MIN_HEIGHT ||
               hasHealthcare ||
               hasPublicAssembly ||
               (hasResidential && totalHeight > 12),
    
    // Detecção de fumaça
    smokeDetection: hasHealthcare ||
                    totalHeight > 23 ||
                    hasBasement ||
                    riskClass === 'alto',
    
    // Iluminação de emergência - SEMPRE obrigatório
    emergencyLighting: true,
    
    // Sinalização de emergência - SEMPRE obrigatório
    safetySignage: true,
    
    // Controle de fumaça
    smokeControl: totalHeight > LIMITS.SMOKE_CONTROL_MIN_HEIGHT ||
                  (hasBasement && subsoloCount > 1) ||
                  config.hasAtrium,
    
    // ========== GRUPO 3 - SISTEMAS ESPECIAIS ==========
    
    // Detecção de gases
    gasDetection: hasExplosives,
    
    // Sistemas especiais de extinção
    specialExtinguishing: hasExplosives || hasHighRisk,
    
    // Brigada de incêndio
    brigadeTraining: totalArea > 750 || sectors.length > 1,
    
    // Plano de emergência
    emergencyPlan: totalArea > 750 || hasPublicAssembly || hasHealthcare,
    
    // SPDA (para-raios)
    lightningProtection: totalArea > LIMITS.SPDA_MIN_AREA || totalHeight > 12,
  };
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Retorna lista de medidas obrigatórias como strings
 */
export function getMandatoryMeasuresList(measures: MandatoryMeasures): string[] {
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

/**
 * Conta o número de medidas obrigatórias
 */
export function countMandatoryMeasures(measures: MandatoryMeasures): { total: number; required: number } {
  const total = Object.keys(measures).length;
  const required = Object.values(measures).filter(v => v === true).length;
  return { total, required };
}
