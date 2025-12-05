/**
 * NTCB 09/2020 - Módulo de Separação entre Edificações
 * Exportações principais
 */

// Tipos
export * from './types';

// Tabelas normativas
export * from './tables';

// Motor de cálculo
export {
  determineSeverity,
  getSeverity,
  calcOpeningPercentage,
  calcRelationX,
  lookupAlpha,
  getCoeficienteA,
  determineBeta,
  applyReducers,
  computeTable3Distance,
  computeTable4Distance,
  calculateSingleScenario,
  calculateSeparation,
} from './calculator';

// Geração de relatórios
export {
  generateReportHTML,
  openReportForPrint,
  downloadReportHTML,
} from './reportGenerator';
