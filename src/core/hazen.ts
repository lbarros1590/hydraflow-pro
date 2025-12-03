/**
 * Módulo Hazen-Williams
 * 
 * Implementação da fórmula de Hazen-Williams para perda de carga
 * em tubulações pressurizadas.
 * 
 * Fórmula de Hazen-Williams (SI):
 * J = 10.643 × Q^1.852 × C^(-1.852) × D^(-4.87)
 * 
 * Onde:
 * - J: perda de carga unitária (m/m)
 * - Q: vazão (m³/s)
 * - C: coeficiente de rugosidade de Hazen-Williams
 * - D: diâmetro interno (m)
 */

import { validatePositive } from './units';

/** Expoente da vazão na fórmula HW */
export const HW_FLOW_EXPONENT = 1.852;

/** Expoente do coeficiente C na fórmula HW */
export const HW_C_EXPONENT = -1.852;

/** Expoente do diâmetro na fórmula HW */
export const HW_DIAMETER_EXPONENT = -4.87;

/** Constante da fórmula HW em SI */
export const HW_CONSTANT = 10.643;

/**
 * Coeficientes de Hazen-Williams por material
 */
export const HAZEN_WILLIAMS_COEFFICIENTS: Record<string, number> = {
  'aço_novo': 130,
  'aço_usado': 100,
  'aço_galvanizado': 120,
  'ferro_fundido_novo': 130,
  'ferro_fundido_usado': 100,
  'cobre': 140,
  'pvc': 140,
  'cpvc': 140,
  'pead': 140,
  'pprc': 140,
  'concreto': 120,
  'cimento_amianto': 140,
};

/**
 * Calcula a perda de carga unitária (J) usando Hazen-Williams
 * 
 * @param Q - Vazão em m³/s
 * @param D - Diâmetro interno em metros
 * @param C - Coeficiente de Hazen-Williams
 * @returns Perda de carga unitária em m/m
 */
export function calculateHeadLossUnit(Q: number, D: number, C: number): number {
  validatePositive(Q, 'Vazão');
  validatePositive(D, 'Diâmetro');
  validatePositive(C, 'Coeficiente C');

  // J = 10.643 × Q^1.852 × C^(-1.852) × D^(-4.87)
  const J = HW_CONSTANT * 
    Math.pow(Q, HW_FLOW_EXPONENT) * 
    Math.pow(C, HW_C_EXPONENT) * 
    Math.pow(D, HW_DIAMETER_EXPONENT);

  return J;
}

/**
 * Calcula a perda de carga total em um trecho
 * 
 * @param Q - Vazão em m³/s
 * @param D - Diâmetro interno em metros
 * @param C - Coeficiente de Hazen-Williams
 * @param L - Comprimento do trecho em metros (incluindo Leq)
 * @returns Perda de carga total em mca
 */
export function calculateHeadLoss(Q: number, D: number, C: number, L: number): number {
  validatePositive(L, 'Comprimento');
  
  const J = calculateHeadLossUnit(Q, D, C);
  return J * L;
}

/**
 * Calcula a constante K do trecho para Hardy-Cross
 * K = 10.643 × C^(-1.852) × D^(-4.87) × L
 * 
 * Tal que: H = K × Q^1.852
 * 
 * @param D - Diâmetro interno em metros
 * @param C - Coeficiente de Hazen-Williams
 * @param L - Comprimento total em metros (incluindo Leq)
 * @returns Constante K do trecho
 */
export function calculatePipeK(D: number, C: number, L: number): number {
  validatePositive(D, 'Diâmetro');
  validatePositive(C, 'Coeficiente C');
  validatePositive(L, 'Comprimento');

  return HW_CONSTANT * 
    Math.pow(C, HW_C_EXPONENT) * 
    Math.pow(D, HW_DIAMETER_EXPONENT) * 
    L;
}

/**
 * Calcula a perda de carga usando a constante K
 * H = K × |Q|^1.852 × sign(Q)
 * 
 * @param K - Constante do trecho
 * @param Q - Vazão em m³/s (com sinal indicando direção)
 * @returns Perda de carga em mca (com sinal)
 */
export function calculateHeadLossWithK(K: number, Q: number): number {
  if (Q === 0) return 0;
  const sign = Q >= 0 ? 1 : -1;
  return K * Math.pow(Math.abs(Q), HW_FLOW_EXPONENT) * sign;
}

/**
 * Calcula a derivada dH/dQ para Hardy-Cross
 * dH/dQ = n × K × |Q|^(n-1) = n × H / Q
 * 
 * @param K - Constante do trecho
 * @param Q - Vazão em m³/s
 * @returns Derivada dH/dQ
 */
export function calculateHeadLossDerivative(K: number, Q: number): number {
  if (Q === 0) return 0;
  return HW_FLOW_EXPONENT * K * Math.pow(Math.abs(Q), HW_FLOW_EXPONENT - 1);
}

/**
 * Calcula a velocidade do escoamento
 * V = Q / A = Q / (π × D² / 4) = 4Q / (π × D²)
 * 
 * @param Q - Vazão em m³/s
 * @param D - Diâmetro interno em metros
 * @returns Velocidade em m/s
 */
export function calculateVelocity(Q: number, D: number): number {
  validatePositive(D, 'Diâmetro');
  if (Q === 0) return 0;
  
  const A = Math.PI * Math.pow(D, 2) / 4;
  return Math.abs(Q) / A;
}

/**
 * Calcula o número de Reynolds
 * Re = V × D / ν
 * 
 * @param V - Velocidade em m/s
 * @param D - Diâmetro em metros
 * @param viscosity - Viscosidade cinemática (default: 1.0×10⁻⁶ m²/s para água a 20°C)
 * @returns Número de Reynolds (adimensional)
 */
export function calculateReynolds(V: number, D: number, viscosity: number = 1.0e-6): number {
  return (V * D) / viscosity;
}

/**
 * Verifica se a velocidade está dentro dos limites recomendados
 * 
 * @param V - Velocidade em m/s
 * @returns Objeto com status e mensagem
 */
export function checkVelocityLimits(V: number): { ok: boolean; message: string } {
  if (V < 0.5) {
    return { ok: false, message: 'Velocidade muito baixa (< 0.5 m/s) - risco de sedimentação' };
  }
  if (V > 5.0) {
    return { ok: false, message: 'Velocidade muito alta (> 5.0 m/s) - risco de golpe de aríete' };
  }
  if (V > 3.0) {
    return { ok: true, message: 'Velocidade elevada (> 3.0 m/s) - aceitável para incêndio' };
  }
  return { ok: true, message: 'Velocidade adequada' };
}
