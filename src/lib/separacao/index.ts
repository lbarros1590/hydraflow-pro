/**
 * NTCB 09/2020 - Módulo de Separação entre Edificações
 * Exportações principais
 */

// Tipos
export * from './types';

// Tabelas normativas
export {
  X_VALUES,
  Y_VALUES,
  TABLE_A1,
  TABLE_SEVERITY,
  TABLE_3,
  TABLE_4,
  TABLE_A2,
  FIRE_LOAD_TABLE,
  getClosestX,
  getClosestY,
  getTable3OpeningRange,
  getTable3Floors,
  getFireLoadByOccupancy,
  getOccupancyGroups,
  getOccupanciesByGroup,
  getSeverityFromFireLoad,
  getSeverityDescription,
  type FireLoadByOccupancy,
  type TRRFCategory,
  type ProtectionType,
  type ReducerRule,
} from './tables';

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
