import { buildRelationships, extractNodeInfo } from '../src/lib/relationship-engine';
import { buildBacklinks } from '../src/lib/backlinks';
import { buildSearchEntries } from '../src/lib/search-index';
import { buildTimeline } from '../src/lib/timeline';
import { buildGraphData, toCytoscapeElements } from '../src/lib/graph';
import { importMarkdown } from '../src/lib/import/markdown';
import { entityId } from '../src/lib/id';
import { registerEntityPattern, linkEntities } from '../src/lib/entity-linker';
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import matter from 'gray-matter';
import type { EntityType } from '../src/types';

const OUTPUT_DIR = 'public/data';
const CONTENT_DIR = resolve('src/content');

const DIR_TO_TYPE: Record<string, EntityType> = {
  characters: 'character',
  songs: 'song',
  episodes: 'episode',
  events: 'event',
  radio: 'radio',
  interviews: 'interview',
  lives: 'live',
  tags: 'tag',
};

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

function readDirSafe(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function parseEntityFile(filePath: string): { id: string; name: string; type: string } | null {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);
    const stem = filePath.split(/[\\/]/).pop()?.replace(/\.mdx?$/, '') || '';
    const parts = filePath.split(/[\\/]/);
    const typeDir = parts[parts.length - 2];
    const entityType = DIR_TO_TYPE[typeDir];
    if (!entityType) return null;

    // Try frontmatter fields that could contain the name: name, title, nameJa, titleJa
    const rawName = data.name || data.title || data.nameJa || data.titleJa || stem;
    const id = stem; // Use the filename slug for stable IDs (matches Astro content ID)

    // Build proper prefixed ID for the graph
    const prefix = entityType === 'character' ? 'char' :
      entityType === 'episode' ? 'ep' : entityType;
    const prefixedId = `${prefix}-${stem}`;

    return { id: prefixedId, name: rawName, type: entityType };
  } catch (err) {
    console.error(`Failed to parse entity file ${filePath}:`, err);
    return null;
  }
}

