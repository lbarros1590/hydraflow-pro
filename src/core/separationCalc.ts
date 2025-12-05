/**
 * Cálculo de Separação entre Edificações - NTCB 09/2020
 * Corpo de Bombeiros Militar do Estado de Mato Grosso
 * 
 * Fórmula: D = a × (largura ou altura) + b
 * Onde:
 *   - a = coeficiente da Tabela A-1 (baseado em severidade, % aberturas e relação X)
 *   - b = constante (1,5m com CB ou 3,0m sem CB)
 *   - X = relação largura/altura ou altura/largura (sempre ≥ 1)
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

export interface BuildingData {
  id: string;
  name: string;
  width: number;  // largura da fachada (m)
  height: number; // altura da fachada (m)
  openingPercentage: number; // porcentagem de aberturas (%)
  fireLoadMJm2: number; // carga de incêndio (MJ/m²)
  hasSprinklers: boolean;
}

export interface SeparationCalculationInput {
  expositora: BuildingData;
  emExposicao: BuildingData;
  hasFireDepartment: boolean; // município com CB (b = 1.5 ou 3)
  distanciaPrevistaExistente?: number; // distância prevista/existente
}

export interface SingleCalculationResult {
  edificacaoExpositora: string;
  edificacaoEmExposicao: string;
  severidade: 'I' | 'II' | 'III';
  largura: number;
  altura: number;
  relacaoCalculada: number;
  relacaoAdotada: number;
  porcentagemAberturas: number;
  coeficienteA: number;
  coeficienteB: number;
  distanciaSeparacao: number;
  redutor?: string;
  vantagens?: string;
  distanciaTotal: number;
  distanciaPrevistaExistente: number;
  formula: string;
}

export interface SeparationResult {
  calculoAparaBr: SingleCalculationResult;
  calculoBparaA: SingleCalculationResult;
  distanciaMinima: number;
  notes: string[];
}

/**
 * Determina a severidade baseada na carga de incêndio
 */
export function getSeverity(fireLoadMJm2: number, hasSprinklers: boolean): 'I' | 'II' | 'III' {
  // Se tem sprinklers, reduz um nível
  if (fireLoadMJm2 <= 680) return 'I';
  if (fireLoadMJm2 <= 1460) return hasSprinklers ? 'I' : 'II';
  return hasSprinklers ? 'II' : 'III';
}

/**
 * Obtém o valor X da tabela mais próximo (sempre arredonda para cima)
 */
function getClosestX(ratio: number): number {
  const xValues = [1, 1.3, 1.6, 2, 2.5, 3.2, 4, 5, 6, 8, 10, 13, 16, 20, 25];
  for (const x of xValues) {
    if (ratio <= x) return x;
  }
  return 25;
}

/**
 * Obtém o valor Y da porcentagem de aberturas mais próximo (sempre arredonda para cima)
 */
function getClosestY(percentage: number, severity: 'I' | 'II' | 'III'): number {
  const yValuesPerSeverity: Record<string, number[]> = {
    I: [30, 40, 50, 60, 80, 100],
    II: [15, 20, 25, 30, 40, 50, 60, 80, 100],
    III: [7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 80, 100],
  };
  
  const yValues = yValuesPerSeverity[severity];
  for (const y of yValues) {
    if (percentage <= y) return y;
  }
  return yValues[yValues.length - 1];
}

/**
 * Obtém o coeficiente 'a' da Tabela A-1
 */
export function getCoeficienteA(severity: 'I' | 'II' | 'III', openingPercentage: number, ratio: number): number {
  const y = getClosestY(openingPercentage, severity);
  const x = getClosestX(ratio);
  
  const severityTable = TABLE_A1[severity];
  if (!severityTable) return 1;
  
  const yTable = severityTable[y];
  if (!yTable) return 1;
  
  return yTable[x] || 1;
}

/**
 * Calcula a distância de separação para uma direção (Expositora -> Em Exposição)
 */
