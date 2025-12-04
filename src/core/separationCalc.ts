/**
 * Cálculo de Separação entre Edificações - NTCB 09/2020
 * Corpo de Bombeiros Militar do Estado de Mato Grosso
 */

// Tabela A-1 - Índice α para distâncias de segurança
// Estrutura: [severidade][porcentagemAbertura][relacaoX] = alpha
const TABLE_A1: Record<string, Record<number, Record<number, number>>> = {
  // Severidade I (0-680 MJ/m²)
  I: {
    30: { 1: 0.4, 1.3: 0.4, 1.6: 0.44, 2: 0.46, 2.5: 0.48, 3.2: 0.49, 4: 0.5, 5: 0.51, 6: 0.51, 8: 0.51, 10: 0.51, 13: 0.51, 16: 0.51, 20: 0.51, 25: 0.51 },
    40: { 1: 0.6, 1.3: 0.66, 1.6: 0.73, 2: 0.79, 2.5: 0.84, 3.2: 0.88, 4: 0.9, 5: 0.92, 6: 0.93, 8: 0.94, 10: 0.94, 13: 0.95, 16: 0.95, 20: 0.95, 25: 0.95 },
    50: { 1: 0.8, 1.3: 0.8, 1.6: 0.94, 2: 1.04, 2.5: 1.1, 3.2: 1.17, 4: 1.23, 5: 1.27, 6: 1.30, 8: 1.32, 10: 1.33, 13: 1.33, 16: 1.34, 20: 1.34, 25: 1.34 },
    60: { 1: 0.9, 1.3: 1, 1.6: 1.11, 2: 1.22, 2.5: 1.33, 3.2: 1.42, 4: 1.51, 5: 1.58, 6: 1.63, 8: 1.66, 10: 1.69, 13: 1.7, 16: 1.71, 20: 1.71, 25: 1.71 },
    80: { 1: 1, 1.3: 1.14, 1.6: 1.26, 2: 1.39, 2.5: 1.52, 3.2: 1.64, 4: 1.76, 5: 1.85, 6: 1.93, 8: 1.99, 10: 2.03, 13: 2.05, 16: 2.07, 20: 2.08, 25: 2.08 },
    100: { 1: 1.2, 1.3: 1.37, 1.6: 1.52, 2: 1.68, 2.5: 1.85, 3.2: 2.02, 4: 2.18, 5: 2.34, 6: 2.48, 8: 2.59, 10: 2.67, 13: 2.73, 16: 2.77, 20: 2.79, 25: 2.81 },
  },
  // Severidade II (681-1460 MJ/m²)
  II: {
    15: { 1: 0.4, 1.3: 0.4, 1.6: 0.44, 2: 0.46, 2.5: 0.48, 3.2: 0.49, 4: 0.5, 5: 0.51, 6: 0.51, 8: 0.51, 10: 0.51, 13: 0.51, 16: 0.51, 20: 0.51, 25: 0.51 },
    20: { 1: 0.6, 1.3: 0.66, 1.6: 0.73, 2: 0.79, 2.5: 0.84, 3.2: 0.88, 4: 0.9, 5: 0.92, 6: 0.93, 8: 0.94, 10: 0.94, 13: 0.95, 16: 0.95, 20: 0.95, 25: 0.95 },
    25: { 1: 0.8, 1.3: 0.8, 1.6: 0.94, 2: 1.04, 2.5: 1.1, 3.2: 1.17, 4: 1.23, 5: 1.27, 6: 1.30, 8: 1.32, 10: 1.33, 13: 1.33, 16: 1.34, 20: 1.34, 25: 1.34 },
    30: { 1: 0.9, 1.3: 1, 1.6: 1.11, 2: 1.22, 2.5: 1.33, 3.2: 1.42, 4: 1.51, 5: 1.58, 6: 1.63, 8: 1.66, 10: 1.69, 13: 1.7, 16: 1.71, 20: 1.71, 25: 1.71 },
    40: { 1: 1, 1.3: 1.14, 1.6: 1.26, 2: 1.39, 2.5: 1.52, 3.2: 1.64, 4: 1.76, 5: 1.85, 6: 1.93, 8: 1.99, 10: 2.03, 13: 2.05, 16: 2.07, 20: 2.08, 25: 2.08 },
    50: { 1: 1.2, 1.3: 1.37, 1.6: 1.52, 2: 1.68, 2.5: 1.85, 3.2: 2.02, 4: 2.18, 5: 2.34, 6: 2.48, 8: 2.59, 10: 2.67, 13: 2.73, 16: 2.77, 20: 2.79, 25: 2.81 },
    60: { 1: 1.4, 1.3: 1.56, 1.6: 1.74, 2: 1.93, 2.5: 2.13, 3.2: 2.34, 4: 2.55, 5: 2.76, 6: 2.95, 8: 3.12, 10: 3.26, 13: 3.36, 16: 3.43, 20: 3.48, 25: 3.51 },
    80: { 1: 1.6, 1.3: 1.73, 1.6: 1.94, 2: 2.15, 2.5: 2.38, 3.2: 2.63, 4: 2.88, 5: 3.13, 6: 3.37, 8: 3.6, 10: 3.79, 13: 3.95, 16: 4.07, 20: 4.15, 25: 4.2 },
    100: { 1: 1.8, 1.3: 2.04, 1.6: 2.28, 2: 2.54, 2.5: 2.82, 3.2: 3.12, 4: 3.44, 5: 3.77, 6: 4.11, 8: 4.43, 10: 4.74, 13: 5.01, 16: 5.24, 20: 5.41, 25: 5.52 },
  },
  // Severidade III (acima de 1460 MJ/m²)
  III: {
    7.5: { 1: 0.4, 1.3: 0.4, 1.6: 0.44, 2: 0.46, 2.5: 0.48, 3.2: 0.49, 4: 0.5, 5: 0.51, 6: 0.51, 8: 0.51, 10: 0.51, 13: 0.51, 16: 0.51, 20: 0.51, 25: 0.51 },
    10: { 1: 0.6, 1.3: 0.66, 1.6: 0.73, 2: 0.79, 2.5: 0.84, 3.2: 0.88, 4: 0.9, 5: 0.92, 6: 0.93, 8: 0.94, 10: 0.94, 13: 0.95, 16: 0.95, 20: 0.95, 25: 0.95 },
    12.5: { 1: 0.8, 1.3: 0.8, 1.6: 0.94, 2: 1.04, 2.5: 1.1, 3.2: 1.17, 4: 1.23, 5: 1.27, 6: 1.30, 8: 1.32, 10: 1.33, 13: 1.33, 16: 1.34, 20: 1.34, 25: 1.34 },
    15: { 1: 0.9, 1.3: 1, 1.6: 1.11, 2: 1.22, 2.5: 1.33, 3.2: 1.42, 4: 1.51, 5: 1.58, 6: 1.63, 8: 1.66, 10: 1.69, 13: 1.7, 16: 1.71, 20: 1.71, 25: 1.71 },
    20: { 1: 1, 1.3: 1.14, 1.6: 1.26, 2: 1.39, 2.5: 1.52, 3.2: 1.64, 4: 1.76, 5: 1.85, 6: 1.93, 8: 1.99, 10: 2.03, 13: 2.05, 16: 2.07, 20: 2.08, 25: 2.08 },
    25: { 1: 1.2, 1.3: 1.37, 1.6: 1.52, 2: 1.68, 2.5: 1.85, 3.2: 2.02, 4: 2.18, 5: 2.34, 6: 2.48, 8: 2.59, 10: 2.67, 13: 2.73, 16: 2.77, 20: 2.79, 25: 2.81 },
    30: { 1: 1.4, 1.3: 1.56, 1.6: 1.74, 2: 1.93, 2.5: 2.13, 3.2: 2.34, 4: 2.55, 5: 2.76, 6: 2.95, 8: 3.12, 10: 3.26, 13: 3.36, 16: 3.43, 20: 3.48, 25: 3.51 },
    40: { 1: 1.6, 1.3: 1.73, 1.6: 1.94, 2: 2.15, 2.5: 2.38, 3.2: 2.63, 4: 2.88, 5: 3.13, 6: 3.37, 8: 3.6, 10: 3.79, 13: 3.95, 16: 4.07, 20: 4.15, 25: 4.2 },
    50: { 1: 1.8, 1.3: 2.04, 1.6: 2.28, 2: 2.54, 2.5: 2.82, 3.2: 3.12, 4: 3.44, 5: 3.77, 6: 4.11, 8: 4.43, 10: 4.74, 13: 5.01, 16: 5.24, 20: 5.41, 25: 5.52 },
    60: { 1: 2.1, 1.3: 2.3, 1.6: 2.57, 2: 2.87, 2.5: 3.2, 3.2: 3.55, 4: 3.93, 5: 4.33, 6: 4.74, 8: 5.16, 10: 5.56, 13: 5.95, 16: 6.29, 20: 6.56, 25: 6.77 },
    80: { 1: 2.3, 1.3: 2.54, 1.6: 2.84, 2: 3.17, 2.5: 3.54, 3.2: 3.93, 4: 4.36, 5: 4.83, 6: 5.3, 8: 5.8, 10: 6.3, 13: 6.78, 16: 7.23, 20: 7.63, 25: 7.94 },
    100: { 1: 3, 1.3: 3.32, 1.6: 3.72, 2: 4.16, 2.5: 4.65, 3.2: 5.19, 4: 5.78, 5: 6.43, 6: 7.13, 8: 7.88, 10: 8.67, 13: 9.5, 16: 10.3, 20: 11.1, 25: 11.9 },
  },
};

