/**
 * NTCB 09/2020 - Tabelas Normativas
 * Corpo de Bombeiros Militar do Estado de Mato Grosso
 */

// ===========================================
// TABELA A-1 - Índice das distâncias de segurança (α)
// D = α × (largura ou altura) + β
// ===========================================

// Valores de X (relação largura/altura ou inversa)
export const X_VALUES = [1, 1.3, 1.6, 2, 2.5, 3.2, 4, 5, 6, 8, 10, 13, 16, 20, 25, 32, 40];

// Valores de Y (porcentagem de aberturas) por severidade
export const Y_VALUES: Record<'I' | 'II' | 'III', number[]> = {
  I: [30, 40, 50, 60, 80, 100],
  II: [15, 20, 25, 30, 40, 50, 60, 80, 100],
  III: [7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 80, 100],
};

// Tabela A-1 completa conforme norma
// Estrutura: [severidade][porcentagem de aberturas Y][relação X] = α
export const TABLE_A1: Record<'I' | 'II' | 'III', Record<number, Record<number, number>>> = {
  // Severidade I (0-680 MJ/m²)
  I: {
    30: { 1: 0.4, 1.3: 0.4, 1.6: 0.44, 2: 0.46, 2.5: 0.48, 3.2: 0.49, 4: 0.5, 5: 0.51, 6: 0.51, 8: 0.51, 10: 0.51, 13: 0.51, 16: 0.51, 20: 0.51, 25: 0.51, 32: 0.51, 40: 0.51 },
    40: { 1: 0.6, 1.3: 0.66, 1.6: 0.73, 2: 0.79, 2.5: 0.84, 3.2: 0.88, 4: 0.9, 5: 0.92, 6: 0.93, 8: 0.94, 10: 0.94, 13: 0.95, 16: 0.95, 20: 0.95, 25: 0.95, 32: 0.95, 40: 0.95 },
    50: { 1: 0.8, 1.3: 0.8, 1.6: 0.94, 2: 1.04, 2.5: 1.1, 3.2: 1.17, 4: 1.23, 5: 1.27, 6: 1.30, 8: 1.32, 10: 1.33, 13: 1.33, 16: 1.34, 20: 1.34, 25: 1.34, 32: 1.34, 40: 1.34 },
    60: { 1: 0.9, 1.3: 1, 1.6: 1.11, 2: 1.22, 2.5: 1.33, 3.2: 1.42, 4: 1.51, 5: 1.58, 6: 1.63, 8: 1.66, 10: 1.69, 13: 1.7, 16: 1.71, 20: 1.71, 25: 1.71, 32: 1.71, 40: 1.71 },
    80: { 1: 1, 1.3: 1.14, 1.6: 1.26, 2: 1.39, 2.5: 1.52, 3.2: 1.64, 4: 1.76, 5: 1.85, 6: 1.93, 8: 1.99, 10: 2.03, 13: 2.05, 16: 2.07, 20: 2.08, 25: 2.08, 32: 2.08, 40: 2.08 },
    100: { 1: 1.2, 1.3: 1.37, 1.6: 1.52, 2: 1.68, 2.5: 1.85, 3.2: 2.02, 4: 2.18, 5: 2.34, 6: 2.48, 8: 2.59, 10: 2.67, 13: 2.73, 16: 2.77, 20: 2.79, 25: 2.81, 32: 2.81, 40: 2.81 },
  },
  // Severidade II (681-1460 MJ/m²)
  II: {
    15: { 1: 0.4, 1.3: 0.4, 1.6: 0.44, 2: 0.46, 2.5: 0.48, 3.2: 0.49, 4: 0.5, 5: 0.51, 6: 0.51, 8: 0.51, 10: 0.51, 13: 0.51, 16: 0.51, 20: 0.51, 25: 0.51, 32: 0.51, 40: 0.51 },
    20: { 1: 0.6, 1.3: 0.66, 1.6: 0.73, 2: 0.79, 2.5: 0.84, 3.2: 0.88, 4: 0.9, 5: 0.92, 6: 0.93, 8: 0.94, 10: 0.94, 13: 0.95, 16: 0.95, 20: 0.95, 25: 0.95, 32: 0.95, 40: 0.95 },
    25: { 1: 0.8, 1.3: 0.8, 1.6: 0.94, 2: 1.04, 2.5: 1.1, 3.2: 1.17, 4: 1.23, 5: 1.27, 6: 1.30, 8: 1.32, 10: 1.33, 13: 1.33, 16: 1.34, 20: 1.34, 25: 1.34, 32: 1.34, 40: 1.34 },
    30: { 1: 0.9, 1.3: 1, 1.6: 1.11, 2: 1.22, 2.5: 1.33, 3.2: 1.42, 4: 1.51, 5: 1.58, 6: 1.63, 8: 1.66, 10: 1.69, 13: 1.7, 16: 1.71, 20: 1.71, 25: 1.71, 32: 1.71, 40: 1.71 },
    40: { 1: 1, 1.3: 1.14, 1.6: 1.26, 2: 1.39, 2.5: 1.52, 3.2: 1.64, 4: 1.76, 5: 1.85, 6: 1.93, 8: 1.99, 10: 2.03, 13: 2.05, 16: 2.07, 20: 2.08, 25: 2.08, 32: 2.08, 40: 2.08 },
    50: { 1: 1.2, 1.3: 1.37, 1.6: 1.52, 2: 1.68, 2.5: 1.85, 3.2: 2.02, 4: 2.18, 5: 2.34, 6: 2.48, 8: 2.59, 10: 2.67, 13: 2.73, 16: 2.77, 20: 2.79, 25: 2.81, 32: 2.81, 40: 2.81 },
    60: { 1: 1.4, 1.3: 1.56, 1.6: 1.74, 2: 1.93, 2.5: 2.13, 3.2: 2.34, 4: 2.55, 5: 2.76, 6: 2.95, 8: 3.12, 10: 3.26, 13: 3.36, 16: 3.43, 20: 3.48, 25: 3.51, 32: 3.52, 40: 3.53 },
    80: { 1: 1.6, 1.3: 1.73, 1.6: 1.94, 2: 2.15, 2.5: 2.38, 3.2: 2.63, 4: 2.88, 5: 3.13, 6: 3.37, 8: 3.6, 10: 3.79, 13: 3.95, 16: 4.07, 20: 4.15, 25: 4.2, 32: 4.22, 40: 4.24 },
    100: { 1: 1.8, 1.3: 2.04, 1.6: 2.28, 2: 2.54, 2.5: 2.82, 3.2: 3.12, 4: 3.44, 5: 3.77, 6: 4.11, 8: 4.43, 10: 4.74, 13: 5.01, 16: 5.24, 20: 5.41, 25: 5.52, 32: 5.6, 40: 5.64 },
  },
  // Severidade III (acima de 1460 MJ/m²)
  III: {
    7.5: { 1: 0.4, 1.3: 0.4, 1.6: 0.44, 2: 0.46, 2.5: 0.48, 3.2: 0.49, 4: 0.5, 5: 0.51, 6: 0.51, 8: 0.51, 10: 0.51, 13: 0.51, 16: 0.51, 20: 0.51, 25: 0.51, 32: 0.51, 40: 0.51 },
    10: { 1: 0.6, 1.3: 0.66, 1.6: 0.73, 2: 0.79, 2.5: 0.84, 3.2: 0.88, 4: 0.9, 5: 0.92, 6: 0.93, 8: 0.94, 10: 0.94, 13: 0.95, 16: 0.95, 20: 0.95, 25: 0.95, 32: 0.95, 40: 0.95 },
    12.5: { 1: 0.8, 1.3: 0.8, 1.6: 0.94, 2: 1.04, 2.5: 1.1, 3.2: 1.17, 4: 1.23, 5: 1.27, 6: 1.30, 8: 1.32, 10: 1.33, 13: 1.33, 16: 1.34, 20: 1.34, 25: 1.34, 32: 1.34, 40: 1.34 },
    15: { 1: 0.9, 1.3: 1, 1.6: 1.11, 2: 1.22, 2.5: 1.33, 3.2: 1.42, 4: 1.51, 5: 1.58, 6: 1.63, 8: 1.66, 10: 1.69, 13: 1.7, 16: 1.71, 20: 1.71, 25: 1.71, 32: 1.71, 40: 1.71 },
    20: { 1: 1, 1.3: 1.14, 1.6: 1.26, 2: 1.39, 2.5: 1.52, 3.2: 1.64, 4: 1.76, 5: 1.85, 6: 1.93, 8: 1.99, 10: 2.03, 13: 2.05, 16: 2.07, 20: 2.08, 25: 2.08, 32: 2.08, 40: 2.08 },
    25: { 1: 1.2, 1.3: 1.37, 1.6: 1.52, 2: 1.68, 2.5: 1.85, 3.2: 2.02, 4: 2.18, 5: 2.34, 6: 2.48, 8: 2.59, 10: 2.67, 13: 2.73, 16: 2.77, 20: 2.79, 25: 2.81, 32: 2.81, 40: 2.81 },
    30: { 1: 1.4, 1.3: 1.56, 1.6: 1.74, 2: 1.93, 2.5: 2.13, 3.2: 2.34, 4: 2.55, 5: 2.76, 6: 2.95, 8: 3.12, 10: 3.26, 13: 3.36, 16: 3.43, 20: 3.48, 25: 3.51, 32: 3.52, 40: 3.53 },
    40: { 1: 1.6, 1.3: 1.73, 1.6: 1.94, 2: 2.15, 2.5: 2.38, 3.2: 2.63, 4: 2.88, 5: 3.13, 6: 3.37, 8: 3.6, 10: 3.79, 13: 3.95, 16: 4.07, 20: 4.15, 25: 4.2, 32: 4.22, 40: 4.24 },
    50: { 1: 1.8, 1.3: 2.04, 1.6: 2.28, 2: 2.54, 2.5: 2.82, 3.2: 3.12, 4: 3.44, 5: 3.77, 6: 4.11, 8: 4.43, 10: 4.74, 13: 5.01, 16: 5.24, 20: 5.41, 25: 5.52, 32: 5.6, 40: 5.64 },
    60: { 1: 2.1, 1.3: 2.3, 1.6: 2.57, 2: 2.87, 2.5: 3.2, 3.2: 3.55, 4: 3.93, 5: 4.33, 6: 4.74, 8: 5.16, 10: 5.56, 13: 5.95, 16: 6.29, 20: 6.56, 25: 6.77, 32: 6.92, 40: 7.01 },
    80: { 1: 2.3, 1.3: 2.54, 1.6: 2.84, 2: 3.17, 2.5: 3.54, 3.2: 3.93, 4: 4.36, 5: 4.83, 6: 5.3, 8: 5.8, 10: 6.3, 13: 6.78, 16: 7.23, 20: 7.63, 25: 7.94, 32: 8.18, 40: 8.34 },
    100: { 1: 3, 1.3: 3.32, 1.6: 3.72, 2: 4.16, 2.5: 4.65, 3.2: 5.19, 4: 5.78, 5: 6.43, 6: 7.13, 8: 7.88, 10: 8.67, 13: 9.5, 16: 10.3, 20: 11.1, 25: 11.9, 32: 12.5, 40: 13.1 },
  },
};

