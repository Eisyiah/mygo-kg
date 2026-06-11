import type { Document } from '../types';

interface SearchIndexEntry {
  id: string;
  title: string;
  text: string;
  type: string;
  characters: string[];
  songs: string[];
  events: string[];
  tags: string[];
  date?: string;
  speaker?: string;
}

export function buildSearchEntries(documents: Document[]): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];

  for (const doc of documents) {
    entries.push({
      id: doc.id,
      title: doc.metadata.title,
      text: doc.rawContent,
      type: doc.metadata.type,
      characters: doc.characters,
      songs: doc.songs,
      events: doc.events,
      tags: doc.tags,
      date: doc.metadata.date,
    });

    for (const section of doc.sections) {
      for (const para of section.paragraphs) {
        entries.push({
          id: para.id,
          title: `${doc.metadata.title} - ${section.title}`,
          text: para.text,
          type: 'paragraph',
          characters: para.characters || [],
          songs: [],
          events: [],
          tags: para.tags || [],
        });

        for (const sent of para.sentences) {
          entries.push({
            id: sent.id,
            title: section.title,
            text: sent.text,
            type: 'sentence',
            characters: sent.characters || [],
            songs: sent.songs || [],
            events: sent.events || [],
            tags: sent.tags || [],
            speaker: sent.speaker,
          });
        }
      }
    }
  }

  return entries;
}

export function buildFlexSearchConfig(): Record<string, unknown> {
  return {
    charset: 'latin:extra',
    tokenize: 'forward',
    resolution: 9,
    cache: true,
  };
}

export { SearchIndexEntry };