// Tabela 3 - Simplificada para edificações até 12m e 750m²
const TABLE_3: Record<string, Record<number, number>> = {
  '10': { 1: 4, 2: 6, 3: 8 },
  '11-20': { 1: 5, 2: 7, 3: 9 },
  '21-30': { 1: 6, 2: 8, 3: 10 },
  '31-40': { 1: 7, 2: 9, 3: 11 },
  '41-50': { 1: 8, 2: 10, 3: 12 },
  '51-70': { 1: 9, 2: 11, 3: 13 },
  '70+': { 1: 10, 2: 12, 3: 14 },
};

// Tabela 4 - Separação cobertura x fachada
const TABLE_4: Record<number, number> = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
};

export interface BuildingData {
  id: string;
  name: string;
  width: number;  // largura da fachada (m)
  height: number; // altura da fachada (m)
  openingPercentage: number; // porcentagem de aberturas (%)
  fireLoadMJm2: number; // carga de incêndio (MJ/m²)
  area: number; // área total (m²)
  floors: number; // número de pavimentos
  hasHorizontalCompartmentalization: boolean;
  hasVerticalCompartmentalization: boolean;
  hasSprinklers: boolean;
  hasTRRF120min: boolean;
}

export interface SeparationParams {
  buildingA: BuildingData;
  buildingB: BuildingData;
  hasFireDepartment: boolean; // município com CB
  useSimplifiedTable: boolean; // usar Tabela 3
}

