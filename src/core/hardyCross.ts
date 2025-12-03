/**
 * Módulo Hardy-Cross
 * 
 * Implementa o método de Hardy-Cross para solução de redes
 * hidráulicas com loops (malhadas).
 * 
 * O método corrige iterativamente as vazões em cada loop até que
 * a soma das perdas de carga no loop seja zero (ou menor que tolerância).
 * 
 * Fórmula de correção:
 * ΔQ = -Σ(H_i × sign_i) / Σ(n × |H_i| / |Q_i|)
 * 
 * Onde:
 * - H_i = K_i × |Q_i|^n × sign(Q_i) [perda de carga no trecho]
 * - n = 1.852 (expoente de Hazen-Williams)
 * - sign_i = direção do trecho no loop (+1 ou -1)
 */

import type { NetworkGraph, Loop, FlowResult, HardyCrossResult } from '../models/types';
import { 
  calculatePipeK, 
  calculateHeadLossWithK, 
  HW_FLOW_EXPONENT 
} from './hazen';
import { initializeFlowsForHardyCross, checkMassBalance } from './propagation';
import { hasLoops, findLoops } from './graph';

/** Tolerância para convergência (m³/s) */
const CONVERGENCE_TOLERANCE = 1e-8; // ~0.0006 L/min

/** Número máximo de iterações */
const MAX_ITERATIONS = 100;

/**
 * Resolve a rede usando o método de Hardy-Cross
 * 
 * @param graph - Grafo da rede
 * @param demands - Mapa de demandas por nó (m³/s)
 * @returns Resultado com vazões finais e informações de convergência
 */
export function solveHardyCross(
  graph: NetworkGraph,
  demands: Map<string, number>
): HardyCrossResult {
  // Verifica se a rede tem loops
  if (!hasLoops(graph)) {
    // Rede em árvore - usa propagação simples
    const flows = initializeFlowsForHardyCross(graph, demands);
    return {
      flows,
      converged: true,
      iterations: 0,
      maxError: 0,
      loops: []
    };
  }

  // Encontra todos os loops
  const loops = findLoops(graph);
  
  if (loops.length === 0) {
    // Sem loops detectados - usa propagação simples
    const flows = initializeFlowsForHardyCross(graph, demands);
    return {
      flows,
      converged: true,
      iterations: 0,
      maxError: 0,
      loops: []
    };
  }

  // Calcula constantes K para cada tubulação
  const pipeK = new Map<string, number>();
  for (const [pipeId, pipe] of graph.pipeMap) {
    const totalLength = pipe.length + (pipe.equivalentLength || 0);
    const K = calculatePipeK(pipe.diameter, pipe.roughness, totalLength);
    pipeK.set(pipeId, K);
  }

  // Inicializa vazões
  let flows = initializeFlowsForHardyCross(graph, demands);

  let iteration = 0;
  let maxDeltaQ = Infinity;
  const loopErrors: number[] = new Array(loops.length).fill(0);

  // Iteração de Hardy-Cross
  while (iteration < MAX_ITERATIONS && maxDeltaQ > CONVERGENCE_TOLERANCE) {
    maxDeltaQ = 0;

    for (let loopIdx = 0; loopIdx < loops.length; loopIdx++) {
      const loop = loops[loopIdx];
      
      let sumH = 0;      // Σ(H_i × sign_i)
      let sumDenom = 0;  // Σ(n × |H_i| / |Q_i|)

      for (const { pipeId, direction } of loop.pipeIds) {
        const flowResult = flows.get(pipeId);
        if (!flowResult) continue;

        const K = pipeK.get(pipeId) || 0;
        const Q = flowResult.flow;
        
        if (Math.abs(Q) < 1e-12) continue; // Evita divisão por zero

        // Perda de carga com sinal
        const H = calculateHeadLossWithK(K, Q);
        
        // Contribuição no loop (considerando direção)
        sumH += H * direction;
        sumDenom += HW_FLOW_EXPONENT * Math.abs(H) / Math.abs(Q);
      }

      // Calcula correção
      let deltaQ = 0;
      if (Math.abs(sumDenom) > 1e-12) {
        deltaQ = -sumH / sumDenom;
      }

      loopErrors[loopIdx] = Math.abs(sumH);
      maxDeltaQ = Math.max(maxDeltaQ, Math.abs(deltaQ));

      // Aplica correção às vazões do loop
      for (const { pipeId, direction } of loop.pipeIds) {
        const flowResult = flows.get(pipeId);
        if (!flowResult) continue;

        const newFlow = flowResult.flow + deltaQ * direction;
        flows.set(pipeId, {
          ...flowResult,
          flow: newFlow,
          absFlow: Math.abs(newFlow),
          direction: newFlow >= 0 ? 1 : -1
        });
      }
    }

    iteration++;
  }

  // Verifica balanço de massa
  const massErrors = checkMassBalance(graph, flows, demands);
  const maxMassError = massErrors.reduce((max, e) => Math.max(max, Math.abs(e.error)), 0);

  return {
    flows,
    converged: maxDeltaQ <= CONVERGENCE_TOLERANCE,
    iterations: iteration,
    maxError: maxDeltaQ,
    loops: loops.map((loop, idx) => ({
      ...loop,
      headLossError: loopErrors[idx]
    })),
    massBalanceErrors: massErrors,
    maxMassError
  };
}

/**
 * Verifica a solução de Hardy-Cross
 * 
 * @param graph - Grafo da rede
 * @param flows - Vazões calculadas
 * @param loops - Loops da rede
 * @returns Relatório de verificação
 */
export function verifyHardyCrossSolution(
  graph: NetworkGraph,
  flows: Map<string, FlowResult>,
  loops: Loop[]
): { valid: boolean; loopErrors: number[]; message: string } {
  // Calcula constantes K
  const pipeK = new Map<string, number>();
  for (const [pipeId, pipe] of graph.pipeMap) {
    const totalLength = pipe.length + (pipe.equivalentLength || 0);
    const K = calculatePipeK(pipe.diameter, pipe.roughness, totalLength);
    pipeK.set(pipeId, K);
  }

  const loopErrors: number[] = [];
  let maxError = 0;

  for (const loop of loops) {
    let sumH = 0;

    for (const { pipeId, direction } of loop.pipeIds) {
      const flowResult = flows.get(pipeId);
      if (!flowResult) continue;

      const K = pipeK.get(pipeId) || 0;
      const H = calculateHeadLossWithK(K, flowResult.flow);
      sumH += H * direction;
    }

    loopErrors.push(Math.abs(sumH));
    maxError = Math.max(maxError, Math.abs(sumH));
  }

  const valid = maxError < 0.01; // Tolerância de 0.01 mca

  return {
    valid,
    loopErrors,
    message: valid 
      ? 'Solução válida: soma das perdas nos loops ≈ 0'
      : `Erro excessivo: máx ${maxError.toFixed(4)} mca`
  };
}
