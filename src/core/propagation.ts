/**
 * Módulo de Propagação de Vazões
 * 
 * Calcula as vazões em cada trecho da rede baseado nas demandas dos nós.
 * Para redes em árvore (sem loops), usa propagação pós-ordem.
 */

import type { Node, Pipe, NetworkGraph, FlowResult } from '../models/types';
import { findSourceNode, topologicalSort } from './graph';

/**
 * Calcula vazões para rede em árvore (sem loops)
 * Usa propagação pós-ordem: vazão do trecho = soma das demandas à jusante
 * 
 * @param graph - Grafo da rede
 * @param demands - Mapa de demandas por nó (m³/s)
 * @returns Mapa de vazões por tubulação (m³/s)
 */
export function propagateFlowsTree(
  graph: NetworkGraph,
  demands: Map<string, number>
): Map<string, FlowResult> {
  const flows = new Map<string, FlowResult>();
  const sourceNode = findSourceNode(graph);
  
  if (!sourceNode) {
    throw new Error('Nó fonte não encontrado na rede');
  }

  // Obtém ordem topológica (pós-ordem)
  const order = topologicalSort(graph, sourceNode.id);

  // Mapa para armazenar demanda acumulada de cada nó
  const accumulatedDemand = new Map<string, number>();

  // Inicializa com demandas diretas
  for (const [nodeId, demand] of demands) {
    accumulatedDemand.set(nodeId, demand);
  }

  // Conjunto de arestas já processadas
  const processedEdges = new Set<string>();

  // Mapa de pai de cada nó (para saber qual aresta conecta ao pai)
  const parentMap = new Map<string, { parentId: string; pipeId: string }>();

  // Constrói mapa de pais via BFS
  const visited = new Set<string>();
  const queue: string[] = [sourceNode.id];
  visited.add(sourceNode.id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph.adjacency.get(current) || [];

    for (const { pipeId, targetNode } of neighbors) {
      if (!visited.has(targetNode)) {
        visited.add(targetNode);
        parentMap.set(targetNode, { parentId: current, pipeId });
        queue.push(targetNode);
      }
    }
  }

  // Processa em pós-ordem (folhas primeiro)
  for (const nodeId of order) {
    if (nodeId === sourceNode.id) continue;

    const parentInfo = parentMap.get(nodeId);
    if (!parentInfo) continue;

    const { parentId, pipeId } = parentInfo;
    const pipe = graph.pipeMap.get(pipeId);
    if (!pipe) continue;

    // Demanda acumulada deste nó (inclui demanda própria + filhos)
    const nodeDemand = accumulatedDemand.get(nodeId) || 0;

    // A vazão no trecho é igual à demanda acumulada do nó filho
    const flow = nodeDemand;

    // Determina direção (positivo = do start para end)
    const direction = pipe.startNodeId === parentId ? 1 : -1;

    flows.set(pipeId, {
      pipeId,
      flow: flow * direction, // Vazão com sinal de direção
      absFlow: flow,
      direction
    });

    // Propaga demanda para o pai
    const parentDemand = accumulatedDemand.get(parentId) || 0;
    accumulatedDemand.set(parentId, parentDemand + nodeDemand);
  }

  return flows;
}

/**
 * Inicializa vazões com estimativa inicial para Hardy-Cross
 * Distribui as vazões proporcionalmente baseado na topologia
 * 
 * @param graph - Grafo da rede
 * @param demands - Mapa de demandas por nó (m³/s)
 * @returns Mapa de vazões estimadas por tubulação (m³/s)
 */
export function initializeFlowsForHardyCross(
  graph: NetworkGraph,
  demands: Map<string, number>
): Map<string, FlowResult> {
  // Usa a propagação de árvore como estimativa inicial
  // Isso garante conservação de massa nos nós
  return propagateFlowsTree(graph, demands);
}

/**
 * Verifica conservação de massa em cada nó
 * ΣQ_in = ΣQ_out + demanda
 * 
 * @param graph - Grafo da rede
 * @param flows - Mapa de vazões por tubulação
 * @param demands - Mapa de demandas por nó
 * @returns Array de erros de balanço por nó
 */
export function checkMassBalance(
  graph: NetworkGraph,
  flows: Map<string, FlowResult>,
  demands: Map<string, number>
): Array<{ nodeId: string; error: number }> {
  const errors: Array<{ nodeId: string; error: number }> = [];

  for (const [nodeId, node] of graph.nodeMap) {
    if (node.type === 'source') continue; // Fonte não verifica balanço

    let netFlow = 0;
    const demand = demands.get(nodeId) || 0;

    const neighbors = graph.adjacency.get(nodeId) || [];
    for (const { pipeId } of neighbors) {
      const flowResult = flows.get(pipeId);
      if (!flowResult) continue;

      const pipe = graph.pipeMap.get(pipeId)!;
      
      // Se o nó é o início do pipe, vazão positiva sai
      // Se o nó é o fim do pipe, vazão positiva entra
      if (pipe.startNodeId === nodeId) {
        netFlow -= flowResult.flow; // Saindo
      } else {
        netFlow += flowResult.flow; // Entrando
      }
    }

    // Erro = entrada - saída - demanda
    const error = netFlow - demand;
    
    if (Math.abs(error) > 1e-9) {
      errors.push({ nodeId, error });
    }
  }

  return errors;
}

/**
 * Calcula a vazão total do sistema (soma das demandas)
 * 
 * @param demands - Mapa de demandas por nó
 * @returns Vazão total em m³/s
 */
export function calculateTotalDemand(demands: Map<string, number>): number {
  let total = 0;
  for (const demand of demands.values()) {
    total += demand;
  }
  return total;
}
