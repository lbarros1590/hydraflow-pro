/**
 * NTCB 09/2020 - Motor de Cálculo de Separação
 * Corpo de Bombeiros Militar do Estado de Mato Grosso
 */

import {
  TABLE_A1,
  TABLE_3,
  TABLE_4,
  TABLE_A2,
  getClosestX,
  getClosestY,
  getTable3OpeningRange,
  getTable3Floors,
  type TRRFCategory,
} from './tables';

import type {
  Severity,
  SimpleBuildingData,
  SimpleCalculationInput,
  SingleScenarioResult,
  SeparationCalculationResult,
  ProtectionAdvantage,
  SituationType,
} from './types';

// ===========================================
// Funções de determinação
// ===========================================

/**
 * Determina a severidade baseada na carga de incêndio (Tabela 2)
 * Se tem sprinklers, reduz um nível (item 6.1.1.8)
 */
export function determineSeverity(fireLoadMJm2: number, hasSprinklers: boolean): Severity {
  let baseSeverity: Severity;
  
  if (fireLoadMJm2 <= 680) {
    baseSeverity = 'I';
  } else if (fireLoadMJm2 <= 1460) {
    baseSeverity = 'II';
  } else {
    baseSeverity = 'III';
  }
  
  // Se tem sprinklers, reduz um nível
  if (hasSprinklers) {
    if (baseSeverity === 'II') return 'I';
    if (baseSeverity === 'III') return 'II';
    // Se já é I, o α pode ser reduzido em 50% (tratado no cálculo)
  }
  
  return baseSeverity;
}

/**
 * Calcula a porcentagem de aberturas
 * % Abertura = (área das aberturas / área da fachada) × 100
 */
export function calcOpeningPercentage(openingArea: number, facadeArea: number): number {
  if (facadeArea <= 0) return 0;
  return (openingArea / facadeArea) * 100;
}

/**
 * Calcula a relação X (largura/altura ou altura/largura)
 * Sempre divide o maior pelo menor (item 6.1.2.2.1)
 */
export function calcRelationX(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 1;
  return width >= height ? width / height : height / width;
}

/**
 * Obtém o coeficiente α da Tabela A-1
 */
export function lookupAlpha(
  severity: Severity,
  openingPercentage: number,
  relationX: number,
  hasSprinklers: boolean = false
): { alpha: number; yAdopted: number; xAdopted: number } {
  const yAdopted = getClosestY(openingPercentage, severity);
  const xAdopted = getClosestX(relationX);
  
  const severityTable = TABLE_A1[severity];
  const yTable = severityTable[yAdopted];
  let alpha = yTable?.[xAdopted] || 1;
  
  // Se severidade I e tem sprinklers, reduz α em 50% (item 6.1.1.8)
  if (severity === 'I' && hasSprinklers) {
    alpha = alpha * 0.5;
  }
  
  return { alpha, yAdopted, xAdopted };
}

/**
 * Determina o coeficiente β (item 6.1.2.2.5)
 * - β1 = 1,5m → município com Corpo de Bombeiros
 * - β2 = 3,0m → município sem Corpo de Bombeiros
 */
export function determineBeta(hasFireDepartment: boolean): number {
  return hasFireDepartment ? 1.5 : 3.0;
}

/**
 * Determina a categoria de TRRF para aplicação de redutores
 */
export function getTRRFCategory(trrf: number): TRRFCategory {
  if (trrf < 30) return 'combustivel_ate_30';
  if (trrf < 90) return 'trrf_30_90';
  if (trrf < 120) return 'trrf_90_120';
  return 'trrf_120_mais';
}

/**
 * Aplica os redutores da Tabela A-2
 */