// ===========================================
// TABELA 2 - Severidade da carga de incêndio (NTCB 07/2020)
// ===========================================
export const TABLE_SEVERITY = {
  I: { min: 0, max: 680, description: 'Baixa (até 680 MJ/m²)' },
  II: { min: 681, max: 1460, description: 'Média (681 a 1460 MJ/m²)' },
  III: { min: 1461, max: Infinity, description: 'Alta (acima de 1460 MJ/m²)' },
};

// ===========================================
// CARGA DE INCÊNDIO POR OCUPAÇÃO (NTCB 07/2020 - Tabela A.1)
// ===========================================
export interface FireLoadByOccupancy {
  code: string;
  group: string;
  description: string;
  fireLoadMJm2: number;
  riskClass: 'baixo' | 'medio' | 'alto';
}

export const FIRE_LOAD_TABLE: FireLoadByOccupancy[] = [
  // GRUPO A - RESIDENCIAL
  { code: 'A-1', group: 'Residencial', description: 'Habitação unifamiliar', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'A-2', group: 'Residencial', description: 'Habitação multifamiliar', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'A-3', group: 'Residencial', description: 'Habitação coletiva', fireLoadMJm2: 400, riskClass: 'medio' },
  
  // GRUPO B - HOSPEDAGEM
  { code: 'B-1', group: 'Hospedagem', description: 'Hotel', fireLoadMJm2: 500, riskClass: 'medio' },
  { code: 'B-2', group: 'Hospedagem', description: 'Hotel residencial', fireLoadMJm2: 400, riskClass: 'medio' },
  
  // GRUPO C - COMERCIAL
  { code: 'C-1', group: 'Comercial', description: 'Comércio baixa carga', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'C-2', group: 'Comercial', description: 'Comércio em geral', fireLoadMJm2: 600, riskClass: 'medio' },
  { code: 'C-3', group: 'Comercial', description: 'Shopping centers', fireLoadMJm2: 800, riskClass: 'medio' },
  
  // GRUPO D - SERVIÇOS
  { code: 'D-1', group: 'Serviços', description: 'Escritórios', fireLoadMJm2: 700, riskClass: 'medio' },
  { code: 'D-2', group: 'Serviços', description: 'Agências bancárias', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'D-3', group: 'Serviços', description: 'Serviços de reparação', fireLoadMJm2: 500, riskClass: 'medio' },
  { code: 'D-4', group: 'Serviços', description: 'Laboratórios', fireLoadMJm2: 500, riskClass: 'medio' },
  
  // GRUPO E - EDUCACIONAL
  { code: 'E-1', group: 'Educacional', description: 'Escolas', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'E-2', group: 'Educacional', description: 'Escolas especiais', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'E-3', group: 'Educacional', description: 'Academias', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'E-4', group: 'Educacional', description: 'Centros de treinamento', fireLoadMJm2: 400, riskClass: 'medio' },
  { code: 'E-5', group: 'Educacional', description: 'Pré-escolas', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'E-6', group: 'Educacional', description: 'Escolas especiais', fireLoadMJm2: 300, riskClass: 'baixo' },
  
  // GRUPO F - REUNIÃO DE PÚBLICO
  { code: 'F-1', group: 'Reunião Público', description: 'Museus/bibliotecas', fireLoadMJm2: 500, riskClass: 'medio' },
  { code: 'F-2', group: 'Reunião Público', description: 'Igrejas/velórios', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'F-3', group: 'Reunião Público', description: 'Centros esportivos', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'F-4', group: 'Reunião Público', description: 'Estações/terminais', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'F-5', group: 'Reunião Público', description: 'Teatros/cinemas', fireLoadMJm2: 400, riskClass: 'medio' },
  { code: 'F-6', group: 'Reunião Público', description: 'Clubes sociais', fireLoadMJm2: 400, riskClass: 'medio' },
  { code: 'F-7', group: 'Reunião Público', description: 'Construções provisórias', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'F-8', group: 'Reunião Público', description: 'Restaurantes', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'F-9', group: 'Reunião Público', description: 'Recreação pública', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'F-10', group: 'Reunião Público', description: 'Exposições', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'F-11', group: 'Reunião Público', description: 'Boates', fireLoadMJm2: 400, riskClass: 'medio' },
  
  // GRUPO G - AUTOMOTIVOS
  { code: 'G-1', group: 'Automotivo', description: 'Garagem automática', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'G-2', group: 'Automotivo', description: 'Garagem coletiva', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'G-3', group: 'Automotivo', description: 'Postos de combustível', fireLoadMJm2: 800, riskClass: 'alto' },
  { code: 'G-4', group: 'Automotivo', description: 'Oficinas mecânicas', fireLoadMJm2: 500, riskClass: 'medio' },
  { code: 'G-5', group: 'Automotivo', description: 'Hangares', fireLoadMJm2: 800, riskClass: 'alto' },
  
  // GRUPO H - SAÚDE
  { code: 'H-1', group: 'Saúde', description: 'Veterinário', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'H-2', group: 'Saúde', description: 'Asilos', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'H-3', group: 'Saúde', description: 'Hospitais', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'H-4', group: 'Saúde', description: 'Edificações públicas', fireLoadMJm2: 400, riskClass: 'medio' },
  { code: 'H-5', group: 'Saúde', description: 'Prisões', fireLoadMJm2: 300, riskClass: 'baixo' },
  { code: 'H-6', group: 'Saúde', description: 'Clínicas', fireLoadMJm2: 300, riskClass: 'baixo' },
  
  // GRUPO I - INDUSTRIAL
  { code: 'I-1', group: 'Industrial', description: 'Industrial baixo', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'I-2', group: 'Industrial', description: 'Industrial médio', fireLoadMJm2: 800, riskClass: 'medio' },
  { code: 'I-3', group: 'Industrial', description: 'Industrial alto', fireLoadMJm2: 2000, riskClass: 'alto' },
  
  // GRUPO J - DEPÓSITOS
  { code: 'J-1', group: 'Depósitos', description: 'Depósito incombustível', fireLoadMJm2: 50, riskClass: 'baixo' },
  { code: 'J-2', group: 'Depósitos', description: 'Depósito baixa carga', fireLoadMJm2: 200, riskClass: 'baixo' },
  { code: 'J-3', group: 'Depósitos', description: 'Depósito média carga', fireLoadMJm2: 800, riskClass: 'medio' },
  { code: 'J-4', group: 'Depósitos', description: 'Depósito alta carga', fireLoadMJm2: 2000, riskClass: 'alto' },
  
  // GRUPO L - EXPLOSIVOS
  { code: 'L-1', group: 'Explosivos', description: 'Comércio explosivos', fireLoadMJm2: 500, riskClass: 'alto' },
  { code: 'L-2', group: 'Explosivos', description: 'Indústria explosivos', fireLoadMJm2: 1000, riskClass: 'alto' },
  { code: 'L-3', group: 'Explosivos', description: 'Depósito explosivos', fireLoadMJm2: 1000, riskClass: 'alto' },
  
  // GRUPO M - ESPECIAIS
  { code: 'M-1', group: 'Especiais', description: 'Túneis', fireLoadMJm2: 300, riskClass: 'medio' },
  { code: 'M-3', group: 'Especiais', description: 'Central telefônica', fireLoadMJm2: 600, riskClass: 'medio' },
  { code: 'M-4', group: 'Especiais', description: 'Em construção', fireLoadMJm2: 500, riskClass: 'medio' },
  { code: 'M-5', group: 'Especiais', description: 'Silos', fireLoadMJm2: 800, riskClass: 'alto' },
  { code: 'M-8', group: 'Especiais', description: 'Parques eólicos/solares', fireLoadMJm2: 100, riskClass: 'baixo' },
];

