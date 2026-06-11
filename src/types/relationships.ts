export type EdgeType =
  | 'mentions'
  | 'appears_in'
  | 'references'
  | 'same_topic'
  | 'same_character'
  | 'same_song'
  | 'same_event'
  | 'same_tag'
  | 'responds_to'
  | 'related_to';

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
}

export interface RelationshipScore {
  id: string;
  score: number;
  reasons: string[];
}

export interface RelationshipResult {
  nodeId: string;
  related: RelationshipScore[];
}

export const SCORING: Record<string, number> = {
  shared_character: 3,
  shared_song: 4,
  shared_event: 5,
  shared_tag: 1,
  same_month: 1,
  same_content_type: 1,
  same_speaker: 2,
};

export interface BacklinkEntry {
  sourceId: string;
  sourceType: string;
  sourceTitle: string;
  context: string;
}

export interface BacklinkIndex {
  [targetId: string]: BacklinkEntry[];
}