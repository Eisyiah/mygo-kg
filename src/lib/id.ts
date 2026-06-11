import type { EntityType, ContentNodeType } from '../types';

const ENTITY_PREFIXES: Record<EntityType, string> = {
  character: 'char',
  song: 'song',
  episode: 'ep',
  event: 'event',
  radio: 'radio',
  interview: 'interview',
  live: 'live',
  tag: 'tag',
};

const CONTENT_PREFIXES: Record<ContentNodeType, string> = {
  document: 'doc',
  section: 'sec',
  paragraph: 'para',
  sentence: 'sent',
};

export function entityId(type: EntityType, name: string): string {
  const prefix = ENTITY_PREFIXES[type];
  const slug = name.toLowerCase().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${prefix}-${slug}`;
}

export function contentId(
  type: ContentNodeType,
  docSlug: string,
  sectionNum?: number,
  paragraphNum?: number,
  sentenceNum?: number
): string {
  const prefix = CONTENT_PREFIXES[type];
  switch (type) {
    case 'document':
      return `${prefix}-${docSlug}`;
    case 'section':
      return `${prefix}-${docSlug}-${String(sectionNum).padStart(2, '0')}`;
    case 'paragraph':
      return `${prefix}-${docSlug}-${String(sectionNum).padStart(2, '0')}-${String(paragraphNum).padStart(2, '0')}`;
    case 'sentence':
      return `${prefix}-${docSlug}-${String(sectionNum).padStart(2, '0')}-${String(paragraphNum).padStart(2, '0')}-${String(sentenceNum).padStart(2, '0')}`;
  }
}

export function parseId(id: string): { type: string; parts: string[] } {
  const idx = id.indexOf('-');
  if (idx === -1) return { type: id, parts: [] };
  const type = id.substring(0, idx);
  const rest = id.substring(idx + 1);
  return { type, parts: rest.split('-') };
}

export function idToUrl(id: string): string {
  const { type } = parseId(id);
  const entityRoutes: Record<string, string> = {
    char: '/characters',
    song: '/songs',
    ep: '/episodes',
    event: '/events',
    radio: '/radio',
    interview: '/interviews',
    live: '/lives',
    tag: '/tags',
    doc: '/documents',
    sec: '/documents',
    para: '/paragraph',
    sent: '/sentence',
  };
  const base = entityRoutes[type] || '/';
  return `${base}/${id}`;
}