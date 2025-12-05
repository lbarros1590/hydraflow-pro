/**
 * NTCB 09/2020 - Tipos e Interfaces
 */

export type Severity = 'I' | 'II' | 'III';

export type SituationType = 
  | 'fachada_fachada'      // Entre fachadas
  | 'cobertura_fachada'    // Cobertura x Fachada
  | 'geminadas'            // Edificações geminadas
  | 'pequenas';            // Até 12m e 750m² (Tabela 3)

export type CompartmentationType = 
  | 'none'                 // Sem compartimentação
  | 'horizontal'           // Apenas horizontal
  | 'vertical'             // Apenas vertical
  | 'both';                // Horizontal e vertical

export interface FacadeData {
  width: number;           // Largura da fachada (m)
  height: number;          // Altura da fachada (m)
  openingArea: number;     // Área das aberturas (m²)
  trrf: number;            // TRRF da fachada (min)
}

export interface BuildingData {
  id: string;
  name: string;
  occupationType: string;        // Tipo de ocupação
  fireLoadMJm2: number;          // Carga de incêndio (MJ/m²)
  facade: FacadeData;
  hasSprinklers: boolean;
  hasOpeningProtection: boolean;
  openingProtectionType?: string;
  compartmentationType: CompartmentationType;
  numberOfFloors: number;
  totalArea: number;             // Área total (m²)
}

export interface ProtectionAdvantage {
  type: string;
  description: string;
  reductionPercent: number;
  reductionValue: number;
}

export interface SingleScenarioResult {
  // Identificação
  expositoraName: string;
  emExposicaoName: string;
  
  // Dados da fachada (da expositora)
  severity: Severity;
  facadeWidth: number;
  facadeHeight: number;
  facadeArea: number;
  openingArea: number;
  openingPercentage: number;
  openingPercentageAdopted: number;
  
  // Cálculo da relação X
  relationCalculated: number;
  relationAdopted: number;
  
  // Coeficientes
  coefficientA: number;
  coefficientB: number;
  
  // Dimensão usada no cálculo
  dimensionUsed: 'width' | 'height';
  dimensionValue: number;
  
  // Fórmula e distância bruta
  formula: string;
  separationDistance: number;
  
  // Redutores aplicados
  reducers: ProtectionAdvantage[];
  totalReduction: number;
  
  // Distância final
  finalDistance: number;
  
  // Distância prevista/existente
  existingDistance: number;
  
  // Conformidade
  isCompliant: boolean;
}

export interface SeparationCalculationResult {
  // Os dois cenários obrigatórios
  scenario1: SingleScenarioResult; // Expositora → Em Exposição
  scenario2: SingleScenarioResult; // Em Exposição → Expositora (invertido)
  
  // Distância mínima exigida (maior entre os dois)
  minimumDistance: number;
  
  // Análise de pontos
  mostUnfavorablePoint: 'scenario1' | 'scenario2';
  mostFavorablePoint: 'scenario1' | 'scenario2';
  
  // Situação geral
  situationType: SituationType;
  hasFireDepartment: boolean;
  existingDistance: number;
  isCompliant: boolean;
  
  // Notas e observações
  notes: string[];
  warnings: string[];
}

export interface SeparationCalculationInput {
  expositora: BuildingData;
  emExposicao: BuildingData;
  situationType: SituationType;
  hasFireDepartment: boolean;
  existingDistance: number;
}

// Para uso simplificado (compatível com o código anterior)
export interface SimpleBuildingData {
  id: string;
  name: string;
  width: number;            // Largura da fachada (m)
  height: number;           // Altura da fachada (m)
  openingPercentage: number; // Porcentagem de aberturas (%)
  fireLoadMJm2: number;     // Carga de incêndio (MJ/m²)
  hasSprinklers: boolean;
  trrf?: number;            // TRRF (min)
  numberOfFloors?: number;
  totalArea?: number;
}

export interface SimpleCalculationInput {
  expositora: SimpleBuildingData;
  emExposicao: SimpleBuildingData;
  hasFireDepartment: boolean;
  existingDistance: number;
  situationType?: SituationType;
  reducers?: {
    paredeCartaFogo?: boolean;
    protecaoAberturas?: 'none' | 'inferior' | 'igual';
    cortinaAgua?: boolean;
  };
}