/**
 * Obtém a carga de incêndio pela ocupação
 */
export function getFireLoadByOccupancy(code: string): FireLoadByOccupancy | undefined {
  return FIRE_LOAD_TABLE.find(f => f.code === code);
}

/**
 * Obtém todos os grupos de ocupação únicos
 */
export function getOccupancyGroups(): string[] {
  return [...new Set(FIRE_LOAD_TABLE.map(f => f.group))];
}

/**
 * Obtém ocupações por grupo
 */
export function getOccupanciesByGroup(group: string): FireLoadByOccupancy[] {
  return FIRE_LOAD_TABLE.filter(f => f.group === group);
}

/**
 * Determina a severidade baseada na carga de incêndio (Tabela 2)
 */
export function getSeverityFromFireLoad(fireLoadMJm2: number): 'I' | 'II' | 'III' {
  if (fireLoadMJm2 <= TABLE_SEVERITY.I.max) return 'I';
  if (fireLoadMJm2 <= TABLE_SEVERITY.II.max) return 'II';
  return 'III';
}

/**
 * Obtém a descrição da severidade
 */
export function getSeverityDescription(severity: 'I' | 'II' | 'III'): string {
  return TABLE_SEVERITY[severity].description;
}

// ===========================================
// TABELA 3 - Edificações até 12m e 750m²
// ===========================================
export const TABLE_3: Record<string, Record<number, number>> = {
  // Porcentagem de abertura: { pavimentos: distância }
  '0-10': { 1: 4, 2: 6, 3: 8 },
  '11-20': { 1: 5, 2: 7, 3: 9 },
  '21-30': { 1: 6, 2: 8, 3: 10 },
  '31-40': { 1: 7, 2: 9, 3: 11 },
  '41-50': { 1: 8, 2: 10, 3: 12 },
  '51-70': { 1: 9, 2: 11, 3: 13 },
  '71-100': { 1: 10, 2: 12, 3: 14 },
};

