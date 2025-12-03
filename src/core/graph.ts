/**
 * Módulo de Grafos - Estrutura da Rede Hidráulica
 * 
 * Implementa estruturas e algoritmos para representar e analisar
 * a topologia da rede de tubulações.
 */

import type { Node, Pipe, NetworkGraph, Loop } from '../models/types';

/**
 * Constrói o grafo da rede a partir de nós e tubulações
 */
export function buildGraph(nodes: Node[], pipes: Pipe[]): NetworkGraph {
  const nodeMap = new Map<string, Node>();
  const adjacency = new Map<string, Array<{ pipeId: string; targetNode: string }>>();
  const pipeMap = new Map<string, Pipe>();

  // Inicializa mapas
  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    adjacency.set(node.id, []);
  });

  pipes.forEach(pipe => {
    pipeMap.set(pipe.id, pipe);
    
    // Adiciona conexões bidirecionais
    adjacency.get(pipe.startNodeId)?.push({
      pipeId: pipe.id,
      targetNode: pipe.endNodeId
    });
    adjacency.get(pipe.endNodeId)?.push({
      pipeId: pipe.id,
      targetNode: pipe.startNodeId
    });
  });

  return { nodeMap, adjacency, pipeMap };
}

/**
 * Detecta se a rede tem loops (ciclos)
 */
export function hasLoops(graph: NetworkGraph): boolean {
  const visited = new Set<string>();
  const parent = new Map<string, string>();

  function dfs(nodeId: string, parentId: string | null): boolean {
    visited.add(nodeId);
    
    const neighbors = graph.adjacency.get(nodeId) || [];
    for (const { pipeId, targetNode } of neighbors) {
      if (!visited.has(targetNode)) {
        parent.set(targetNode, nodeId);
        if (dfs(targetNode, nodeId)) return true;
      } else if (targetNode !== parentId) {
        // Encontrou um nó já visitado que não é o pai -> loop
        return true;
      }
    }
    return false;
  }

  // Inicia DFS do primeiro nó
  const firstNode = graph.nodeMap.keys().next().value;
  if (firstNode) {
    return dfs(firstNode, null);
  }
  return false;
}

/**
 * Encontra todos os loops (ciclos fundamentais) na rede
 * Usando algoritmo de busca de ciclos fundamentais
 */
