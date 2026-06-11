import { parseHTML } from 'linkedom';
import { parseMarkdownDocument } from '../content-parser';
import type { Document } from '../../types';

export function importHtml(html: string, slug: string): Document {
  const { document } = parseHTML(html);

  const title =
    document.querySelector('title')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    'Untitled';

  const article =
    document.querySelector('article') ||
    document.querySelector('main') ||
    document.querySelector('body');

  const content = article?.textContent?.trim() || '';

  const markdown = `# ${title}\n\n${content
    .split('\n')
    .filter((line) => line.trim())
    .join('\n\n')}`;

  return parseMarkdownDocument(markdown, slug);
}