import type { Document, DocumentMetadata } from '../../types';
import { contentId } from '../id';

export function importJson(jsonContent: string): Document {
  const data = JSON.parse(jsonContent);
  const metadata: DocumentMetadata = {
    title: data.title || 'Untitled',
    type: data.type || 'official-article',
    date: data.date,
    characters: data.characters || [],
    songs: data.songs || [],
    events: data.events || [],
    tags: data.tags || [],
    source: data.source,
  };

  const docSlug = data.id || metadata.title.toLowerCase().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '');

  const sections = (data.sections || []).map(
    (section: any, sIdx: number) => ({
      id: section.id || contentId('section', docSlug, sIdx),
      title: section.title || `Section ${sIdx + 1}`,
      paragraphs: (section.paragraphs || []).map(
        (para: any, pIdx: number) => ({
          id: para.id || contentId('paragraph', docSlug, sIdx, pIdx),
          text: para.text || '',
          sentences: (para.sentences || []).map(
            (sent: any, sentIdx: number) => ({
              id: sent.id || contentId('sentence', docSlug, sIdx, pIdx, sentIdx),
              text: sent.text || '',
              speaker: sent.speaker,
              characters: sent.characters || [],
              songs: sent.songs || [],
              events: sent.events || [],
              tags: sent.tags || [],
              importance: sent.importance,
            })
          ),
        })
      ),
    })
  );

  return {
    id: data.id || contentId('document', docSlug),
    metadata,
    sections,
    characters: metadata.characters,
    songs: metadata.songs,
    events: metadata.events,
    tags: metadata.tags,
    rawContent: JSON.stringify(data, null, 2),
  };
}