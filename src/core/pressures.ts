/**
 * Módulo de Cálculo de Pressões
 * 
 * Calcula as pressões em cada nó da rede, considerando:
 * - Pressão de partida (fonte/bomba)
 * - Perda de carga nos trechos
 * - Diferença de cotas (elevação)
 * 
 * CORREÇÕES NTCB 19/2020:
 * - Validação usa pressão no ESGUICHO (nozzlePressure), não válvula
 * - Perda em mangueira calculada por Hazen-Williams consistente
 * - Seleção de mais desfavoráveis baseada em nozzlePressure
 */

import type { NetworkGraph, FlowResult, PressureResult, Node } from '../models/types';
import { calculateHeadLoss, calculateVelocity } from './hazen';
import { findSourceNode, findPath } from './graph';
import { Lmin_to_m3s, mm_to_m } from './units';

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
    residualPressure: sourcePressure,
    headLossFromSource: 0
  });

  // BFS para calcular pressões em todos os nós
  const visited = new Set<string>();
  const queue: string[] = [sourceNode.id];
  visited.add(sourceNode.id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentPressure = pressures.get(currentId)!;
    const currentNode = graph.nodeMap.get(currentId)!;

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

      // Diferença de cota (dZ = elevação_destino - elevação_origem)
      // Se dZ > 0, estamos subindo, logo a pressão diminui
      const elevationDiff = targetNodeData.elevation - currentNode.elevation;

      // Pressão no nó de destino
      // P_destino = P_origem - perda - diferença_cota
      // CORREÇÃO: sinal correto para elevação
      const dynamicPressure = currentPressure.dynamicPressure - headLoss - elevationDiff;

      // Pressão estática (sem considerar perda dinâmica)
      const staticPressure = currentPressure.staticPressure - elevationDiff;

      // Perda acumulada desde a fonte
      const headLossFromSource = (currentPressure.headLossFromSource || 0) + headLoss;

      pressures.set(targetNode, {
        nodeId: targetNode,
        staticPressure,
        dynamicPressure,
        elevation: targetNodeData.elevation,
        residualPressure: dynamicPressure,
        headLossFromSource
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

    // Pressões (usar as calculadas, não recalcular)
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
 * Calcula a perda de carga na mangueira usando Hazen-Williams
 * 
 * CORREÇÃO: Usa a mesma fórmula HW consistente com o resto do sistema
 * J = 10.643 × Q^1.852 × C^(-1.852) × D^(-4.87)
 * 
 * @param flowLmin - Vazão em L/min
 * @param hoseLength - Comprimento da mangueira (m)
 * @param hoseDiameter - Diâmetro da mangueira (mm)
 * @param hazenC - Coeficiente C (default 120 para mangueira)
 * @returns Perda de carga em mca
 */
export function calculateHoseLoss(
  flowLmin: number,
  hoseLength: number,
  hoseDiameter: number,
  hazenC: number = 120
): number {
  if (flowLmin <= 0 || hoseLength <= 0 || hoseDiameter <= 0) {
    return 0;
  }

  // Converte para SI
  const Q_m3s = Lmin_to_m3s(flowLmin);
  const D_m = mm_to_m(hoseDiameter);

  // Hazen-Williams: J = 10.643 × Q^1.852 × C^(-1.852) × D^(-4.87)
  const J = 10.643 * 
    Math.pow(Q_m3s, 1.852) * 
    Math.pow(hazenC, -1.852) * 
    Math.pow(D_m, -4.87);

  // Perda total = J × L
  return J * hoseLength;
}

/**
 * Calcula a pressão no esguicho/bocal do hidrante
 * 
 * CORREÇÃO: Usa calculateHoseLoss com Hazen-Williams consistente
 * 
 * @param hydrantPressure - Pressão na válvula do hidrante (mca)
 * @param flowLmin - Vazão em L/min
 * @param hoseLength - Comprimento da mangueira (m)
 * @param hoseDiameter - Diâmetro da mangueira (mm)
 * @returns Pressão no esguicho (mca)
 */
export function calculateNozzlePressure(
  hydrantPressure: number,
  flowLmin: number,
  hoseLength: number = 30,
  hoseDiameter: number = 40
): number {
  // Perda na mangueira usando Hazen-Williams
  const hoseLoss = calculateHoseLoss(flowLmin, hoseLength, hoseDiameter, 120);

  // Pressão no esguicho = pressão válvula - perda mangueira
  return hydrantPressure - hoseLoss;
}

/**
 * Encontra os hidrantes ordenados por pressão no esguicho (mais desfavoráveis primeiro)
 * 
 * CORREÇÃO: Usa nozzlePressure para ordenação, não valvePressure
 * 
 * @param graph - Grafo da rede
 * @param pressures - Mapa de pressões
 * @param flowLmin - Vazão por hidrante (L/min)
 * @param hoseLength - Comprimento da mangueira (m)
 * @param hoseDiameter - Diâmetro da mangueira (mm)
 * @returns Array de hidrantes ordenados por nozzlePressure
 */
export function findMostUnfavorableHydrants(
  graph: NetworkGraph,
  pressures: Map<string, PressureResult>,
  flowLmin: number = 100,
  hoseLength: number = 30,
  hoseDiameter: number = 40
): Array<{ nodeId: string; valvePressure: number; nozzlePressure: number; hoseLoss: number }> {
  const hydrantPressures: Array<{ 
    nodeId: string; 
    valvePressure: number; 
    nozzlePressure: number;
    hoseLoss: number;
  }> = [];

  for (const [nodeId, node] of graph.nodeMap) {
    if (node.type === 'hydrant') {
      const valvePressure = pressures.get(nodeId)?.dynamicPressure || 0;
      const hoseLoss = calculateHoseLoss(flowLmin, hoseLength, hoseDiameter, 120);
      const nozzlePressure = valvePressure - hoseLoss;
      
      hydrantPressures.push({ 
        nodeId, 
        valvePressure,
        nozzlePressure,
        hoseLoss
      });
    }
  }

  // CORREÇÃO: Ordena por pressão no ESGUICHO (menor = mais desfavorável)
  hydrantPressures.sort((a, b) => a.nozzlePressure - b.nozzlePressure);

  return hydrantPressures;
}

/**
 * Verifica se todas as pressões NO ESGUICHO atendem ao mínimo requerido
 * 
 * CORREÇÃO CRÍTICA: Valida nozzlePressure, não valvePressure
 * 
 * @param graph - Grafo da rede
 * @param pressures - Mapa de pressões
 * @param minNozzlePressure - Pressão mínima requerida no esguicho (mca)
 * @param flowLmin - Vazão por hidrante (L/min)
 * @param hoseLength - Comprimento mangueira (m)
 * @param hoseDiameter - Diâmetro mangueira (mm)
 * @returns Resultado da verificação
 */
export function checkMinimumPressures(
  graph: NetworkGraph,
  pressures: Map<string, PressureResult>,
  minNozzlePressure: number,
  flowLmin: number = 100,
  hoseLength: number = 30,
  hoseDiameter: number = 40
): { 
  ok: boolean; 
  violations: Array<{ 
    nodeId: string; 
    valvePressure: number; 
    nozzlePressure: number; 
    deficit: number 
  }> 
} {
  const violations: Array<{ 
    nodeId: string; 
    valvePressure: number;
    nozzlePressure: number; 
    deficit: number 
  }> = [];

  for (const [nodeId, node] of graph.nodeMap) {
    if (node.type === 'hydrant') {
      const valvePressure = pressures.get(nodeId)?.dynamicPressure || 0;
      const hoseLoss = calculateHoseLoss(flowLmin, hoseLength, hoseDiameter, 120);
      const nozzlePressure = valvePressure - hoseLoss;
      
      // CORREÇÃO: Verifica pressão no ESGUICHO, não na válvula
      if (nozzlePressure < minNozzlePressure) {
        violations.push({
          nodeId,
          valvePressure,
          nozzlePressure,
          deficit: minNozzlePressure - nozzlePressure
        });
      }
    }
  }

  return {
    ok: violations.length === 0,
    violations
  };
}