export function applyReducers(
  baseDistance: number,
  reducers: SimpleCalculationInput['reducers'],
  trrf: number
): { finalDistance: number; advantages: ProtectionAdvantage[] } {
  if (!reducers) {
    return { finalDistance: baseDistance, advantages: [] };
  }
  
  const advantages: ProtectionAdvantage[] = [];
  let finalDistance = baseDistance;
  const trrfCategory = getTRRFCategory(trrf);
  
  // Parede corta-fogo elimina a distância
  if (reducers.paredeCartaFogo) {
    const rule = TABLE_A2.find(r => r.type === 'parede_corta_fogo');
    if (rule) {
      advantages.push({
        type: 'parede_corta_fogo',
        description: rule.description,
        reductionPercent: 100,
        reductionValue: baseDistance,
      });
      return { finalDistance: 0, advantages };
    }
  }
  
  // Proteção das aberturas
  if (reducers.protecaoAberturas && reducers.protecaoAberturas !== 'none') {
    const ruleType = reducers.protecaoAberturas === 'inferior' 
      ? 'protecao_abertura_30_inferior' 
      : 'protecao_abertura_igual';
    const rule = TABLE_A2.find(r => r.type === ruleType);
    if (rule) {
      const reduction = rule.reductions[trrfCategory];
      if (reduction.factor !== null && reduction.factor > 0) {
        let reductionValue = baseDistance * (1 - reduction.factor);
        let newDistance = baseDistance * reduction.factor;
        
        // Aplicar máximo se existir
        if (reduction.maxDistance && newDistance > reduction.maxDistance) {
          newDistance = reduction.maxDistance;
          reductionValue = baseDistance - newDistance;
        }
        
        advantages.push({
          type: ruleType,
          description: reduction.note || rule.description,
          reductionPercent: (1 - reduction.factor) * 100,
          reductionValue,
        });
        finalDistance = newDistance;
      }
    }
  }
  
  // Cortina d'água
  if (reducers.cortinaAgua) {
    const rule = TABLE_A2.find(r => r.type === 'cortina_agua');
    if (rule) {
      const reduction = rule.reductions[trrfCategory];
      if (reduction.factor) {
        const reductionValue = finalDistance * (1 - reduction.factor);
        finalDistance = finalDistance * reduction.factor;
        advantages.push({
          type: 'cortina_agua',
          description: reduction.note || rule.description,
          reductionPercent: (1 - reduction.factor) * 100,
          reductionValue,
        });
      }
    }
  }
  
  // Distância mínima de 3m (com CB) ou 6m (sem CB) - regra geral
  const minimumDistance = 3;
  if (finalDistance < minimumDistance && finalDistance > 0) {
    finalDistance = minimumDistance;
  }
  
  return { finalDistance, advantages };
}

/**
 * Calcula a distância usando a Tabela 3 (edificações até 12m e 750m²)
 */
export function computeTable3Distance(
  openingPercentage: number,
  numberOfFloors: number
): number {
  const range = getTable3OpeningRange(openingPercentage);
  const floors = getTable3Floors(numberOfFloors);
  return TABLE_3[range]?.[floors] || 10;
}

/**
 * Calcula a distância usando a Tabela 4 (cobertura x fachada)
 */
export function computeTable4Distance(
  numberOfFloors: number
): number {
  const floors = Math.min(numberOfFloors, 5);
  return TABLE_4[floors] || 12;
}

// ===========================================
// Cálculo de um cenário
// ===========================================

/**
 * Calcula um cenário individual (Expositora → Em Exposição)
 */