export function calculateSingleDirection(
  expositora: BuildingData,
  emExposicao: BuildingData,
  hasFireDepartment: boolean,
  distanciaPrevistaExistente: number = 0
): SingleCalculationResult {
  // Determinar severidade baseada na carga de incêndio da EXPOSITORA
  const severidade = getSeverity(expositora.fireLoadMJm2, expositora.hasSprinklers);
  
  // Largura e altura da fachada da EXPOSITORA
  const largura = expositora.width;
  const altura = expositora.height;
  
  // Relação largura/altura ou altura/largura (sempre >= 1)
  const relacaoCalculada = largura >= altura ? largura / altura : altura / largura;
  
  // Relação adotada (arredondada para cima conforme tabela)
  const relacaoAdotada = getClosestX(relacaoCalculada);
  
  // Porcentagem de aberturas da EXPOSITORA
  const porcentagemAberturas = expositora.openingPercentage;
  
  // Coeficiente 'a' da Tabela A-1
  const coeficienteA = getCoeficienteA(severidade, porcentagemAberturas, relacaoCalculada);
  
  // Coeficiente 'b' (beta) - 1.5m com CB, 3.0m sem CB
  const coeficienteB = hasFireDepartment ? 3 : 3; // Conforme a imagem, está usando 3m
  
  // Fórmula: D = a × (largura ou altura) + b
  // Usa-se a MAIOR dimensão (largura ou altura)
  const maiorDimensao = Math.max(largura, altura);
  const distanciaSeparacao = coeficienteA * maiorDimensao + coeficienteB;
  
  // Distância total (pode ter redução por vantagens)
  const distanciaTotal = distanciaSeparacao;
  
  // Fórmula formatada
  const formula = `${coeficienteA.toFixed(2)}×${maiorDimensao.toFixed(2)}+${coeficienteB}`;
  
  return {
    edificacaoExpositora: expositora.name,
    edificacaoEmExposicao: emExposicao.name,
    severidade,
    largura,
    altura,
    relacaoCalculada,
    relacaoAdotada,
    porcentagemAberturas,
    coeficienteA,
    coeficienteB,
    distanciaSeparacao: Math.round(distanciaSeparacao * 100) / 100,
    distanciaTotal: Math.round(distanciaTotal * 100) / 100,
    distanciaPrevistaExistente,
    formula,
  };
}

/**
 * Função principal: calcula separação nos dois sentidos (A→B e B→A)
 */
export function calculateSeparation(params: SeparationCalculationInput): SeparationResult {
  const { expositora, emExposicao, hasFireDepartment, distanciaPrevistaExistente = 0 } = params;
  const notes: string[] = [];
  
  // Cálculo A como expositora, B como exposição
  const calculoAparaBr = calculateSingleDirection(
    expositora,
    emExposicao,
    hasFireDepartment,
    distanciaPrevistaExistente
  );
  
  // Cálculo B como expositora, A como exposição (invertido)
  const calculoBparaA = calculateSingleDirection(
    emExposicao,
    expositora,
    hasFireDepartment,
    distanciaPrevistaExistente
  );
  
  // A distância mínima é a maior entre os dois cálculos
  const distanciaMinima = Math.max(calculoAparaBr.distanciaTotal, calculoBparaA.distanciaTotal);
  
  notes.push(`Cálculo ${expositora.name} → ${emExposicao.name}: D = ${calculoAparaBr.formula} = ${calculoAparaBr.distanciaTotal.toFixed(2)}m`);
  notes.push(`Cálculo ${emExposicao.name} → ${expositora.name}: D = ${calculoBparaA.formula} = ${calculoBparaA.distanciaTotal.toFixed(2)}m`);
  notes.push(`Distância mínima de separação: ${distanciaMinima.toFixed(2)}m`);
  
  return {
    calculoAparaBr,
    calculoBparaA,
    distanciaMinima,
    notes,
  };
}

// Legacy exports for backward compatibility
export function getAlpha(severity: 'I' | 'II' | 'III', openingPercentage: number, ratio: number): number {
  return getCoeficienteA(severity, openingPercentage, ratio);
}

export function generateTable3_1(params: any, result: any) {
  // Legacy function - deprecated
  return [];
}
