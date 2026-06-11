interface ParsedQuery {
  type: 'search' | 'path' | 'related' | 'central' | 'top';
  target?: string;
  source?: string;
  filters: QueryFilter[];
  limit?: number;
}

interface QueryFilter {
  field: string;
  value: string;
  op: '=' | '>' | '<';
}

export interface QueryResult {
  type: 'nodes' | 'path' | 'metrics';
  nodes?: { id: string; label: string; type: string }[];
  path?: string[];
  metrics?: { id: string; label: string; score: number }[];
  error?: string;
}

export function parseQuery(input: string): ParsedQuery {
  const trimmed = input.trim();

  // path:source->target
  const pathMatch = trimmed.match(/^path:\s*(\S+)\s*->\s*(\S+)/);
  if (pathMatch) {
    return {
      type: 'path',
      source: pathMatch[1],
      target: pathMatch[2],
      filters: [],
    };
  }

  // related:<nodeId>
  const relatedMatch = trimmed.match(/^related:\s*(\S+)/);
  if (relatedMatch) {
    return {
      type: 'related',
      target: relatedMatch[1],
      filters: [],
    };
  }

  // central:nodes or top:characters:10
  const centralMatch = trimmed.match(/^central:\s*nodes/);
  if (centralMatch) {
    return { type: 'central', filters: [] };
  }

  const topMatch = trimmed.match(/^top:\s*(\w+)(?::(\d+))?/);
  if (topMatch) {
    return {
      type: 'top',
      filters: [{ field: 'type', value: topMatch[1], op: '=' }],
      limit: topMatch[2] ? parseInt(topMatch[2], 10) : 20,
    };
  }

  // Default: search query with optional filters
  const filters: QueryFilter[] = [];
  const filterRegex = /(\w+)([>=<])(\S+)/g;
  let match: RegExpExecArray | null;
  let cleanQuery = trimmed;
  while ((match = filterRegex.exec(trimmed)) !== null) {
    filters.push({
      field: match[1],
      value: match[3],
      op: match[2] as '=' | '>' | '<',
    });
    cleanQuery = cleanQuery.replace(match[0], '');
  }

  return {
    type: 'search',
    target: cleanQuery.trim() || undefined,
    filters,
  };
}

export function formatQueryResult(
  query: ParsedQuery,
  data: {
    nodes: { id: string; label: string; type: string }[];
    edges: { source: string; target: string }[];
  }
): QueryResult {
  switch (query.type) {
    case 'path': {
      if (!query.source || !query.target) {
        return { type: 'path', error: 'Usage: path:sourceId->targetId' };
      }
      // BFS path finding
      const path = findPathBFS(data, query.source, query.target);
      return {
        type: 'path',
        path: path ? path : undefined,
        error: path ? undefined : `No path found between ${query.source} and ${query.target}`,
      };
    }

    case 'related': {
      if (!query.target) {
        return { type: 'nodes', error: 'Usage: related:nodeId' };
      }
      const related = new Set<string>();
      for (const e of data.edges) {
        if (e.source === query.target) related.add(e.target);
        if (e.target === query.target) related.add(e.source);
      }
      const relatedNodes = data.nodes.filter((n) => related.has(n.id));
      return { type: 'nodes', nodes: relatedNodes };
    }

    case 'central': {
      // Delegate to graph-analytics
      return {
        type: 'metrics',
        metrics: [],
        error: 'Use the Analytics tab on the Graph page for centrality metrics.',
      };
    }

    case 'top': {
      const typeFilter = query.filters.find((f) => f.field === 'type')?.value;
      const filtered = typeFilter
        ? data.nodes.filter((n) => n.type === typeFilter)
        : data.nodes;
      const sorted = filtered.sort((a, b) => {
        const degA = countEdges(data, a.id);
        const degB = countEdges(data, b.id);
        return degB - degA;
      });
      const limit = query.limit || 20;
      return {
        type: 'nodes',
        nodes: sorted.slice(0, limit).map((n) => ({
          ...n,
          label: `${n.label} (deg: ${countEdges(data, n.id)})`,
        })),
      };
    }

    case 'search': {
      // Apply filters to find matching nodes
      let filtered = [...data.nodes];

      for (const f of query.filters) {
        switch (f.field) {
          case 'character':
            filtered = filtered.filter((n) => {
              const edges = data.edges.filter(
                (e) => (e.source === n.id && e.target === f.value) ||
                       (e.target === n.id && e.source === f.value)
              );
              return edges.length > 0 || n.id === f.value;
            });
            break;
          case 'type':
            filtered = filtered.filter((n) => n.type === f.value);
            break;
          case 'tag':
            filtered = filtered.filter((n) => n.id.includes(f.value));
            break;
        }
      }

      if (query.target) {
        const q = query.target.toLowerCase();
        filtered = filtered.filter((n) =>
          n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
        );
      }

      return { type: 'nodes', nodes: filtered.slice(0, 30) };
    }
  }
}

function findPathBFS(
  data: { nodes: { id: string }[]; edges: { source: string; target: string }[] },
  source: string,
  target: string
): string[] | null {
  const adj = new Map<string, string[]>();
  for (const e of data.edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }

  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue = [source];
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
    for (const next of adj.get(current) || []) {
      if (!visited.has(next)) {
        visited.add(next);
        parent.set(next, current);
        queue.push(next);
      }
    }
  }

  return null;
}

function countEdges(
  data: { edges: { source: string; target: string }[] },
  nodeId: string
): number {
  return data.edges.filter((e) => e.source === nodeId || e.target === nodeId).length;
}
