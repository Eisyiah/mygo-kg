import type { GraphData, GraphNode, GraphEdge } from './graph';

interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  componentCount: number;
}

interface NodeCentrality {
  id: string;
  label: string;
  type: string;
  degree: number;
  pageRank: number;
  betweenness: number;
}

const DAMPING = 0.85;
const PR_ITERATIONS = 50;
const PR_EPSILON = 1e-6;

function buildAdjacency(data: GraphData): {
  outEdges: Map<string, string[]>;
  inEdges: Map<string, string[]>;
  nodeIds: Set<string>;
} {
  const outEdges = new Map<string, string[]>();
  const inEdges = new Map<string, string[]>();
  const nodeIds = new Set<string>();

  for (const n of data.nodes) {
    nodeIds.add(n.id);
    if (!outEdges.has(n.id)) outEdges.set(n.id, []);
    if (!inEdges.has(n.id)) inEdges.set(n.id, []);
  }

  for (const e of data.edges) {
    if (!outEdges.has(e.source)) outEdges.set(e.source, []);
    if (!inEdges.has(e.target)) inEdges.set(e.target, []);
    outEdges.get(e.source)!.push(e.target);
    inEdges.get(e.target)!.push(e.source);
    nodeIds.add(e.source);
    nodeIds.add(e.target);
  }

  return { outEdges, inEdges, nodeIds };
}

export function computePageRank(data: GraphData): Map<string, number> {
  const { outEdges, nodeIds } = buildAdjacency(data);
  const N = nodeIds.size;
  const ranks = new Map<string, number>();
  const newRanks = new Map<string, number>();
  const ids = [...nodeIds];

  for (const id of ids) {
    ranks.set(id, 1 / N);
  }

  for (let iter = 0; iter < PR_ITERATIONS; iter++) {
    let danglingSum = 0;
    for (const id of ids) {
      const out = outEdges.get(id) || [];
      if (out.length === 0) {
        danglingSum += ranks.get(id)!;
      }
    }

    let maxDiff = 0;
    for (const id of ids) {
      const inNeighbors = [...(new Set([...buildAdjacency(data).inEdges.get(id) || []]))];
      let sum = 0;
      for (const src of inNeighbors) {
        const outDeg = (outEdges.get(src) || []).length;
        if (outDeg > 0) {
          sum += ranks.get(src)! / outDeg;
        }
      }
      const newRank = (1 - DAMPING) / N + DAMPING * (sum + danglingSum / N);
      newRanks.set(id, newRank);
      maxDiff = Math.max(maxDiff, Math.abs(newRank - ranks.get(id)!));
    }

    for (const id of ids) {
      ranks.set(id, newRanks.get(id) || 1 / N);
    }

    if (maxDiff < PR_EPSILON) break;
  }

  return ranks;
}

export function computeDegreeCentrality(data: GraphData): Map<string, number> {
  const { outEdges, inEdges, nodeIds } = buildAdjacency(data);
  const centrality = new Map<string, number>();

  for (const id of nodeIds) {
    const outDeg = (outEdges.get(id) || []).length;
    const inDeg = (inEdges.get(id) || []).length;
    centrality.set(id, outDeg + inDeg);
  }

  return centrality;
}

export function computeBetweennessCentrality(
  data: GraphData,
  sampleSize?: number
): Map<string, number> {
  const { outEdges, nodeIds } = buildAdjacency(data);
  const ids = [...nodeIds];
  const betweenness = new Map<string, number>();

  for (const id of ids) {
    betweenness.set(id, 0);
  }

  const sourceIds = sampleSize
    ? shuffleArray(ids).slice(0, Math.min(sampleSize, ids.length))
    : ids;

  for (const s of sourceIds) {
    const stack: string[] = [];
    const pred = new Map<string, string[]>();
    const sigma = new Map<string, number>();
    const dist = new Map<string, number>();
    const delta = new Map<string, number>();

    for (const id of ids) {
      pred.set(id, []);
      sigma.set(id, 0);
      dist.set(id, -1);
    }

    sigma.set(s, 1);
    dist.set(s, 0);

    const queue: string[] = [s];
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      const d = dist.get(v)! + 1;
      for (const w of outEdges.get(v) || []) {
        if (dist.get(w)! < 0) {
          dist.set(w, d);
          queue.push(w);
        }
        if (dist.get(w) === d) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          pred.get(w)!.push(v);
        }
      }
    }

    for (const id of ids) {
      delta.set(id, 0);
    }

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w) || []) {
        delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
      }
      if (w !== s) {
        betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
      }
    }
  }

  return betweenness;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function computeGraphMetrics(data: GraphData): GraphMetrics {
  const { nodeIds } = buildAdjacency(data);
  const edgeCount = data.edges.length;
  const nodeCount = nodeIds.size;
  const maxEdges = nodeCount * (nodeCount - 1);
  const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

  return {
    nodeCount,
    edgeCount,
    density: Math.round(density * 1000) / 1000,
    componentCount: 0, // would need BFS/DFS for accurate count
  };
}

export function getTopNodes(
  data: GraphData,
  metric: 'pagerank' | 'degree' | 'betweenness',
  limit: number = 20
): NodeCentrality[] {
  let scores: Map<string, number>;

  switch (metric) {
    case 'pagerank':
      scores = computePageRank(data);
      break;
    case 'degree':
      scores = computeDegreeCentrality(data);
      break;
    case 'betweenness':
      scores = computeBetweennessCentrality(data, 100);
      break;
  }

  const nodeMap = new Map<string, GraphNode>();
  for (const n of data.nodes) {
    nodeMap.set(n.id, n);
  }

  const results: NodeCentrality[] = [];
  for (const [id, score] of scores) {
    const node = nodeMap.get(id);
    results.push({
      id,
      label: node?.label || id,
      type: node?.type || 'unknown',
      degree: computeDegreeCentrality(data).get(id) || 0,
      pageRank: metric === 'pagerank' ? score : computePageRank(data).get(id) || 0,
      betweenness: metric === 'betweenness' ? score : 0,
    });
  }

  results.sort((a, b) => b[metric] - a[metric]);
  return results.slice(0, limit);
}

export function findPath(
  data: GraphData,
  source: string,
  target: string,
  maxDepth: number = 6
): string[] | null {
  const { outEdges } = buildAdjacency(data);

  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: string[] = [source];
  visited.add(source);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === target) {
      const path: string[] = [target];
      let node = target;
      while (node !== source) {
        node = parent.get(node)!;
        path.unshift(node);
      }
      return path;
    }

    const neighbors = outEdges.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null;
}

export type { GraphMetrics, NodeCentrality };