export interface SeparationResult {
  distanceA: number; // distância calculada para edifício A
  distanceB: number; // distância calculada para edifício B
  finalDistance: number; // maior das duas
  method: 'full' | 'simplified';
  alphaA: number;
  alphaB: number;
  severityA: 'I' | 'II' | 'III';
  severityB: 'I' | 'II' | 'III';
  beta: number;
  ratioA: number;
  ratioB: number;
  notes: string[];
}

/**
 * Determina a severidade baseada na carga de incêndio
 */
export function getSeverity(fireLoadMJm2: number, hasSprinklers: boolean): 'I' | 'II' | 'III' {
  // Se tem sprinklers, reduz um nível
  let effectiveLoad = fireLoadMJm2;
  
  if (effectiveLoad <= 680) return hasSprinklers ? 'I' : 'I';
  if (effectiveLoad <= 1460) return hasSprinklers ? 'I' : 'II';
  return hasSprinklers ? 'II' : 'III';
}

/**
 * Obtém o índice X da relação largura/altura
 */
function getClosestX(ratio: number): number {
  const xValues = [1, 1.3, 1.6, 2, 2.5, 3.2, 4, 5, 6, 8, 10, 13, 16, 20, 25, 32, 40];
  // Sempre usar o valor imediatamente superior
  for (const x of xValues) {
    if (ratio <= x) return x;
  }
  return 40;
}

