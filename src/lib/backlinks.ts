import type { BacklinkIndex, BacklinkEntry } from '../types';
import type { Document } from '../types';

export function buildBacklinks(documents: Document[]): BacklinkIndex {
  const index: BacklinkIndex = {};

  for (const doc of documents) {
    addReferences(index, doc.id, 'document', doc.metadata.title, doc);

    for (const section of doc.sections) {
      for (const para of section.paragraphs) {
        for (const sent of para.sentences) {
          const refs = [
            ...(sent.characters || []),
            ...(sent.songs || []),
            ...(sent.events || []),
            ...(sent.references || []),
          ];

          for (const ref of refs) {
            if (!index[ref]) index[ref] = [];
            index[ref].push({
              sourceId: sent.id,
              sourceType: 'sentence',
              sourceTitle: section.title,
              context: sent.text.substring(0, 200),
            });
          }
        }
      }
    }
  }

  deduplicateBacklinks(index);
  return index;
}

function addReferences(
  index: BacklinkIndex,
  sourceId: string,
  sourceType: string,
  sourceTitle: string,
  doc: Document
): void {
  const allRefs = [
    ...doc.characters,
    ...doc.songs,
    ...doc.events,
    ...doc.tags,
  ];

  for (const ref of allRefs) {
    if (!index[ref]) index[ref] = [];
    index[ref].push({
      sourceId,
      sourceType,
      sourceTitle,
      context: doc.metadata.title,
    });
  }
}

function deduplicateBacklinks(index: BacklinkIndex): void {
  for (const key of Object.keys(index)) {
    const seen = new Set<string>();
    index[key] = index[key].filter((entry) => {
      const k = `${entry.sourceId}:${entry.context}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
}

export function getBacklinks(index: BacklinkIndex, nodeId: string): BacklinkEntry[] {
  return index[nodeId] || [];
}