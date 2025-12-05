/**
 * NTCB 13/2020 - Módulo de Saídas de Emergência
 * Exportações principais
 */

// Tipos
export * from './types';

// Tabelas normativas
export * from './tables';

// Motor de cálculo
export {
  calculatePopulation,
  calculateUP,
  calculateRequiredWidth,
  calculateExistingWidth,
  validateSector,
  calculateSector,
  calculateBuilding,
  generateEmergencyExitReport,
  formatDoorsDisplay,
  getMinimumWidth,
} from './calculator';

// Geração de relatórios
export {
  generateEmergencyExitReportHTML,
  openEmergencyExitReportForPrint,
  downloadEmergencyExitReportHTML,
} from './reportGenerator';