/**
 * Obtém o índice Y da porcentagem de aberturas
 */
function getClosestY(percentage: number, severity: 'I' | 'II' | 'III'): number {
  const yValuesPerSeverity: Record<string, number[]> = {
    I: [30, 40, 50, 60, 80, 100],
    II: [15, 20, 25, 30, 40, 50, 60, 80, 100],
    III: [7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 80, 100],
  };
  
  const yValues = yValuesPerSeverity[severity];
  // Sempre usar o valor imediatamente superior
  for (const y of yValues) {
    if (percentage <= y) return y;
  }
  return yValues[yValues.length - 1];
}

/**
 * Obtém o coeficiente alpha da Tabela A-1
 */
export function getAlpha(severity: 'I' | 'II' | 'III', openingPercentage: number, ratio: number): number {
  const y = getClosestY(openingPercentage, severity);
  const x = getClosestX(ratio);
  
  const severityTable = TABLE_A1[severity];
  if (!severityTable) return 1;
  
  const yTable = severityTable[y];
  if (!yTable) return 1;
  
  return yTable[x] || 1;
}

/**
 * Calcula a distância de separação usando o método simplificado (Tabela 3)
 */
function calculateSimplified(openingPercentage: number, floors: number): number {
  let yKey: string;
  if (openingPercentage <= 10) yKey = '10';
  else if (openingPercentage <= 20) yKey = '11-20';
  else if (openingPercentage <= 30) yKey = '21-30';
  else if (openingPercentage <= 40) yKey = '31-40';
  else if (openingPercentage <= 50) yKey = '41-50';
  else if (openingPercentage <= 70) yKey = '51-70';
  else yKey = '70+';
  
  const floorsKey = floors === 1 ? 1 : floors === 2 ? 2 : 3;
  
  return TABLE_3[yKey]?.[floorsKey] || 14;
}

/**
 * Calcula a distância de separação para uma edificação
 */
function calculateBuildingDistance(
  building: BuildingData,
  beta: number
): { distance: number; alpha: number; severity: 'I' | 'II' | 'III'; ratio: number } {
  const severity = getSeverity(building.fireLoadMJm2, building.hasSprinklers);
  
  // Relação largura/altura (sempre maior/menor)
  const ratio = Math.max(building.width, building.height) / Math.min(building.width, building.height);
  
  // Obter alpha
  let alpha = getAlpha(severity, building.openingPercentage, ratio);
  
  // Se tem sprinklers e severidade já era I, reduz alpha em 50%
  if (building.hasSprinklers && building.fireLoadMJm2 <= 680) {
    alpha *= 0.5;
  }
  
  // Menor dimensão
  const minDimension = Math.min(building.width, building.height);
  
  // D = α × (menor dimensão) + β
  const distance = alpha * minDimension + beta;
  
  return { distance, alpha, severity, ratio };
}

/**
 * Função principal de cálculo de separação
 */
