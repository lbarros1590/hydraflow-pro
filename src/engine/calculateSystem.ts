/**
 * Engine Principal - Pipeline Completo de Cálculo
 * NTCB 19/2020 - Corpo de Bombeiros Militar do Estado de Mato Grosso
 * 
 * Coordena todos os módulos para executar o cálculo completo do sistema hidráulico.
 */

import type { 
  SystemConfig, 
  SystemResult, 
  PipeDetailResult,
  DemandConfig
} from '../models/types';
import { buildGraph, findHydrantNodes, findSourceNode } from '../core/graph';
import { createNTCBDemandConfig, getSystemType, getSystemConfig, calculateRTI } from '../core/ntcbClassification';
import { solveHardyCross } from '../core/hardyCross';
import { propagateFlowsTree } from '../core/propagation';
import { 
  calculatePressures, 
  calculatePipeDetails, 
  findMostUnfavorableHydrants,
  calculateNozzlePressure,
  checkMinimumPressures 
} from '../core/pressures';
import { calculatePumpParameters, findMinimumPumpPressure } from '../core/pump';
import { calculateVelocity, checkVelocityLimits, calculateHeadLoss } from '../core/hazen';
import { m3s_to_Lmin, Lmin_to_m3s, m_to_mm } from '../core/units';

/**
 * Executa o cálculo completo do sistema hidráulico conforme NTCB 19/2020
 * 
 * @param config - Configuração do sistema
 * @returns Resultado completo com todos os parâmetros calculados
 */
