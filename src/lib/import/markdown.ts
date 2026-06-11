import { parseMarkdownDocument } from '../content-parser';
import type { Document } from '../../types';
import { readFileSync } from 'fs';

export function importMarkdown(filePath: string): Document {
  const rawContent = readFileSync(filePath, 'utf-8');
  const slug = filePath.replace(/\.mdx?$/, '').split(/[\\/]/).pop() || filePath;
  return parseMarkdownDocument(rawContent, slug);
}