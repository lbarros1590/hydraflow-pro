/**
 * Módulo de Demandas
 * 
 * Determina as vazões de demanda baseado na classificação
 * da edificação conforme normas do Corpo de Bombeiros.
 */

import type { BuildingClassification, DemandConfig, Node, NetworkGraph } from '../models/types';
import { Lmin_to_m3s } from './units';
import { calculatePressures, findMostUnfavorableHydrants } from './pressures';
import { solveHardyCross } from './hardyCross';
import { findHydrantNodes } from './graph';

/**
 * Classificação de edificações conforme IT-22 (Corpo de Bombeiros SP)
 * e normas similares de outros estados
 */
export const BUILDING_CLASSIFICATIONS: Record<string, BuildingClassification> = {
  // Risco Leve
  'residencial_unifamiliar': {
    code: 'A-1',
    name: 'Residencial Unifamiliar',
    riskLevel: 'leve',
    flowPerHydrant: 100,
    simultaneousHydrants: 1,
    minNozzlePressure: 10,
    reserveTime: 30,
    hoseLength: 30,
    hoseDiameter: 40
  },
  'residencial_multifamiliar': {
    code: 'A-2',
    name: 'Residencial Multifamiliar',
    riskLevel: 'leve',
    flowPerHydrant: 100,
    simultaneousHydrants: 2,
    minNozzlePressure: 10,
    reserveTime: 60,
    hoseLength: 30,
    hoseDiameter: 40
  },
  
  // Risco Médio
  'comercial_pequeno': {
    code: 'C-1',
    name: 'Comércio Pequeno',
    riskLevel: 'medio',
    flowPerHydrant: 150,
    simultaneousHydrants: 2,
    minNozzlePressure: 20,
    reserveTime: 60,
    hoseLength: 30,
    hoseDiameter: 40
  },
  'comercial_grande': {
    code: 'C-2',
    name: 'Comércio Grande',
    riskLevel: 'medio',
    flowPerHydrant: 150,
    simultaneousHydrants: 2,
    minNozzlePressure: 20,
    reserveTime: 60,
    hoseLength: 30,
    hoseDiameter: 40
  },
  'escritorios': {
    code: 'D-1',
    name: 'Escritórios',
    riskLevel: 'medio',
    flowPerHydrant: 150,
    simultaneousHydrants: 2,
    minNozzlePressure: 20,
    reserveTime: 60,
    hoseLength: 30,
    hoseDiameter: 40
  },
  'hotel': {
    code: 'B-1',
    name: 'Hotel/Pensão',
    riskLevel: 'medio',
    flowPerHydrant: 150,
    simultaneousHydrants: 2,
    minNozzlePressure: 20,
    reserveTime: 60,
    hoseLength: 30,
    hoseDiameter: 40
  },
  
  // Risco Elevado
  'shopping': {
    code: 'C-3',
    name: 'Shopping Center',
    riskLevel: 'elevado',
    flowPerHydrant: 200,
    simultaneousHydrants: 3,
    minNozzlePressure: 30,
    reserveTime: 90,
    hoseLength: 30,
    hoseDiameter: 65
  },
  'industrial_leve': {
    code: 'I-1',
    name: 'Industrial Baixo Risco',
    riskLevel: 'elevado',
    flowPerHydrant: 200,
    simultaneousHydrants: 2,
    minNozzlePressure: 30,
    reserveTime: 60,
    hoseLength: 30,
    hoseDiameter: 65
  },
  'industrial_medio': {
    code: 'I-2',
    name: 'Industrial Médio Risco',
    riskLevel: 'elevado',
    flowPerHydrant: 250,
    simultaneousHydrants: 3,
    minNozzlePressure: 40,
    reserveTime: 90,
    hoseLength: 30,
    hoseDiameter: 65
  },
  
  // Risco Especial
  'industrial_alto': {
    code: 'I-3',
    name: 'Industrial Alto Risco',
    riskLevel: 'especial',
    flowPerHydrant: 300,
    simultaneousHydrants: 4,
    minNozzlePressure: 40,
    reserveTime: 120,
    hoseLength: 30,
    hoseDiameter: 65
  },
  'deposito_inflamavel': {
    code: 'J-3',
    name: 'Depósito Inflamáveis',
    riskLevel: 'especial',
    flowPerHydrant: 300,
    simultaneousHydrants: 4,
    minNozzlePressure: 40,
    reserveTime: 120,
    hoseLength: 30,
    hoseDiameter: 65
  }
};

/**
 * Calcula a reserva técnica de incêndio (RTI)
 * 
 * RTI = Q × t × n
 * 
 * @param classification - Classificação da edificação
 * @returns Volume da reserva em litros
 */
export function calculateFireReserve(classification: BuildingClassification): number {
  return classification.flowPerHydrant * 
         classification.simultaneousHydrants * 
         classification.reserveTime;
}

