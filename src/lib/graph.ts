import type { Document, EdgeType } from '../types';
import type { RelationshipResult } from '../types';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  weight?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraphData(
  documents: Document[],
  relationships: RelationshipResult[],
  entities: { id: string; name: string; type: string }[] = []
): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (const entity of entities) {
    nodeMap.set(entity.id, {
      id: entity.id,
      label: entity.name,
      type: entity.type,
    });
  }

  for (const doc of documents) {
    nodeMap.set(doc.id, {
      id: doc.id,
      label: doc.metadata.title,
      type: 'document',
      weight: doc.sections.length,
    });

    for (const section of doc.sections) {
      for (const para of section.paragraphs) {
        for (const sent of para.sentences) {
          nodeMap.set(sent.id, {
            id: sent.id,
            label: sent.text.substring(0, 50) + (sent.text.length > 50 ? '...' : ''),
            type: 'sentence',
          });
        }
      }
    }
  }

  for (const rel of relationships) {
    nodeMap.set(rel.nodeId, {
      ...(nodeMap.get(rel.nodeId) || {
        id: rel.nodeId,
        label: rel.nodeId,
        type: 'unknown',
      }),
    });

    for (const related of rel.related) {
      nodeMap.set(related.id, {
        ...(nodeMap.get(related.id) || {
          id: related.id,
          label: related.id,
          type: 'unknown',
        }),
      });

      const edgeKey = [rel.nodeId, related.id].sort().join('|');
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          source: rel.nodeId,
          target: related.id,
          type: 'related_to',
          weight: related.score,
        });
      }
    }
  }

  return {
    nodes: [...nodeMap.values()],
    edges,
  };
}

export function filterGraphByType(
  data: GraphData,
  types: string[]
): GraphData {
  const typeSet = new Set(types);
  const nodeIds = new Set(
    data.nodes.filter((n) => typeSet.has(n.type)).map((n) => n.id)
  );

  return {
    nodes: data.nodes.filter((n) => typeSet.has(n.type)),
    edges: data.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    ),
  };
}

export function toCytoscapeElements(data: GraphData): { nodes: unknown[]; edges: unknown[] } {
  return {
    nodes: data.nodes.map((n) => ({
      data: { id: n.id, label: n.label, type: n.type, weight: n.weight || 1 },
    })),
    edges: data.edges.map((e, i) => ({
      data: {
        id: `e${i}`,
        source: e.source,
        target: e.target,
        type: e.type,
        weight: e.weight,
      },
    })),
  };
}