export function findLoops(graph: NetworkGraph): Loop[] {
  const loops: Loop[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, { nodeId: string; pipeId: string } | null>();
  const inStack = new Set<string>();
  const treeEdges = new Set<string>();

  // Primeiro, encontra a árvore geradora e as arestas de retorno
  function buildSpanningTree(nodeId: string): void {
    visited.add(nodeId);
    inStack.add(nodeId);

    const neighbors = graph.adjacency.get(nodeId) || [];
    for (const { pipeId, targetNode } of neighbors) {
      if (!visited.has(targetNode)) {
        parent.set(targetNode, { nodeId, pipeId });
        treeEdges.add(pipeId);
        buildSpanningTree(targetNode);
      }
    }
    
    inStack.delete(nodeId);
  }

  // Constrói árvore geradora
  const firstNode = graph.nodeMap.keys().next().value;
  if (firstNode) {
    parent.set(firstNode, null);
    buildSpanningTree(firstNode);
  }

  // Para cada aresta que não está na árvore, forma um loop
  graph.pipeMap.forEach((pipe, pipeId) => {
    if (!treeEdges.has(pipeId)) {
      // Esta aresta forma um ciclo fundamental
      const loop = findFundamentalCycle(graph, pipe, parent);
      if (loop) {
        loops.push(loop);
      }
    }
  });

  return loops;
}

/**
 * Encontra o ciclo fundamental formado por uma aresta de retorno
 */
function findFundamentalCycle(
  graph: NetworkGraph,
  backEdge: Pipe,
  parent: Map<string, { nodeId: string; pipeId: string } | null>
): Loop | null {
  const { startNodeId, endNodeId, id: backEdgePipeId } = backEdge;

  // Encontra o caminho de startNode até a raiz
  const pathFromStart: string[] = [];
  let current: string | null = startNodeId;
  while (current) {
    pathFromStart.push(current);
    const p = parent.get(current);
    current = p ? p.nodeId : null;
  }

  // Encontra o caminho de endNode até a raiz
  const pathFromEnd: string[] = [];
  current = endNodeId;
  while (current) {
    pathFromEnd.push(current);
    const p = parent.get(current);
    current = p ? p.nodeId : null;
  }

  // Encontra o ancestral comum mais baixo (LCA)
  const startSet = new Set(pathFromStart);
  let lca: string | null = null;
  for (const node of pathFromEnd) {
    if (startSet.has(node)) {
      lca = node;
      break;
    }
  }

  if (!lca) return null;

  // Constrói o loop
  const loopNodes: string[] = [];
  const loopPipes: Array<{ pipeId: string; direction: 1 | -1 }> = [];

  // Caminho de startNode até LCA
  current = startNodeId;
  while (current && current !== lca) {
    loopNodes.push(current);
    const p = parent.get(current);
    if (p) {
      loopPipes.push({ pipeId: p.pipeId, direction: -1 }); // Subindo na árvore
      current = p.nodeId;
    } else {
      break;
    }
  }
  loopNodes.push(lca);

  // Caminho de LCA até endNode (invertido)
  const pathToEnd: Array<{ node: string; pipeId: string }> = [];
  current = endNodeId;
  while (current && current !== lca) {
    const p = parent.get(current);
    if (p) {
      pathToEnd.push({ node: current, pipeId: p.pipeId });
      current = p.nodeId;
    } else {
      break;
    }
  }
  pathToEnd.reverse();

  for (const { node, pipeId } of pathToEnd) {
    loopNodes.push(node);
    loopPipes.push({ pipeId, direction: 1 }); // Descendo na árvore
  }

  // Adiciona a aresta de retorno
  loopPipes.push({ pipeId: backEdgePipeId, direction: 1 });

  return {
    id: `loop_${loops.length}`,
    nodeIds: loopNodes,
    pipeIds: loopPipes
  };
}

// Variável auxiliar para contador de loops
let loops: Loop[] = [];

/**
 * Encontra o nó fonte (reservatório/bomba) na rede
 */
export function findSourceNode(graph: NetworkGraph): Node | null {
  for (const [, node] of graph.nodeMap) {
    if (node.type === 'source' || node.type === 'pump') {
      return node;
    }
  }
  return null;
}

/**
 * Encontra todos os nós hidrantes na rede
 */
export function findHydrantNodes(graph: NetworkGraph): Node[] {
  const hydrants: Node[] = [];
  for (const [, node] of graph.nodeMap) {
    if (node.type === 'hydrant') {
      hydrants.push(node);
    }
  }
  return hydrants;
}

/**
 * Realiza BFS a partir do nó fonte
 */
export function bfsFromSource(graph: NetworkGraph, sourceId: string): Map<string, number> {
  const distances = new Map<string, number>();
  const queue: string[] = [sourceId];
  distances.set(sourceId, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distances.get(current)!;

    const neighbors = graph.adjacency.get(current) || [];
    for (const { targetNode } of neighbors) {
      if (!distances.has(targetNode)) {
        distances.set(targetNode, currentDist + 1);
        queue.push(targetNode);
      }
    }
  }

  return distances;
}

/**
 * Ordena nós por distância do fonte (pós-ordem para propagação)
 */
export function topologicalSort(graph: NetworkGraph, sourceId: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(nodeId: string, parentId: string | null): void {
    visited.add(nodeId);

    const neighbors = graph.adjacency.get(nodeId) || [];
    for (const { targetNode } of neighbors) {
      if (!visited.has(targetNode)) {
        dfs(targetNode, nodeId);
      }
    }

    result.push(nodeId);
  }

  dfs(sourceId, null);
  return result;
}

/**
 * Encontra o caminho entre dois nós
 */
export function findPath(
  graph: NetworkGraph,
  startId: string,
  endId: string
): Array<{ nodeId: string; pipeId: string | null }> | null {
  const visited = new Set<string>();
  const parent = new Map<string, { nodeId: string; pipeId: string } | null>();
  const queue: string[] = [startId];

  visited.add(startId);
  parent.set(startId, null);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === endId) {
      // Reconstrói o caminho
      const path: Array<{ nodeId: string; pipeId: string | null }> = [];
      let node: string | null = endId;

      while (node) {
        const p = parent.get(node);
        path.unshift({ nodeId: node, pipeId: p?.pipeId || null });
        node = p?.nodeId || null;
      }

      return path;
    }

    const neighbors = graph.adjacency.get(current) || [];
    for (const { pipeId, targetNode } of neighbors) {
      if (!visited.has(targetNode)) {
        visited.add(targetNode);
        parent.set(targetNode, { nodeId: current, pipeId });
        queue.push(targetNode);
      }
    }
  }

  return null; // Caminho não encontrado
}