export function calculateSeparation(params: SeparationParams): SeparationResult {
  const { buildingA, buildingB, hasFireDepartment, useSimplifiedTable } = params;
  const notes: string[] = [];
  
  // Determinar beta
  const beta = hasFireDepartment ? 1.5 : 3;
  
  // Verificar se pode usar tabela simplificada
  const canUseSimplified = 
    buildingA.height <= 12 && buildingA.area <= 750 &&
    buildingB.height <= 12 && buildingB.area <= 750;
  
  if (useSimplifiedTable && canUseSimplified) {
    // Usar Tabela 3
    const maxOpeningPercentage = Math.max(buildingA.openingPercentage, buildingB.openingPercentage);
    const maxFloors = Math.max(buildingA.floors, buildingB.floors);
    const distance = calculateSimplified(maxOpeningPercentage, maxFloors);
    
    notes.push('Cálculo simplificado utilizando Tabela 3 da NTCB 09/2020');
    notes.push(`Edificações com até 12m de altura e até 750m² de área`);
    
    return {
      distanceA: distance,
      distanceB: distance,
      finalDistance: distance,
      method: 'simplified',
      alphaA: 0,
      alphaB: 0,
      severityA: getSeverity(buildingA.fireLoadMJm2, buildingA.hasSprinklers),
      severityB: getSeverity(buildingB.fireLoadMJm2, buildingB.hasSprinklers),
      beta,
      ratioA: 0,
      ratioB: 0,
      notes,
    };
  }
  
  // Cálculo completo usando Tabela A-1
  const resultA = calculateBuildingDistance(buildingA, beta);
  const resultB = calculateBuildingDistance(buildingB, beta);
  
  // Usar a maior distância
  const finalDistance = Math.max(resultA.distance, resultB.distance);
  
  notes.push(`Edifício ${buildingA.name}: Severidade ${resultA.severity}, α = ${resultA.alpha.toFixed(2)}`);
  notes.push(`Edifício ${buildingB.name}: Severidade ${resultB.severity}, α = ${resultB.alpha.toFixed(2)}`);
  notes.push(`Fator β = ${beta}m (${hasFireDepartment ? 'Com' : 'Sem'} Corpo de Bombeiros)`);
  
  if (buildingA.hasSprinklers || buildingB.hasSprinklers) {
    notes.push('Redução aplicada devido a proteção por chuveiros automáticos');
  }
  
  return {
    distanceA: resultA.distance,
    distanceB: resultB.distance,
    finalDistance: Math.ceil(finalDistance * 10) / 10, // Arredondar para cima
    method: 'full',
    alphaA: resultA.alpha,
    alphaB: resultB.alpha,
    severityA: resultA.severity,
    severityB: resultB.severity,
    beta,
    ratioA: resultA.ratio,
    ratioB: resultB.ratio,
    notes,
  };
}

/**
 * Gera os dados para a Tabela 3.1 do Anexo G
 */
export function generateTable3_1(params: SeparationParams, result: SeparationResult): {
  edificacaoExpositora: string;
  edificacaoEmExposicao: string;
  larguraFachada: number;
  alturaFachada: number;
  relacaoXY: number;
  percentualAberturas: number;
  cargaIncendio: number;
  severidade: string;
  coeficienteAlpha: number;
  coeficienteBeta: number;
  distanciaCalculada: number;
  distanciaAdotada: number;
  observacoes: string;
}[] {
  const rows = [];
  
  // Linha para edificação A como expositora
  rows.push({
    edificacaoExpositora: params.buildingA.name,
    edificacaoEmExposicao: params.buildingB.name,
    larguraFachada: params.buildingA.width,
    alturaFachada: params.buildingA.height,
    relacaoXY: result.ratioA,
    percentualAberturas: params.buildingA.openingPercentage,
    cargaIncendio: params.buildingA.fireLoadMJm2,
    severidade: result.severityA,
    coeficienteAlpha: result.alphaA,
    coeficienteBeta: result.beta,
    distanciaCalculada: result.distanceA,
    distanciaAdotada: result.finalDistance,
    observacoes: params.buildingA.hasSprinklers ? 'Com SPK' : '-',
  });
  
  // Linha para edificação B como expositora
  rows.push({
    edificacaoExpositora: params.buildingB.name,
    edificacaoEmExposicao: params.buildingA.name,
    larguraFachada: params.buildingB.width,
    alturaFachada: params.buildingB.height,
    relacaoXY: result.ratioB,
    percentualAberturas: params.buildingB.openingPercentage,
    cargaIncendio: params.buildingB.fireLoadMJm2,
    severidade: result.severityB,
    coeficienteAlpha: result.alphaB,
    coeficienteBeta: result.beta,
    distanciaCalculada: result.distanceB,
    distanciaAdotada: result.finalDistance,
    observacoes: params.buildingB.hasSprinklers ? 'Com SPK' : '-',
  });
  
  return rows;
}