export function calculateSingleScenario(
  expositora: SimpleBuildingData,
  emExposicao: SimpleBuildingData,
  hasFireDepartment: boolean,
  existingDistance: number,
  reducers?: SimpleCalculationInput['reducers']
): SingleScenarioResult {
  // Determinar severidade da EXPOSITORA
  const severity = determineSeverity(expositora.fireLoadMJm2, expositora.hasSprinklers);
  
  // Dados da fachada da EXPOSITORA
  const facadeWidth = expositora.width;
  const facadeHeight = expositora.height;
  const facadeArea = facadeWidth * facadeHeight;
  const openingArea = (expositora.openingPercentage / 100) * facadeArea;
  const openingPercentage = expositora.openingPercentage;
  
  // Calcular relação X
  const relationCalculated = calcRelationX(facadeWidth, facadeHeight);
  
  // Buscar coeficiente α na Tabela A-1
  const { alpha: coefficientA, yAdopted, xAdopted } = lookupAlpha(
    severity,
    openingPercentage,
    relationCalculated,
    expositora.hasSprinklers && severity === 'I'
  );
  
  // Coeficiente β
  const coefficientB = determineBeta(hasFireDepartment);
  
  // Dimensão a ser usada: MENOR dimensão (item 6.1.2.2.5)
  const dimensionUsed: 'width' | 'height' = facadeWidth <= facadeHeight ? 'width' : 'height';
  const dimensionValue = Math.min(facadeWidth, facadeHeight);
  
  // Fórmula: D = α × (menor dimensão) + β
  const separationDistance = coefficientA * dimensionValue + coefficientB;
  
  // Aplicar redutores
  const { finalDistance, advantages } = applyReducers(
    separationDistance,
    reducers,
    expositora.trrf || 0
  );
  
  // Calcular redução total
  const totalReduction = separationDistance - finalDistance;
  
  // Verificar conformidade
  const isCompliant = finalDistance <= existingDistance;
  
  // Montar fórmula formatada
  const formula = `${coefficientA.toFixed(2)} × ${dimensionValue.toFixed(2)} + ${coefficientB}`;
  
  return {
    expositoraName: expositora.name,
    emExposicaoName: emExposicao.name,
    severity,
    facadeWidth,
    facadeHeight,
    facadeArea,
    openingArea,
    openingPercentage,
    openingPercentageAdopted: yAdopted,
    relationCalculated,
    relationAdopted: xAdopted,
    coefficientA,
    coefficientB,
    dimensionUsed,
    dimensionValue,
    formula,
    separationDistance: Math.round(separationDistance * 100) / 100,
    reducers: advantages,
    totalReduction: Math.round(totalReduction * 100) / 100,
    finalDistance: Math.round(finalDistance * 100) / 100,
    existingDistance,
    isCompliant,
  };
}

// ===========================================
// Cálculo completo (dois cenários)
// ===========================================

/**
 * Função principal: calcula separação nos dois sentidos obrigatórios
 */
