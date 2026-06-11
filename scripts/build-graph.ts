import { buildRelationships, extractNodeInfo } from '../src/lib/relationship-engine';
import { buildGraphData, toCytoscapeElements } from '../src/lib/graph';
import { importMarkdown } from '../src/lib/import/markdown';
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import matter from 'gray-matter';
import type { EntityType } from '../src/types';

const OUTPUT_DIR = 'public/data';
const CONTENT_DIR = resolve('src/content');

const DIR_TO_TYPE: Record<string, EntityType> = {
  characters: 'character', songs: 'song', episodes: 'episode',
  events: 'event', radio: 'radio', interviews: 'interview',
  lives: 'live', tags: 'tag',
};

function readDirSafe(dir: string): string[] {
  try { return readdirSync(dir); } catch { return []; }
}

function main() {
  console.log('Building standalone graph data...');
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load entities
  const entityDirs = ['characters', 'songs', 'episodes', 'events', 'radio', 'interviews', 'lives', 'tags'];
  const entities: { id: string; name: string; type: string }[] = [];

  for (const dir of entityDirs) {
    for (const file of readDirSafe(join(CONTENT_DIR, dir))) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
      try {
        const raw = readFileSync(join(CONTENT_DIR, dir, file), 'utf-8');
        const { data } = matter(raw);
        const stem = file.replace(/\.mdx?$/, '');
        const entityType = DIR_TO_TYPE[dir];
        if (!entityType) continue;
        const prefix = entityType === 'character' ? 'char' : entityType === 'episode' ? 'ep' : entityType;
        entities.push({ id: `${prefix}-${stem}`, name: data.name || data.title || stem, type: entityType });
      } catch { /* skip */ }
    }
  }

  // Parse documents
  const parsedDocs: ReturnType<typeof importMarkdown>[] = [];
  for (const file of readDirSafe(join(CONTENT_DIR, 'documents'))) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    try { parsedDocs.push(importMarkdown(join(CONTENT_DIR, 'documents', file))); } catch (err) { console.error(err); }
  }

  const allNodes = [...entities.map(e => ({ id: e.id, characters: [], songs: [], events: [], tags: [], type: e.type })), ...parsedDocs.flatMap(extractNodeInfo)];
  const relationships = buildRelationships(allNodes);
  const graphData = buildGraphData(parsedDocs, relationships, entities);
  const cyData = toCytoscapeElements(graphData);

  writeFileSync(join(OUTPUT_DIR, 'graph.json'), JSON.stringify(cyData, null, 2));
  console.log(`Generated graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
}

main();
