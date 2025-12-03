/**
 * Módulo de Cálculo de Pressões
 * 
 * Calcula as pressões em cada nó da rede, considerando:
 * - Pressão de partida (fonte/bomba)
 * - Perda de carga nos trechos
 * - Diferença de cotas (elevação)
 */

import type { NetworkGraph, FlowResult, PressureResult, Node } from '../models/types';
import { calculateHeadLoss, calculateVelocity } from './hazen';
import { findSourceNode, findPath } from './graph';

/**
 * Calcula as pressões em todos os nós da rede
 * 
 * @param graph - Grafo da rede
 * @param flows - Mapa de vazões por tubulação (m³/s)
 * @param sourcePressure - Pressão na fonte/saída da bomba (mca)
 * @returns Mapa de pressões por nó (mca)
 */
export function calculatePressures(
  graph: NetworkGraph,
  flows: Map<string, FlowResult>,
  sourcePressure: number
): Map<string, PressureResult> {
  const pressures = new Map<string, PressureResult>();
  const sourceNode = findSourceNode(graph);

  if (!sourceNode) {
    throw new Error('Nó fonte não encontrado na rede');
  }

  // Pressão na fonte
  pressures.set(sourceNode.id, {
    nodeId: sourceNode.id,
    staticPressure: sourcePressure,
    dynamicPressure: sourcePressure,
    elevation: sourceNode.elevation,
    residualPressure: sourcePressure
  });

  // BFS para calcular pressões em todos os nós
  const visited = new Set<string>();
  const queue: string[] = [sourceNode.id];
  visited.add(sourceNode.id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentPressure = pressures.get(currentId)!;

    const neighbors = graph.adjacency.get(currentId) || [];
    
    for (const { pipeId, targetNode } of neighbors) {
      if (visited.has(targetNode)) continue;

      const pipe = graph.pipeMap.get(pipeId)!;
      const flowResult = flows.get(pipeId);
      const targetNodeData = graph.nodeMap.get(targetNode)!;

      // Vazão no trecho
      const Q = flowResult ? Math.abs(flowResult.flow) : 0;

      // Comprimento total (físico + equivalente)
      const totalLength = pipe.length + (pipe.equivalentLength || 0);

      // Perda de carga no trecho
      let headLoss = 0;
      if (Q > 0) {
        headLoss = calculateHeadLoss(Q, pipe.diameter, pipe.roughness, totalLength);
      }

      // Diferença de cota
      const currentNode = graph.nodeMap.get(currentId)!;
      const elevationDiff = targetNodeData.elevation - currentNode.elevation;

      // Pressão no nó de destino
      // P_destino = P_origem - perda - diferença_cota
      const dynamicPressure = currentPressure.dynamicPressure - headLoss - elevationDiff;

      // Pressão estática (sem considerar perda dinâmica)
      const staticPressure = currentPressure.staticPressure - elevationDiff;

      pressures.set(targetNode, {
        nodeId: targetNode,
        staticPressure,
        dynamicPressure,
        elevation: targetNodeData.elevation,
        residualPressure: dynamicPressure,
        headLossFromSource: (currentPressure.headLossFromSource || 0) + headLoss
      });

      visited.add(targetNode);
      queue.push(targetNode);
    }
  }

  return pressures;
}

/**
 * Calcula detalhes do trecho (perda, velocidade, etc)
 * 
 * @param graph - Grafo da rede
 * @param flows - Mapa de vazões
 * @param pressures - Mapa de pressões
 * @returns Detalhes por trecho
 */
