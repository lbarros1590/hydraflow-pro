/**
 * Engine Principal - Pipeline Completo de Cálculo
 * 
 * Coordena todos os módulos para executar o cálculo completo do sistema hidráulico.
 */

import type { 
  SystemConfig, 
  SystemResult, 
  PipeDetailResult,
  BuildingClassification 
} from '../models/types';
import { buildGraph } from '../core/graph';
import { setupDemands, BUILDING_CLASSIFICATIONS, createDemandConfig } from '../core/demand';
import { solveHardyCross } from '../core/hardyCross';
import { 
  calculatePressures, 
  calculatePipeDetails, 
  findMostUnfavorableHydrants,
  calculateNozzlePressure,
  checkMinimumPressures 
} from '../core/pressures';
import { calculatePumpParameters } from '../core/pump';
import { calculateVelocity, checkVelocityLimits } from '../core/hazen';
import { m3s_to_Lmin, m_to_mm } from '../core/units';

/**
 * Executa o cálculo completo do sistema hidráulico
 * 
 * @param config - Configuração do sistema
 * @returns Resultado completo com todos os parâmetros calculados
 */
export function calculateSystem(config: SystemConfig): SystemResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Constrói o grafo da rede
  const graph = buildGraph(config.nodes, config.pipes);

  // 2. Obtém classificação da edificação
  const classification = BUILDING_CLASSIFICATIONS[config.buildingType];
  if (!classification) {
    throw new Error(`Tipo de edificação não reconhecido: ${config.buildingType}`);
  }

  // 3. Configura demandas e identifica hidrantes
  const { config: demandConfig, activeHydrants, demands } = setupDemands(
    graph,
    config.buildingType,
    config.manualHydrantSelection
  );

  // 4. Resolve a rede (Hardy-Cross se necessário)
  const hardyCrossResult = solveHardyCross(graph, demands);
  
  if (!hardyCrossResult.converged) {
    warnings.push(`Hardy-Cross não convergiu após ${hardyCrossResult.iterations} iterações`);
  }

  // 5. Calcula parâmetros da bomba
  const pumpResult = calculatePumpParameters(
    graph,
    hardyCrossResult.flows,
    demandConfig.minNozzlePressure,
    demandConfig.flowPerHydrant,
    config.pumpEfficiency || 0.65
  );

  // 6. Calcula pressões com a pressão da bomba determinada
  const pressures = calculatePressures(graph, hardyCrossResult.flows, pumpResult.minPressure);

  // 7. Calcula detalhes dos trechos
  const pipeDetailsMap = calculatePipeDetails(graph, hardyCrossResult.flows, pressures);
  
  const pipeDetails: PipeDetailResult[] = [];
  let allVelocitiesOk = true;

  for (const [pipeId, details] of pipeDetailsMap) {
    const pipe = graph.pipeMap.get(pipeId)!;
    const velocityCheck = checkVelocityLimits(details.velocity);
    
    if (!velocityCheck.ok && details.velocity > 5.0) {
      allVelocitiesOk = false;
      warnings.push(`Trecho ${pipe.name}: ${velocityCheck.message}`);
    }

    pipeDetails.push({
      pipeId,
      flow: details.flow,
      flowLmin: m3s_to_Lmin(details.flow),
      velocity: details.velocity,
      headLossUnit: details.headLossUnit,
      headLossTotal: details.headLossTotal,
      startPressure: details.startPressure,
      endPressure: details.endPressure,
      velocityStatus: details.velocity < 0.5 ? 'low' : details.velocity > 5.0 ? 'high' : 'ok'
    });
  }

  // 8. Analisa hidrantes
  const unfavorable = findMostUnfavorableHydrants(graph, pressures);
  const mostUnfavorableHydrants = unfavorable.map(h => ({
    id: h.nodeId,
    pressure: h.pressure,
    nozzlePressure: calculateNozzlePressure(
      h.pressure,
      demandConfig.flowPerHydrant,
      demandConfig.hoseLength,
      demandConfig.hoseDiameter
    )
  }));

  const allHydrants: Array<{ id: string; pressure: number; status: 'ok' | 'low' }> = [];
  for (const [nodeId, node] of graph.nodeMap) {
    if (node.type === 'hydrant') {
      const pressure = pressures.get(nodeId)?.dynamicPressure || 0;
      const nozzlePressure = calculateNozzlePressure(
        pressure,
        demandConfig.flowPerHydrant,
        demandConfig.hoseLength,
        demandConfig.hoseDiameter
      );
      allHydrants.push({
        id: nodeId,
        pressure,
        status: nozzlePressure >= demandConfig.minNozzlePressure ? 'ok' : 'low'
      });
    }
  }

  // 9. Verificação final de pressões
  const pressureCheck = checkMinimumPressures(graph, pressures, demandConfig.minNozzlePressure);
  if (!pressureCheck.ok) {
    for (const v of pressureCheck.violations) {
      const node = graph.nodeMap.get(v.nodeId);
      errors.push(`${node?.name || v.nodeId}: Pressão ${v.pressure.toFixed(2)} mca abaixo do mínimo`);
    }
  }

  // 10. Verificação de balanço de massa
  const massBalanceOk = !hardyCrossResult.massBalanceErrors || 
    hardyCrossResult.massBalanceErrors.length === 0;
  
  if (!massBalanceOk) {
    warnings.push('Erro de balanço de massa detectado na rede');
  }

  // Monta resultado final
  return {
    config: {
      buildingClassification: classification,
      demandConfig,
      activeHydrants
    },
    hydraulics: {
      flows: hardyCrossResult.flows,
      pressures,
      pipeDetails,
      hardyCross: {
        converged: hardyCrossResult.converged,
        iterations: hardyCrossResult.iterations,
        loops: hardyCrossResult.loops.length
      }
    },
    pump: pumpResult,
    hydrants: {
      mostUnfavorable: mostUnfavorableHydrants,
      all: allHydrants
    },
    checks: {
      minPressureOk: pressureCheck.ok,
      velocitiesOk: allVelocitiesOk,
      massBalanceOk,
      warnings,
      errors
    },
    reserve: {
      volumeLiters: demandConfig.reserveVolume,
      volumeM3: demandConfig.reserveVolume / 1000,
      timeMinutes: classification.reserveTime
    }
  };
}

/**
 * Executa apenas a simulação hidráulica (sem determinar bomba)
 * Útil para análise de cenários
 */
export function simulateNetwork(
  config: SystemConfig,
  sourcePressure: number
): {
  flows: Map<string, { flow: number; velocity: number }>;
  pressures: Map<string, number>;
  converged: boolean;
} {
  const graph = buildGraph(config.nodes, config.pipes);
  
  const { demands } = setupDemands(
    graph,
    config.buildingType,
    config.manualHydrantSelection
  );

  const result = solveHardyCross(graph, demands);
  const pressures = calculatePressures(graph, result.flows, sourcePressure);

  const flows = new Map<string, { flow: number; velocity: number }>();
  for (const [pipeId, flowResult] of result.flows) {
    const pipe = graph.pipeMap.get(pipeId)!;
    flows.set(pipeId, {
      flow: m3s_to_Lmin(Math.abs(flowResult.flow)),
      velocity: calculateVelocity(Math.abs(flowResult.flow), pipe.diameter)
    });
  }

  const pressureMap = new Map<string, number>();
  for (const [nodeId, p] of pressures) {
    pressureMap.set(nodeId, p.dynamicPressure);
  }

  return {
    flows,
    pressures: pressureMap,
    converged: result.converged
  };
}