// ===========================================
// TABELA 4 - Separação cobertura x fachada
// ===========================================
export const TABLE_4: Record<number, number> = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
};

// ===========================================
// TABELA A-2 - Redutores de distância
// ===========================================
export type TRRFCategory = 'combustivel_ate_30' | 'trrf_30_90' | 'trrf_90_120' | 'trrf_120_mais';
export type ProtectionType = 'parede_corta_fogo' | 'protecao_abertura_30_inferior' | 'protecao_abertura_igual' | 'cortina_agua';

export interface ReducerRule {
  type: ProtectionType;
  description: string;
  reductions: Record<TRRFCategory, { factor: number | null; maxDistance?: number; note?: string }>;
}

export const TABLE_A2: ReducerRule[] = [
  {
    type: 'parede_corta_fogo',
    description: 'Parede corta-fogo entre as edificações, com resistência ao fogo de 120 min',
    reductions: {
      combustivel_ate_30: { factor: null, note: 'Distância eliminada' },
      trrf_30_90: { factor: null, note: 'Distância eliminada' },
      trrf_90_120: { factor: null, note: 'Distância eliminada' },
      trrf_120_mais: { factor: null, note: 'Distância eliminada' },
    },
  },
  {
    type: 'protecao_abertura_30_inferior',
    description: 'Proteção das aberturas das fachadas com TRRF 30 min inferior ao da parede',
    reductions: {
      combustivel_ate_30: { factor: 0, note: 'Ineficiente' },
      trrf_30_90: { factor: 0.5, note: 'Reduzir em 50%' },
      trrf_90_120: { factor: 0.5, maxDistance: 6, note: 'Reduzir em 50%, máximo 6m' },
      trrf_120_mais: { factor: 0.5, maxDistance: 6, note: 'Reduzir em 50%, máximo 6m' },
    },
  },
  {
    type: 'protecao_abertura_igual',
    description: 'Proteção das aberturas das fachadas com TRRF igual ao da parede',
    reductions: {
      combustivel_ate_30: { factor: 0, note: 'Ineficiente' },
      trrf_30_90: { factor: 0.4, note: 'Reduzir em 60%' },
      trrf_90_120: { factor: 0.3, note: 'Reduzir em 70%' },
      trrf_120_mais: { factor: 0.25, maxDistance: 3, note: 'Reduzir em 75%, máximo 3m' },
    },
  },
  {
    type: 'cortina_agua',
    description: 'Cortina d\'água por inundação',
    reductions: {
      combustivel_ate_30: { factor: 0.5, note: 'Reduzir em 50% (toda fachada)' },
      trrf_30_90: { factor: 0.5, note: 'Reduzir em 50% (nas aberturas)' },
      trrf_90_120: { factor: 0.5, note: 'Reduzir em 50% (nas aberturas)' },
      trrf_120_mais: { factor: 0.5, note: 'Reduzir em 50% (nas aberturas)' },
    },
  },
];

