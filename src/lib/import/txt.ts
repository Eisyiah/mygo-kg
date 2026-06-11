import { splitParagraphs } from '../paragraph-splitter';
import { splitSentences } from '../sentence-splitter';
import { contentId } from '../id';
import type { Document, DocumentMetadata } from '../../types';

export function importTxt(
  rawContent: string,
  metadata: Partial<DocumentMetadata>
): Document {
  const title = metadata.title || 'Untitled';
  const docSlug = title.toLowerCase().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
  const paragraphs = splitParagraphs(rawContent);
  let paraNum = 0;
  const paraNodes: typeof document.sections[0]['paragraphs'] = [];

  for (const paraText of paragraphs) {
    const sents = splitSentences(paraText);
    const sentNodes = sents.map((s, i) => ({
      id: contentId('sentence', docSlug, 0, paraNum, i),
      text: s,
    }));

    paraNodes.push({
      id: contentId('paragraph', docSlug, 0, paraNum),
      sentences: sentNodes,
      text: paraText,
    });
    paraNum++;
  }

  return {
    id: contentId('document', docSlug),
    metadata: {
      title,
      type: metadata.type || 'official-article',
      date: metadata.date,
      characters: metadata.characters || [],
      songs: metadata.songs || [],
      events: metadata.events || [],
      tags: metadata.tags || [],
      source: metadata.source,
    },
    sections: [{
      id: contentId('section', docSlug, 0),
      title: 'Full Text',
      paragraphs: paraNodes,
    }],
    characters: metadata.characters || [],
    songs: metadata.songs || [],
    events: metadata.events || [],
    tags: metadata.tags || [],
    rawContent,
  };
}