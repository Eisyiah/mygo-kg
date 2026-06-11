import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { importMarkdown } from './markdown';
import { importTxt } from './txt';
import { importJson } from './json';
import { importHtml } from './html';
import type { Document, DocumentMetadata } from '../../types';

interface BulkImportOptions {
  dir: string;
  recursive?: boolean;
  metadata?: Partial<DocumentMetadata>;
}

export function bulkImport(options: BulkImportOptions): Document[] {
  const { dir, recursive = true, metadata = {} } = options;
  const documents: Document[] = [];

  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && recursive) {
      documents.push(...bulkImport({ dir: fullPath, recursive, metadata }));
      continue;
    }

    const ext = extname(file).toLowerCase();
    try {
      switch (ext) {
        case '.md':
        case '.mdx':
          documents.push(importMarkdown(fullPath));
          break;
        case '.txt':
          documents.push(importTxt(readFileContent(fullPath), metadata));
          break;
        case '.json':
          documents.push(importJson(readFileContent(fullPath)));
          break;
        case '.html':
          documents.push(importHtml(readFileContent(fullPath), file.replace(/\.html?$/, '')));
          break;
      }
    } catch (err) {
      console.error(`Failed to import ${fullPath}:`, err);
    }
  }

  return documents;
}

function readFileContent(filePath: string): string {
  const { readFileSync } = require('fs');
  return readFileSync(filePath, 'utf-8');
}