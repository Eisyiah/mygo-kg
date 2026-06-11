import { execSync } from 'child_process';

function main() {
  console.log('=== Building all data ===\n');
  execSync('npx tsx scripts/build-relationships.ts', { stdio: 'inherit' });
  console.log('\n=== Data build complete! ===');
  console.log('Run `npm run build` to build the Astro site.');
}

main();
