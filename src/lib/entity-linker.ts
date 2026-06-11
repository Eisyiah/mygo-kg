import type { Document } from '../types';
import { entityId } from './id';

interface EntityPattern {
  pattern: RegExp;
  entityType: 'character' | 'song' | 'event';
  id: string;
}

const ENTITY_PATTERNS: EntityPattern[] = [];

export function registerEntityPattern(
  entityType: 'character' | 'song' | 'event',
  name: string,
  aliases: string[]
): void {
  const id = entityId(entityType, name);
  const allNames = [name, ...aliases].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(allNames.map(escapeRegex).join('|'), 'g');
  ENTITY_PATTERNS.push({ pattern, entityType, id });
}

export function linkEntities(document: Document): Document {
  const allPatterns = [...ENTITY_PATTERNS];

  for (const section of document.sections) {
    for (const para of section.paragraphs) {
      for (const sentence of para.sentences) {
        const linkedChars = new Set<string>();
        const linkedSongs = new Set<string>();
        const linkedEvents = new Set<string>();

        for (const ep of allPatterns) {
          ep.pattern.lastIndex = 0;
          if (ep.pattern.test(sentence.text)) {
            switch (ep.entityType) {
              case 'character':
                linkedChars.add(ep.id);
                break;
              case 'song':
                linkedSongs.add(ep.id);
                break;
              case 'event':
                linkedEvents.add(ep.id);
                break;
            }
          }
        }

        sentence.characters = [...(sentence.characters || []), ...linkedChars];
        sentence.songs = [...(sentence.songs || []), ...linkedSongs];
        sentence.events = [...(sentence.events || []), ...linkedEvents];
      }
    }
  }

  return document;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getEntityPatterns(): EntityPattern[] {
  return ENTITY_PATTERNS;
}