/**
 * Cria a configuração de demanda baseada na classificação
 * 
 * @param classification - Classificação da edificação
 * @returns Configuração de demanda
 */
export function createDemandConfig(classification: BuildingClassification): DemandConfig {
  return {
    flowPerHydrant: classification.flowPerHydrant,
    flowPerHydrantM3s: Lmin_to_m3s(classification.flowPerHydrant),
    simultaneousHydrants: classification.simultaneousHydrants,
    totalFlow: classification.flowPerHydrant * classification.simultaneousHydrants,
    totalFlowM3s: Lmin_to_m3s(classification.flowPerHydrant * classification.simultaneousHydrants),
    minNozzlePressure: classification.minNozzlePressure,
    reserveVolume: calculateFireReserve(classification),
    hoseLength: classification.hoseLength,
    hoseDiameter: classification.hoseDiameter
  };
}

/**
 * Determina automaticamente os hidrantes mais desfavoráveis
 * 
 * Processo:
 * 1. Ativa todos os hidrantes com vazão nominal
 * 2. Resolve a rede
 * 3. Calcula pressões
 * 4. Ordena por pressão (menor = mais desfavorável)
 * 5. Seleciona os N mais desfavoráveis
 * 
 * @param graph - Grafo da rede
 * @param demandConfig - Configuração de demanda
 * @returns IDs dos hidrantes mais desfavoráveis
 */
export function findUnfavorableHydrantsAuto(
  graph: NetworkGraph,
  demandConfig: DemandConfig
): string[] {
  // Encontra todos os hidrantes
  const hydrants = findHydrantNodes(graph);
  
  if (hydrants.length === 0) {
    throw new Error('Nenhum hidrante encontrado na rede');
  }

  if (hydrants.length <= demandConfig.simultaneousHydrants) {
    // Poucos hidrantes - usa todos
    return hydrants.map(h => h.id);
  }

  // Cria demandas iguais para todos os hidrantes
  const demands = new Map<string, number>();
  for (const hydrant of hydrants) {
    demands.set(hydrant.id, demandConfig.flowPerHydrantM3s);
  }

  // Resolve a rede
  const result = solveHardyCross(graph, demands);
  
  // Calcula pressões com pressão de referência alta (para comparação)
  const pressures = calculatePressures(graph, result.flows, 100);

  // Encontra os mais desfavoráveis
  const unfavorable = findMostUnfavorableHydrants(graph, pressures);

  // Retorna os N mais desfavoráveis
  return unfavorable
    .slice(0, demandConfig.simultaneousHydrants)
    .map(h => h.nodeId);
}

/**
 * Cria o mapa de demandas para o cenário final de cálculo
 * 
 * @param graph - Grafo da rede
 * @param activeHydrantIds - IDs dos hidrantes ativos
 * @param flowPerHydrantM3s - Vazão por hidrante em m³/s
 * @returns Mapa de demandas
 */
export function createDemandMap(
  graph: NetworkGraph,
  activeHydrantIds: string[],
  flowPerHydrantM3s: number
): Map<string, number> {
  const demands = new Map<string, number>();

  // Inicializa todos os nós com demanda zero
  for (const [nodeId] of graph.nodeMap) {
    demands.set(nodeId, 0);
  }

  // Define demanda nos hidrantes ativos
  for (const hydrantId of activeHydrantIds) {
    demands.set(hydrantId, flowPerHydrantM3s);
  }

  return demands;
}

/**
 * Pipeline completo de determinação de demandas
 * 
 * @param graph - Grafo da rede
 * @param classificationKey - Chave da classificação
 * @param manualHydrantIds - IDs dos hidrantes selecionados manualmente (opcional)
 * @returns Configuração completa de demandas
 */
export function setupDemands(
  graph: NetworkGraph,
  classificationKey: string,
  manualHydrantIds?: string[]
): {
  config: DemandConfig;
  activeHydrants: string[];
  demands: Map<string, number>;
} {
  const classification = BUILDING_CLASSIFICATIONS[classificationKey];
  if (!classification) {
    throw new Error(`Classificação não encontrada: ${classificationKey}`);
  }

  const config = createDemandConfig(classification);

  // Determina hidrantes ativos
  let activeHydrants: string[];
  if (manualHydrantIds && manualHydrantIds.length >= config.simultaneousHydrants) {
    activeHydrants = manualHydrantIds.slice(0, config.simultaneousHydrants);
  } else {
    activeHydrants = findUnfavorableHydrantsAuto(graph, config);
  }

  // Cria mapa de demandas
  const demands = createDemandMap(graph, activeHydrants, config.flowPerHydrantM3s);

  return {
    config,
    activeHydrants,
    demands
  };
}
