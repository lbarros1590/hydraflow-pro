/**
 * Tipos e Interfaces do Sistema Hidráulico - NTCB 19/2020
 */

import type { AccessoryType } from '@/core/equivalentLength';

// ============================================
// TIPOS BASE
// ============================================

export type NodeType = 'source' | 'pump' | 'junction' | 'hydrant' | 'reservoir';
export type PipeMaterial = 'PVC' | 'Metal';
export type SystemType = '1' | '2' | '3' | '4' | '5';

export interface Node {
  id: string;
  type: NodeType;
  name: string;
  elevation: number;
  x?: number;
  y?: number;
  description?: string;
}

export interface PipeAccessory {
  type: AccessoryType;
  quantity: number;
  equivalentLengthUnit: number;
  equivalentLengthTotal: number;
}

export interface Pipe {
  id: string;
  name: string;
  startNodeId: string;
  endNodeId: string;
  length: number;
  diameter: number;
  roughness: number;
  material: string;
  accessories?: PipeAccessory[];
  equivalentLength?: number;
  fittings?: Fitting[];
}

export interface Fitting {
  type: string;
  quantity: number;
  equivalentLength: number;
  description?: string;
}

// ============================================
// GRAFO DA REDE
// ============================================

export interface NetworkGraph {
  nodeMap: Map<string, Node>;
  adjacency: Map<string, Array<{ pipeId: string; targetNode: string }>>;
  pipeMap: Map<string, Pipe>;
}

export interface Loop {
  id: string;
  nodeIds: string[];
  pipeIds: Array<{ pipeId: string; direction: 1 | -1 }>;
  headLossError?: number;
}

// ============================================
// RESULTADOS DE CÁLCULO
// ============================================

export interface FlowResult {
  pipeId: string;
  flow: number;
  absFlow: number;
  direction: 1 | -1;
}

export interface PressureResult {
  nodeId: string;
  staticPressure: number;
  dynamicPressure: number;
  elevation: number;
  residualPressure: number;
  headLossFromSource?: number;
}

export interface PipeDetailResult {
  pipeId: string;
  flow: number;
  flowLmin: number;
  velocity: number;
  headLossUnit: number;
  headLossTotal: number;
  startPressure: number;
  endPressure: number;
  equivalentLength?: number;
  velocityStatus: 'ok' | 'low' | 'high';
}

export interface HardyCrossResult {
  flows: Map<string, FlowResult>;
  converged: boolean;
  iterations: number;
  maxError: number;
  loops: Loop[];
  massBalanceErrors?: Array<{ nodeId: string; error: number }>;
  maxMassError?: number;
}

export interface PumpResult {
  minPressure: number;
  totalFlow: number;
  totalFlowLmin: number;
  hydraulicPower: number;
  motorPower: number;
  motorPowerCV: number;
  commercialPowerCV: number;
  efficiency: number;
}

// ============================================
// CLASSIFICAÇÃO E DEMANDAS
// ============================================

export interface BuildingClassification {
  code: string;
  name: string;
  riskLevel: 'leve' | 'medio' | 'elevado' | 'especial';
  flowPerHydrant: number;
  simultaneousHydrants: number;
  minNozzlePressure: number;
  reserveTime: number;
  hoseLength: number;
  hoseDiameter: number;
}

export interface DemandConfig {
  flowPerHydrant: number;
  flowPerHydrantM3s: number;
  simultaneousHydrants: number;
  totalFlow: number;
  totalFlowM3s: number;
  minNozzlePressure: number;
  reserveVolume: number;
  hoseLength: number;
  hoseDiameter: number;
}

// ============================================
// CONFIGURAÇÃO DO SISTEMA
// ============================================

export interface SystemConfig {
  nodes: Node[];
  pipes: Pipe[];
  buildingType?: string;
  pumpEfficiency: number;
  manualHydrantSelection?: string[];
  occupancyCode?: string;
  fireLoadMJm2?: number;
  totalAreaM2?: number;
  buildingHeight?: number;
}

// ============================================
// RESULTADO COMPLETO
// ============================================

export interface SystemResult {
  config: {
    buildingClassification?: BuildingClassification;
    demandConfig: DemandConfig;
    activeHydrants: string[];
    ntcbSystemType?: string;
  };
  
  hydraulics: {
    flows: Map<string, FlowResult>;
    pressures: Map<string, PressureResult>;
    pipeDetails: PipeDetailResult[];
    hardyCross: {
      converged: boolean;
      iterations: number;
      loops: number;
    };
  };
  
  pump: PumpResult;
  
  hydrants: {
    mostUnfavorable: Array<{ id: string; pressure: number; nozzlePressure: number }>;
    mostFavorable?: { id: string; pressure: number; nozzlePressure: number };
    all: Array<{ id: string; pressure: number; status: 'ok' | 'low' }>;
  };
  
  checks: {
    minPressureOk: boolean;
    velocitiesOk: boolean;
    massBalanceOk: boolean;
    warnings: string[];
    errors: string[];
  };
  
  reserve: {
    volumeLiters: number;
    volumeM3: number;
    timeMinutes: number;
  };
}

// ============================================
// TABELAS DE REFERÊNCIA
// ============================================

export interface FittingTable {
  type: string;
  name: string;
  equivalentLengths: Record<number, number>;
}

export const STANDARD_FITTINGS: FittingTable[] = [
  { type: 'cotovelo_90', name: 'Cotovelo 90°', equivalentLengths: { 25: 1.1, 32: 1.4, 40: 1.6, 50: 2.0, 65: 2.6, 80: 3.2, 100: 4.0, 125: 5.0, 150: 6.0 } },
  { type: 'cotovelo_45', name: 'Cotovelo 45°', equivalentLengths: { 25: 0.5, 32: 0.7, 40: 0.8, 50: 1.0, 65: 1.3, 80: 1.6, 100: 2.0, 125: 2.5, 150: 3.0 } },
  { type: 'te_passagem_direta', name: 'Tê - Passagem Direta', equivalentLengths: { 25: 0.7, 32: 0.9, 40: 1.1, 50: 1.3, 65: 1.7, 80: 2.1, 100: 2.6, 125: 3.3, 150: 4.0 } },
  { type: 'te_saida_lateral', name: 'Tê - Saída Lateral', equivalentLengths: { 25: 2.3, 32: 3.0, 40: 3.5, 50: 4.3, 65: 5.6, 80: 6.9, 100: 8.6, 125: 10.8, 150: 13.0 } },
  { type: 'registro_gaveta', name: 'Registro de Gaveta', equivalentLengths: { 25: 0.2, 32: 0.3, 40: 0.3, 50: 0.4, 65: 0.5, 80: 0.6, 100: 0.8, 125: 1.0, 150: 1.2 } },
  { type: 'registro_globo', name: 'Registro de Globo', equivalentLengths: { 25: 8.1, 32: 10.5, 40: 12.3, 50: 15.0, 65: 19.5, 80: 24.0, 100: 30.0, 125: 37.5, 150: 45.0 } },
  { type: 'valvula_retencao', name: 'Válvula de Retenção', equivalentLengths: { 25: 2.5, 32: 3.2, 40: 3.8, 50: 4.6, 65: 6.0, 80: 7.4, 100: 9.2, 125: 11.5, 150: 13.8 } },
  { type: 'reducao', name: 'Redução', equivalentLengths: { 25: 0.5, 32: 0.7, 40: 0.8, 50: 1.0, 65: 1.3, 80: 1.6, 100: 2.0, 125: 2.5, 150: 3.0 } }
];
