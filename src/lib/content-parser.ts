import matter from 'gray-matter';
import type { Document, Section, Paragraph, Sentence, DocumentMetadata } from '../types';
import { contentId } from './id';
import { splitParagraphs } from './paragraph-splitter';
import { splitSentences } from './sentence-splitter';

export function parseMarkdownDocument(
  rawContent: string,
  filePath: string
): Document {
  const { data, content } = matter(rawContent);
  const metadata: DocumentMetadata = {
    title: data.title || filePath,
    type: data.type || 'official-article',
    date: data.date,
    characters: data.characters || [],
    songs: data.songs || [],
    events: data.events || [],
    tags: data.tags || [],
    source: data.source,
  };

  const sections = splitIntoSections(content, filePath);
  const allCharacters = collectUnique(sections, 'characters');
  const allSongs = collectUnique(sections, 'songs');
  const allEvents = collectUnique(sections, 'events');
  const allTags = collectUnique(sections, 'tags');

  return {
    id: contentId('document', filePath.replace(/\.mdx?$/, '')),
    metadata,
    sections,
    characters: [...new Set([...(metadata.characters || []), ...allCharacters])],
    songs: [...new Set([...(metadata.songs || []), ...allSongs])],
    events: [...new Set([...(metadata.events || []), ...allEvents])],
    tags: [...new Set([...(metadata.tags || []), ...allTags])],
    rawContent: content,
  };
}

function splitIntoSections(content: string, docSlug: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: { title: string; lines: string[] } | null = null;
  let sectionNum = 0;

  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('# ')) {
      if (currentSection) {
        sections.push(buildSection(currentSection.title, currentSection.lines, docSlug, sectionNum));
        sectionNum++;
      }
      currentSection = {
        title: line.replace(/^#+\s*/, '').trim(),
        lines: [],
      };
    } else {
      if (!currentSection) {
        currentSection = { title: 'Introduction', lines: [] };
      }
      currentSection.lines.push(line);
    }
  }

  if (currentSection) {
    sections.push(buildSection(currentSection.title, currentSection.lines, docSlug, sectionNum));
  }

  return sections;
}

function buildSection(title: string, lines: string[], docSlug: string, sectionNum: number): Section {
  const text = lines.join('\n').trim();
  const paragraphTexts = splitParagraphs(text);
  const paragraphs: Paragraph[] = [];
  let paraNum = 0;

  for (const paraText of paragraphTexts) {
    if (!paraText.trim()) continue;
    const sentences = splitSentences(paraText);
    const sentenceNodes: Sentence[] = [];
    let sentNum = 0;

    for (const sent of sentences) {
      sentenceNodes.push({
        id: contentId('sentence', docSlug, sectionNum, paraNum, sentNum),
        text: sent,
        importance: undefined,
      });
      sentNum++;
    }

    paragraphs.push({
      id: contentId('paragraph', docSlug, sectionNum, paraNum),
      sentences: sentenceNodes,
      text: paraText,
    });
    paraNum++;
  }

  return {
    id: contentId('section', docSlug, sectionNum),
    title,
    paragraphs,
  };
}

function collectUnique(sections: Section[], field: 'characters' | 'songs' | 'events' | 'tags'): string[] {
  const values: string[] = [];
  for (const section of sections) {
    for (const para of section.paragraphs) {
      for (const sent of para.sentences) {
        const arr = sent[field];
        if (arr) values.push(...arr);
      }
    }
  }
  return [...new Set(values)];
}

export { matter };