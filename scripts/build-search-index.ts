import { buildSearchEntries, buildFlexSearchConfig } from '../src/lib/search-index';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = 'public/data';

async function main() {
  console.log('Building FlexSearch index...');
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // This script generates the FlexSearch configuration
  // The actual client-side search index will be built during Astro build
  const config = buildFlexSearchConfig();
  writeFileSync(
    join(OUTPUT_DIR, 'search-config.json'),
    JSON.stringify(config, null, 2)
  );

  console.log('FlexSearch config generated. Client-side index will be built during page load.');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});