export function calculateSeparation(input: SimpleCalculationInput): SeparationCalculationResult {
  const { expositora, emExposicao, hasFireDepartment, existingDistance, situationType, reducers } = input;
  
  const notes: string[] = [];
  const warnings: string[] = [];
  
  // Verificar se pode usar Tabela 3 (edificações pequenas)
  const canUseTable3 = 
    (expositora.height <= 12 && (expositora.totalArea || 0) <= 750) &&
    (emExposicao.height <= 12 && (emExposicao.totalArea || 0) <= 750);
  
  if (canUseTable3 && situationType === 'pequenas') {
    // Usar Tabela 3
    const maxOpeningPercentage = Math.max(expositora.openingPercentage, emExposicao.openingPercentage);
    const maxFloors = Math.max(expositora.numberOfFloors || 1, emExposicao.numberOfFloors || 1);
    const table3Distance = computeTable3Distance(maxOpeningPercentage, maxFloors);
    
    notes.push(`Edificações elegíveis para Tabela 3 (até 12m e 750m²)`);
    notes.push(`Distância pela Tabela 3: ${table3Distance}m`);
    
    const isCompliant = table3Distance <= existingDistance;
    
    return {
      scenario1: {
        expositoraName: expositora.name,
        emExposicaoName: emExposicao.name,
        severity: 'I',
        facadeWidth: expositora.width,
        facadeHeight: expositora.height,
        facadeArea: expositora.width * expositora.height,
        openingArea: 0,
        openingPercentage: maxOpeningPercentage,
        openingPercentageAdopted: maxOpeningPercentage,
        relationCalculated: 1,
        relationAdopted: 1,
        coefficientA: 0,
        coefficientB: 0,
        dimensionUsed: 'height',
        dimensionValue: 0,
        formula: `Tabela 3: ${maxOpeningPercentage}% aberturas, ${maxFloors} pav.`,
        separationDistance: table3Distance,
        reducers: [],
        totalReduction: 0,
        finalDistance: table3Distance,
        existingDistance,
        isCompliant,
      },
      scenario2: {
        expositoraName: emExposicao.name,
        emExposicaoName: expositora.name,
        severity: 'I',
        facadeWidth: emExposicao.width,
        facadeHeight: emExposicao.height,
        facadeArea: emExposicao.width * emExposicao.height,
        openingArea: 0,
        openingPercentage: maxOpeningPercentage,
        openingPercentageAdopted: maxOpeningPercentage,
        relationCalculated: 1,
        relationAdopted: 1,
        coefficientA: 0,
        coefficientB: 0,
        dimensionUsed: 'height',
        dimensionValue: 0,
        formula: `Tabela 3: ${maxOpeningPercentage}% aberturas, ${maxFloors} pav.`,
        separationDistance: table3Distance,
        reducers: [],
        totalReduction: 0,
        finalDistance: table3Distance,
        existingDistance,
        isCompliant,
      },
      minimumDistance: table3Distance,
      mostUnfavorablePoint: 'scenario1',
      mostFavorablePoint: 'scenario1',
      situationType: 'pequenas',
      hasFireDepartment,
      existingDistance,
      isCompliant,
      notes,
      warnings,
    };
  }
  
  // Cenário 1: Expositora → Em Exposição
  const scenario1 = calculateSingleScenario(
    expositora,
    emExposicao,
    hasFireDepartment,
    existingDistance,
    reducers
  );
  
  // Cenário 2: Em Exposição → Expositora (invertido)
  const scenario2 = calculateSingleScenario(
    emExposicao,
    expositora,
    hasFireDepartment,
    existingDistance,
    reducers
  );
  
  // A distância mínima é a maior entre os dois cenários
  const minimumDistance = Math.max(scenario1.finalDistance, scenario2.finalDistance);
  
  // Identificar pontos mais desfavorável e favorável
  const mostUnfavorablePoint = scenario1.finalDistance >= scenario2.finalDistance ? 'scenario1' : 'scenario2';
  const mostFavorablePoint = scenario1.finalDistance < scenario2.finalDistance ? 'scenario1' : 'scenario2';
  
  // Verificar conformidade geral
  const isCompliant = minimumDistance <= existingDistance;
  
  // Notas
  notes.push(`Cenário 1 (${expositora.name} → ${emExposicao.name}): D = ${scenario1.formula} = ${scenario1.separationDistance.toFixed(2)}m`);
  notes.push(`Cenário 2 (${emExposicao.name} → ${expositora.name}): D = ${scenario2.formula} = ${scenario2.separationDistance.toFixed(2)}m`);
  notes.push(`Distância mínima de separação exigida: ${minimumDistance.toFixed(2)}m`);
  
  if (isCompliant) {
    notes.push(`✓ A distância existente (${existingDistance.toFixed(2)}m) ATENDE à norma`);
  } else {
    warnings.push(`✗ A distância existente (${existingDistance.toFixed(2)}m) NÃO ATENDE à norma`);
    warnings.push(`Necessário aumentar a distância em ${(minimumDistance - existingDistance).toFixed(2)}m`);
  }
  
  return {
    scenario1,
    scenario2,
    minimumDistance,
    mostUnfavorablePoint,
    mostFavorablePoint,
    situationType: situationType || 'fachada_fachada',
    hasFireDepartment,
    existingDistance,
    isCompliant,
    notes,
    warnings,
  };
}

// ===========================================
// Exportações adicionais para compatibilidade
// ===========================================

export { determineSeverity as getSeverity };
export { lookupAlpha as getCoeficienteA };
