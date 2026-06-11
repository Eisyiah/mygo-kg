import type { RelationshipResult } from '../types';
import type { Document } from '../types';

export interface Recommendation {
  id: string;
  score: number;
  reasons: string[];
}

export function getRecommendations(
  nodeId: string,
  relationships: RelationshipResult[],
  limit: number = 10
): Recommendation[] {
  const rel = relationships.find((r) => r.nodeId === nodeId);
  if (!rel) return [];

  return rel.related.slice(0, limit).map((r) => ({
    id: r.id,
    score: r.score,
    reasons: r.reasons,
  }));
}

export function getRecommendationsByType(
  nodeId: string,
  relationships: RelationshipResult[],
  type: string,
  documents: Document[],
  limit: number = 5
): Recommendation[] {
  const allRecs = getRecommendations(nodeId, relationships, limit * 3);
  const typeMap = new Map<string, string>();

  for (const doc of documents) {
    typeMap.set(doc.id, doc.metadata.type);
    for (const section of doc.sections) {
      for (const para of section.paragraphs) {
        typeMap.set(para.id, 'paragraph');
        for (const sent of para.sentences) {
          typeMap.set(sent.id, 'sentence');
        }
      }
    }
  }

  return allRecs
    .filter((r) => typeMap.get(r.id) === type)
    .slice(0, limit);
}