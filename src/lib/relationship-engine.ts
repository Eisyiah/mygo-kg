import type { Document, RelationshipScore, RelationshipResult } from '../types';
import { SCORING } from '../types/relationships';

interface NodeInfo {
  id: string;
  characters: string[];
  songs: string[];
  events: string[];
  tags: string[];
  date?: string;
  type?: string;
  speaker?: string;
}

export function buildRelationships(nodes: NodeInfo[]): RelationshipResult[] {
  const results: RelationshipResult[] = [];

  for (const node of nodes) {
    const related: RelationshipScore[] = [];

    for (const other of nodes) {
      if (node.id === other.id) continue;

      let score = 0;
      const reasons: string[] = [];

      const sharedChars = intersection(node.characters, other.characters);
      if (sharedChars.length > 0) {
        score += SCORING.shared_character * sharedChars.length;
        reasons.push(`shared_character: ${sharedChars.join(', ')}`);
      }

      const sharedSongs = intersection(node.songs, other.songs);
      if (sharedSongs.length > 0) {
        score += SCORING.shared_song * sharedSongs.length;
        reasons.push(`shared_song: ${sharedSongs.join(', ')}`);
      }

      const sharedEvents = intersection(node.events, other.events);
      if (sharedEvents.length > 0) {
        score += SCORING.shared_event * sharedEvents.length;
        reasons.push(`shared_event: ${sharedEvents.join(', ')}`);
      }

      const sharedTags = intersection(node.tags, other.tags);
      if (sharedTags.length > 0) {
        score += SCORING.shared_tag * sharedTags.length;
        reasons.push(`shared_tag: ${sharedTags.join(', ')}`);
      }

      if (node.date && other.date) {
        const d1 = new Date(node.date);
        const d2 = new Date(other.date);
        if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
          score += SCORING.same_month;
          reasons.push('same_month');
        }
      }

      if (node.type && other.type && node.type === other.type) {
        score += SCORING.same_content_type;
        reasons.push(`same_type: ${node.type}`);
      }

      if (node.speaker && other.speaker && node.speaker === other.speaker) {
        score += SCORING.same_speaker;
        reasons.push(`same_speaker: ${node.speaker}`);
      }

      if (score > 0) {
        related.push({ id: other.id, score, reasons });
      }
    }

    related.sort((a, b) => b.score - a.score);
    results.push({ nodeId: node.id, related: related.slice(0, 20) });
  }

  return results;
}

export function extractNodeInfo(doc: Document): NodeInfo[] {
  const nodes: NodeInfo[] = [];

  nodes.push({
    id: doc.id,
    characters: doc.characters,
    songs: doc.songs,
    events: doc.events,
    tags: doc.tags,
    date: doc.metadata.date,
    type: doc.metadata.type,
  });

  for (const section of doc.sections) {
    for (const para of section.paragraphs) {
      for (const sent of para.sentences) {
        nodes.push({
          id: sent.id,
          characters: sent.characters || [],
          songs: sent.songs || [],
          events: sent.events || [],
          tags: sent.tags || [],
        });
      }
    }
  }

  return nodes;
}

function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}