function main() {
  console.log('Building relationships, search index, timeline, and graph data...');
  ensureDir(OUTPUT_DIR);

  // ── 1. Parse entity files from content directories ──
  const entityDirs = ['characters', 'songs', 'episodes', 'events', 'radio', 'interviews', 'lives', 'tags'];
  const entities: { id: string; name: string; type: string }[] = [];
  const entityDataArr: { id: string; name: string; type: string; rawData: Record<string, unknown> }[] = [];

  for (const dir of entityDirs) {
    const dirPath = join(CONTENT_DIR, dir);
    const files = readDirSafe(dirPath);
    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const fullPath = join(dirPath, file);
        const result = parseEntityFile(fullPath);
        if (result) {
          entities.push(result);
          try {
            const { data } = matter(readFileSync(fullPath, 'utf-8'));
            entityDataArr.push({ ...result, rawData: data });
          } catch { /* ignore */ }
        }
      }
    }
  }

  console.log(`Loaded ${entities.length} entities`);

  // Register entity patterns for auto-linking
  for (const e of entityDataArr) {
    if (e.type === 'character' || e.type === 'song' || e.type === 'event') {
      const entityType: 'character' | 'song' | 'event' = e.type;
      const aliases: string[] = [];
      if (e.rawData.aliases && Array.isArray(e.rawData.aliases)) {
        aliases.push(...(e.rawData.aliases as string[]));
      }
      if (e.rawData.nameJa) aliases.push(e.rawData.nameJa as string);
      if (e.rawData.titleJa) aliases.push(e.rawData.titleJa as string);
      registerEntityPattern(entityType, e.name, aliases);
    }
  }

  // ── 2. Parse document files ──
  const docsDir = join(CONTENT_DIR, 'documents');
  const parsedDocs: ReturnType<typeof importMarkdown>[] = [];
  const docFiles = readDirSafe(docsDir);

  if (docFiles.length > 0) {
    for (const file of docFiles) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        try {
          const doc = importMarkdown(join(docsDir, file));
          parsedDocs.push(linkEntities(doc));
        } catch (err) {
          console.error(`Failed to parse document ${file}:`, err);
        }
      }
    }
  }

  console.log(`Parsed ${parsedDocs.length} documents`);

  // ── 3. Build entity nodes for relationship engine ──
  const entityNodes = entityDataArr.map((e) => ({
    id: e.id,
    characters: e.type === 'character' ? [e.id] : (e.rawData.characters as string[] || []),
    songs: e.type === 'song' ? [e.id] : (e.rawData.songs as string[] || []),
    events: e.type === 'event' ? [e.id] : [],
    tags: e.type === 'tag' ? [e.id] : [],
    type: e.type,
    date: e.rawData.date as string || e.rawData.releaseDate as string || undefined,
    title: e.name,
  }));

  // Cross-reference entities: propagate performer/song/event data bidirectionally
  for (const e of entityDataArr) {
    const node = entityNodes.find((n) => n.id === e.id);
    if (!node) continue;

    // Song performers → add song to each performer character, add characters to song
    if (e.type === 'song' && Array.isArray(e.rawData.performers)) {
      const performerIds = (e.rawData.performers as string[]);
      for (const pid of performerIds) {
        node.characters = [...new Set([...node.characters, pid])];
        // Also add this song to the performer's songs list
        const charNode = entityNodes.find((n) => n.id === pid);
        if (charNode) {
          charNode.songs = [...new Set([...charNode.songs, e.id])];
        }
      }
    }

    // Event characters/songs → cross-reference
    if (e.type === 'event') {
      const ec = e.rawData.characters as string[] || [];
      const es = e.rawData.songs as string[] || [];
      for (const cid of ec) {
        const charNode = entityNodes.find((n) => n.id === cid);
        if (charNode) charNode.events = [...new Set([...charNode.events, e.id])];
      }
      for (const sid of es) {
        const songNode = entityNodes.find((n) => n.id === sid);
        if (songNode) songNode.events = [...new Set([...songNode.events, e.id])];
      }
    }
  }

  // ── 4. Extract document node info for relationships ──
  const docNodes = parsedDocs.flatMap(extractNodeInfo);
  const allNodes = [...entityNodes, ...docNodes];

  // ── 5. Build relationships ──
  const relationships = buildRelationships(allNodes);
  writeFileSync(
    join(OUTPUT_DIR, 'relationships.json'),
    JSON.stringify(relationships, null, 2)
  );
  console.log(`Generated ${relationships.length} relationship entries`);

  // ── 6. Build backlinks ──
  const backlinks = buildBacklinks(parsedDocs);

  // Add entity-to-entity backlinks from cross-referenced data
  for (const node of entityNodes) {
    if (!backlinks[node.id]) backlinks[node.id] = [];

    // Characters linked to songs they perform
    if (node.type === 'character') {
      for (const sid of node.songs) {
        if (sid === node.id) continue;
        const songEntity = entities.find((e) => e.id === sid);
        if (songEntity) {
          backlinks[node.id]!.push({
            sourceId: sid,
            sourceType: 'song',
            sourceTitle: songEntity.name,
            context: songEntity.name,
          });
        }
      }
      for (const eid of node.events) {
        if (eid === node.id) continue;
        const evEntity = entities.find((e) => e.id === eid);
        if (evEntity) {
          backlinks[node.id]!.push({
            sourceId: eid,
            sourceType: 'event',
            sourceTitle: evEntity.name,
            context: evEntity.name,
          });
        }
      }
    }

    // Songs linked to characters who perform them
    if (node.type === 'song') {
      for (const cid of node.characters) {
        if (cid === node.id) continue;
        const charEntity = entities.find((e) => e.id === cid);
        if (charEntity) {
          backlinks[node.id]!.push({
            sourceId: cid,
            sourceType: 'character',
            sourceTitle: charEntity.name,
            context: charEntity.name,
          });
        }
      }
    }

    // Events linked to participating characters
    if (node.type === 'event') {
      for (const cid of node.characters) {
        if (cid === node.id) continue;
        const charEntity = entities.find((e) => e.id === cid);
        if (charEntity) {
          backlinks[node.id]!.push({
            sourceId: cid,
            sourceType: 'character',
            sourceTitle: charEntity.name,
            context: charEntity.name,
          });
        }
      }
      for (const sid of node.songs) {
        if (sid === node.id) continue;
        const songEntity = entities.find((e) => e.id === sid);
        if (songEntity) {
          backlinks[node.id]!.push({
            sourceId: sid,
            sourceType: 'song',
            sourceTitle: songEntity.name,
            context: songEntity.name,
          });
        }
      }
    }
  }
  writeFileSync(
    join(OUTPUT_DIR, 'backlinks.json'),
    JSON.stringify(backlinks, null, 2)
  );
  console.log('Generated backlinks index');

  // ── 7. Build search index ──
  const searchEntries = buildSearchEntries(parsedDocs);
  // Add entity entries for search
  for (const entity of entities) {
    searchEntries.push({
      id: entity.id,
      title: entity.name,
      text: entity.name,
      type: entity.type,
      characters: entity.type === 'character' ? [entity.id] : [],
      songs: entity.type === 'song' ? [entity.id] : [],
      events: entity.type === 'event' ? [entity.id] : [],
      tags: entity.type === 'tag' ? [entity.id] : [],
    });
  }
  writeFileSync(
    join(OUTPUT_DIR, 'search-index.json'),
    JSON.stringify(searchEntries, null, 2)
  );
  console.log(`Generated ${searchEntries.length} search entries`);

  // ── 8. Build timeline ──
  const timeline = buildTimeline(parsedDocs);
  // Add entity dates to timeline
  for (const entity of entityNodes) {
    if (entity.date) {
      // Merge into timeline - simplified: add to appropriate year/month
      const d = new Date(entity.date);
      if (isNaN(d.getTime())) continue;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      let yearEntry = timeline.find((y) => y.year === year);
      if (!yearEntry) {
        yearEntry = { year, months: [] };
        timeline.push(yearEntry);
      }
      let monthEntry = yearEntry.months.find((m) => m.month === month);
      if (!monthEntry) {
        monthEntry = { year, month, entries: [] };
        yearEntry.months.push(monthEntry);
      }
      monthEntry.entries.push({
        id: entity.id,
        date: entity.date,
        title: entity.title || entity.id,
        type: entity.type,
        characters: entity.characters,
      });
    }
  }
  // Re-sort timeline
  timeline.sort((a, b) => a.year - b.year);
  for (const y of timeline) {
    y.months.sort((a, b) => a.month - b.month);
    for (const m of y.months) {
      m.entries.sort((a, b) => a.date.localeCompare(b.date));
    }
  }
  writeFileSync(
    join(OUTPUT_DIR, 'timeline.json'),
    JSON.stringify(timeline, null, 2)
  );
  console.log('Generated timeline data');

  // ── 9. Build graph data ──
  const graphData = buildGraphData(parsedDocs, relationships, entities);
  const cytoscapeData = toCytoscapeElements(graphData);
  writeFileSync(
    join(OUTPUT_DIR, 'graph.json'),
    JSON.stringify(cytoscapeData, null, 2)
  );
  console.log(`Generated graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);

  console.log('\nData build complete! Output files in public/data/:');
  const outFiles = readDirSafe(OUTPUT_DIR);
  for (const f of outFiles) console.log(`  - ${f}`);
}

main();
