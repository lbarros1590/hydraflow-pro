/**
 * Módulo de Conversão de Unidades - Sistema SI
 * 
 * Todas as fórmulas hidráulicas trabalham internamente em SI:
 * - Vazão: m³/s
 * - Diâmetro: metros
 * - Comprimento: metros
 * - Pressão: mca (metros de coluna d'água)
 * - Velocidade: m/s
 */

// Constantes físicas
export const GRAVITY = 9.81; // m/s²
export const WATER_DENSITY = 1000; // kg/m³
export const WATER_SPECIFIC_WEIGHT = 9810; // N/m³

// ============================================
// CONVERSÕES DE VAZÃO
// ============================================

/** Converte L/min para m³/s */
export function Lmin_to_m3s(Lmin: number): number {
  return Lmin / 60000;
}

/** Converte m³/s para L/min */
export function m3s_to_Lmin(m3s: number): number {
  return m3s * 60000;
}

/** Converte m³/h para m³/s */
export function m3h_to_m3s(m3h: number): number {
  return m3h / 3600;
}

/** Converte m³/s para m³/h */
export function m3s_to_m3h(m3s: number): number {
  return m3s * 3600;
}

// ============================================
// CONVERSÕES DE COMPRIMENTO/DIÂMETRO
// ============================================

/** Converte mm para metros */
export function mm_to_m(mm: number): number {
  return mm / 1000;
}

/** Converte metros para mm */
export function m_to_mm(m: number): number {
  return m * 1000;
}

/** Converte polegadas para metros */
export function inch_to_m(inch: number): number {
  return inch * 0.0254;
}

/** Converte metros para polegadas */
export function m_to_inch(m: number): number {
  return m / 0.0254;
}

// ============================================
// CONVERSÕES DE PRESSÃO
// ============================================

/** Converte mca para Pascals */
export function mca_to_Pa(mca: number): number {
  return mca * WATER_SPECIFIC_WEIGHT;
}

/** Converte Pascals para mca */
export function Pa_to_mca(Pa: number): number {
  return Pa / WATER_SPECIFIC_WEIGHT;
}

/** Converte kPa para mca */
export function kPa_to_mca(kPa: number): number {
  return Pa_to_mca(kPa * 1000);
}

/** Converte mca para kPa */
export function mca_to_kPa(mca: number): number {
  return mca_to_Pa(mca) / 1000;
}

/** Converte bar para mca */
export function bar_to_mca(bar: number): number {
  return bar * 10.197;
}

/** Converte mca para bar */
export function mca_to_bar(mca: number): number {
  return mca / 10.197;
}

/** Converte psi para mca */
export function psi_to_mca(psi: number): number {
  return psi * 0.703;
}

/** Converte mca para psi */
export function mca_to_psi(mca: number): number {
  return mca / 0.703;
}

// ============================================
// CONVERSÕES DE POTÊNCIA
// ============================================

/** Converte Watts para kW */
export function W_to_kW(W: number): number {
  return W / 1000;
}

/** Converte kW para Watts */
export function kW_to_W(kW: number): number {
  return kW * 1000;
}

/** Converte kW para CV (cavalo-vapor) */
export function kW_to_CV(kW: number): number {
  return kW / 0.7355;
}

/** Converte CV para kW */
export function CV_to_kW(CV: number): number {
  return CV * 0.7355;
}

/** Converte kW para HP */
export function kW_to_HP(kW: number): number {
  return kW / 0.7457;
}

/** Converte HP para kW */
export function HP_to_kW(HP: number): number {
  return HP * 0.7457;
}

// ============================================
// VALIDAÇÕES
// ============================================

/** Valida se o valor está em faixa aceitável */
export function validateRange(value: number, min: number, max: number, name: string): void {
  if (value < min || value > max) {
    throw new Error(`${name} deve estar entre ${min} e ${max}. Valor recebido: ${value}`);
  }
}

/** Valida se o valor é positivo */
export function validatePositive(value: number, name: string): void {
  if (value <= 0) {
    throw new Error(`${name} deve ser positivo. Valor recebido: ${value}`);
  }
}

/** Valida se o valor não é negativo */
export function validateNonNegative(value: number, name: string): void {
  if (value < 0) {
    throw new Error(`${name} não pode ser negativo. Valor recebido: ${value}`);
  }
}

// ============================================
// FORMATAÇÃO
// ============================================

/** Formata número com precisão específica */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/** Formata vazão em L/min */
export function formatFlow(m3s: number): string {
  return `${formatNumber(m3s_to_Lmin(m3s), 1)} L/min`;
}

/** Formata pressão em mca */
export function formatPressure(mca: number): string {
  return `${formatNumber(mca, 2)} mca`;
}

/** Formata diâmetro em mm */
export function formatDiameter(m: number): string {
  return `${formatNumber(m_to_mm(m), 0)} mm`;
}

/** Formata velocidade em m/s */
export function formatVelocity(ms: number): string {
  return `${formatNumber(ms, 2)} m/s`;
}

/** Formata potência em kW e CV */
export function formatPower(kW: number): string {
  return `${formatNumber(kW, 2)} kW (${formatNumber(kW_to_CV(kW), 2)} CV)`;
}