export function calculateSystem(config: SystemConfig): SystemResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Constrói o grafo da rede
  const graph = buildGraph(config.nodes, config.pipes);

  // 2. Determina enquadramento normativo NTCB 19/2020
  const occupancyCode = config.occupancyCode || 'A-2';
  const fireLoadMJm2 = config.fireLoadMJm2 || 300;
  const totalAreaM2 = config.totalAreaM2 || 1000;

  const ntcbResult = createNTCBDemandConfig(occupancyCode, fireLoadMJm2, totalAreaM2);
  const { systemType, systemConfig: ntcbSystemConfig, demandConfig, rtiVolume } = ntcbResult;

  // 3. Encontra todos os hidrantes
  const hydrantNodes = findHydrantNodes(graph);
  if (hydrantNodes.length === 0) {
    throw new Error('Nenhum hidrante encontrado na rede');
  }

  // 4. Cria demandas para identificar hidrantes mais desfavoráveis
  // Primeiro, roda simulação com todos hidrantes ativos para identificar os piores
  const preliminaryDemands = new Map<string, number>();
  for (const node of graph.nodeMap.values()) {
    if (node.type === 'hydrant') {
      preliminaryDemands.set(node.id, demandConfig.flowPerHydrantM3s);
    } else {
      preliminaryDemands.set(node.id, 0);
    }
  }

  // 5. Resolve rede preliminar
  const preliminaryResult = solveHardyCross(graph, preliminaryDemands);
  
  // 6. Calcula pressões preliminares com pressão de referência
  const preliminaryPressures = calculatePressures(graph, preliminaryResult.flows, 100);

  // 7. Identifica os hidrantes mais desfavoráveis
  const allHydrantsWithPressure: Array<{ id: string; pressure: number; nozzlePressure: number }> = [];
  
  for (const hydrant of hydrantNodes) {
    const pressure = preliminaryPressures.get(hydrant.id)?.dynamicPressure || 0;
    const nozzlePressure = calculateNozzlePressure(
      pressure,
      demandConfig.flowPerHydrant,
      demandConfig.hoseLength,
      demandConfig.hoseDiameter
    );
    allHydrantsWithPressure.push({
      id: hydrant.id,
      pressure,
      nozzlePressure
    });
  }

  // Ordena por pressão no esguicho (menor = mais desfavorável)
  allHydrantsWithPressure.sort((a, b) => a.nozzlePressure - b.nozzlePressure);

  // Seleciona os N mais desfavoráveis conforme a norma
  const numSimultaneous = Math.min(demandConfig.simultaneousHydrants, hydrantNodes.length);
  const activeHydrantIds = allHydrantsWithPressure.slice(0, numSimultaneous).map(h => h.id);
  
  // O mais favorável é o último da lista
  const mostFavorable = allHydrantsWithPressure[allHydrantsWithPressure.length - 1];

  // 8. Cria demandas finais apenas para hidrantes ativos
  const finalDemands = new Map<string, number>();
  for (const node of graph.nodeMap.values()) {
    if (node.type === 'hydrant' && activeHydrantIds.includes(node.id)) {
      finalDemands.set(node.id, demandConfig.flowPerHydrantM3s);
    } else {
      finalDemands.set(node.id, 0);
    }
  }

  // 9. Resolve a rede final (Hardy-Cross se necessário)
  const hardyCrossResult = solveHardyCross(graph, finalDemands);
  
  if (!hardyCrossResult.converged) {
    warnings.push(`Hardy-Cross não convergiu após ${hardyCrossResult.iterations} iterações`);
  }

  // 10. Calcula parâmetros da bomba por busca binária
  const pumpResult = calculatePumpParameters(
    graph,
    hardyCrossResult.flows,
    demandConfig.minNozzlePressure,
    demandConfig.flowPerHydrant,
    config.pumpEfficiency || 0.65
  );

  // Ajusta vazão total da bomba
  pumpResult.totalFlowLmin = demandConfig.totalFlow;
  pumpResult.totalFlow = demandConfig.totalFlowM3s;

  // 11. Calcula pressões finais com a pressão da bomba determinada
  const pressures = calculatePressures(graph, hardyCrossResult.flows, pumpResult.minPressure);

  // 12. Calcula detalhes dos trechos incluindo Leq
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
      equivalentLength: pipe.equivalentLength || 0,
      velocityStatus: details.velocity < 0.5 ? 'low' : details.velocity > 5.0 ? 'high' : 'ok'
    });
  }

  // 13. Recalcula pressões finais nos hidrantes
  const mostUnfavorableHydrants: Array<{ id: string; pressure: number; nozzlePressure: number }> = [];
  const allHydrants: Array<{ id: string; pressure: number; status: 'ok' | 'low' }> = [];

  for (const hydrant of hydrantNodes) {
    const pressure = pressures.get(hydrant.id)?.dynamicPressure || 0;
    const nozzlePressure = calculateNozzlePressure(
      pressure,
      demandConfig.flowPerHydrant,
      demandConfig.hoseLength,
      demandConfig.hoseDiameter
    );
    
    allHydrants.push({
      id: hydrant.id,
      pressure,
      status: nozzlePressure >= demandConfig.minNozzlePressure ? 'ok' : 'low'
    });

    if (activeHydrantIds.includes(hydrant.id)) {
      mostUnfavorableHydrants.push({
        id: hydrant.id,
        pressure,
        nozzlePressure
      });
    }
  }

  // Ordena os mais desfavoráveis
  mostUnfavorableHydrants.sort((a, b) => a.nozzlePressure - b.nozzlePressure);

  // Recalcula o mais favorável com pressões finais
  let mostFavorableHydrant: { id: string; pressure: number; nozzlePressure: number } | undefined;
  let maxNozzlePressure = -Infinity;
  
  for (const hydrant of hydrantNodes) {
    const pressure = pressures.get(hydrant.id)?.dynamicPressure || 0;
    const nozzlePressure = calculateNozzlePressure(
      pressure,
      demandConfig.flowPerHydrant,
      demandConfig.hoseLength,
      demandConfig.hoseDiameter
    );
    
    if (nozzlePressure > maxNozzlePressure) {
      maxNozzlePressure = nozzlePressure;
      mostFavorableHydrant = { id: hydrant.id, pressure, nozzlePressure };
    }
  }

  // 14. Verificação final de pressões
  const pressureCheck = checkMinimumPressures(graph, pressures, demandConfig.minNozzlePressure);
  if (!pressureCheck.ok) {
    for (const v of pressureCheck.violations) {
      const node = graph.nodeMap.get(v.nodeId);
      errors.push(`${node?.name || v.nodeId}: Pressão ${v.pressure.toFixed(2)} mca abaixo do mínimo`);
    }
  }

  // 15. Verificação de balanço de massa
  const massBalanceOk = !hardyCrossResult.massBalanceErrors || 
    hardyCrossResult.massBalanceErrors.length === 0;
  
  if (!massBalanceOk) {
    warnings.push('Erro de balanço de massa detectado na rede');
  }

  // Monta resultado final
  return {
    config: {
      demandConfig,
      activeHydrants: activeHydrantIds,
      ntcbSystemType: String(systemType),
      buildingClassification: {
        code: occupancyCode,
        name: ntcbSystemConfig.name,
        riskLevel: systemType <= 2 ? 'leve' : systemType <= 3 ? 'medio' : 'elevado',
        flowPerHydrant: demandConfig.flowPerHydrant,
        simultaneousHydrants: demandConfig.simultaneousHydrants,
        minNozzlePressure: demandConfig.minNozzlePressure,
        reserveTime: Math.round((rtiVolume * 1000) / demandConfig.totalFlow),
        hoseLength: demandConfig.hoseLength,
        hoseDiameter: demandConfig.hoseDiameter
      }
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
      mostFavorable: mostFavorableHydrant,
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
      volumeLiters: rtiVolume * 1000,
      volumeM3: rtiVolume,
      timeMinutes: Math.round((rtiVolume * 1000) / demandConfig.totalFlow)
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
  
  const occupancyCode = config.occupancyCode || 'A-2';
  const fireLoadMJm2 = config.fireLoadMJm2 || 300;
  const totalAreaM2 = config.totalAreaM2 || 1000;

  const ntcbResult = createNTCBDemandConfig(occupancyCode, fireLoadMJm2, totalAreaM2);
  
  const demands = new Map<string, number>();
  for (const node of graph.nodeMap.values()) {
    if (node.type === 'hydrant') {
      demands.set(node.id, ntcbResult.demandConfig.flowPerHydrantM3s);
    } else {
      demands.set(node.id, 0);
    }
  }

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