// ===========================================
// Funções auxiliares de lookup
// ===========================================

/**
 * Obtém o valor X da tabela mais próximo (sempre arredonda para cima)
 */
export function getClosestX(ratio: number): number {
  for (const x of X_VALUES) {
    if (ratio <= x) return x;
  }
  return X_VALUES[X_VALUES.length - 1];
}

/**
 * Obtém o valor Y da porcentagem de aberturas mais próximo (sempre arredonda para cima)
 */
export function getClosestY(percentage: number, severity: 'I' | 'II' | 'III'): number {
  const yValues = Y_VALUES[severity];
  for (const y of yValues) {
    if (percentage <= y) return y;
  }
  return yValues[yValues.length - 1];
}

/**
 * Obtém a faixa de porcentagem de abertura para Tabela 3
 */
export function getTable3OpeningRange(percentage: number): string {
  if (percentage <= 10) return '0-10';
  if (percentage <= 20) return '11-20';
  if (percentage <= 30) return '21-30';
  if (percentage <= 40) return '31-40';
  if (percentage <= 50) return '41-50';
  if (percentage <= 70) return '51-70';
  return '71-100';
}

/**
 * Obtém o número de pavimentos para Tabela 3 (máximo 3)
 */
export function getTable3Floors(floors: number): number {
  if (floors <= 1) return 1;
  if (floors === 2) return 2;
  return 3; // 3 ou mais
}