export function calculatePipeDetails(
  graph: NetworkGraph,
  flows: Map<string, FlowResult>,
  pressures: Map<string, PressureResult>
): Map<string, {
  pipeId: string;
  flow: number;
  velocity: number;
  headLossUnit: number;
  headLossTotal: number;
  startPressure: number;
  endPressure: number;
}> {
  const details = new Map();

  for (const [pipeId, pipe] of graph.pipeMap) {
    const flowResult = flows.get(pipeId);
    const Q = flowResult ? Math.abs(flowResult.flow) : 0;

    // Velocidade
    const velocity = calculateVelocity(Q, pipe.diameter);

    // Comprimento total
    const totalLength = pipe.length + (pipe.equivalentLength || 0);

    // Perda de carga
    let headLossUnit = 0;
    let headLossTotal = 0;
    if (Q > 0) {
      headLossTotal = calculateHeadLoss(Q, pipe.diameter, pipe.roughness, totalLength);
      headLossUnit = headLossTotal / totalLength;
    }

    // Pressões
    const startPressure = pressures.get(pipe.startNodeId)?.dynamicPressure || 0;
    const endPressure = pressures.get(pipe.endNodeId)?.dynamicPressure || 0;

    details.set(pipeId, {
      pipeId,
      flow: Q,
      velocity,
      headLossUnit,
      headLossTotal,
      startPressure,
      endPressure
    });
  }

  return details;
}

/**
 * Calcula a pressão no esguicho/bocal do hidrante
 * Considera perda adicional na mangueira e no esguicho
 * 
 * @param hydrantPressure - Pressão no hidrante (mca)
 * @param flowLmin - Vazão em L/min
 * @param hoseLength - Comprimento da mangueira (m)
 * @param hoseDiameter - Diâmetro da mangueira (mm)
 * @param nozzleK - Coeficiente K do esguicho
 * @returns Pressão no esguicho (mca)
 */
export function calculateNozzlePressure(
  hydrantPressure: number,
  flowLmin: number,
  hoseLength: number = 30,
  hoseDiameter: number = 40,
  nozzleK: number = 0.00015
): number {
  // Perda na mangueira (usando fórmula simplificada)
  // J = 0.001745 × Q^1.85 × D^-4.87 para mangueira
  const Qm3s = flowLmin / 60000;
  const Dm = hoseDiameter / 1000;
  
  // Coeficiente aproximado para mangueira de incêndio
  const hoseLoss = 0.001745 * Math.pow(Qm3s, 1.85) * Math.pow(Dm, -4.87) * hoseLength;

  // Perda no esguicho: H = K × Q²
  // K em (mca)/(L/min)²
  const nozzleLoss = nozzleK * Math.pow(flowLmin, 2);

  return hydrantPressure - hoseLoss - nozzleLoss;
}

/**
 * Encontra os dois hidrantes mais desfavoráveis
 * (menores pressões residuais)
 * 
 * @param graph - Grafo da rede
 * @param pressures - Mapa de pressões
 * @returns Array com os 2 hidrantes mais desfavoráveis
 */
export function findMostUnfavorableHydrants(
  graph: NetworkGraph,
  pressures: Map<string, PressureResult>
): Array<{ nodeId: string; pressure: number }> {
  const hydrantPressures: Array<{ nodeId: string; pressure: number }> = [];

  for (const [nodeId, node] of graph.nodeMap) {
    if (node.type === 'hydrant') {
      const pressure = pressures.get(nodeId)?.dynamicPressure || 0;
      hydrantPressures.push({ nodeId, pressure });
    }
  }

  // Ordena por pressão (menor primeiro)
  hydrantPressures.sort((a, b) => a.pressure - b.pressure);

  // Retorna os 2 com menor pressão
  return hydrantPressures.slice(0, 2);
}

/**
 * Verifica se todas as pressões atendem ao mínimo requerido
 * 
 * @param pressures - Mapa de pressões
 * @param minPressure - Pressão mínima requerida (mca)
 * @returns Resultado da verificação
 */
export function checkMinimumPressures(
  graph: NetworkGraph,
  pressures: Map<string, PressureResult>,
  minPressure: number
): { ok: boolean; violations: Array<{ nodeId: string; pressure: number; deficit: number }> } {
  const violations: Array<{ nodeId: string; pressure: number; deficit: number }> = [];

  for (const [nodeId, node] of graph.nodeMap) {
    if (node.type === 'hydrant') {
      const pressure = pressures.get(nodeId)?.dynamicPressure || 0;
      if (pressure < minPressure) {
        violations.push({
          nodeId,
          pressure,
          deficit: minPressure - pressure
        });
      }
    }
  }

  return {
    ok: violations.length === 0,
    violations
  };
}
