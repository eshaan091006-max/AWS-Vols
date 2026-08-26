import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const vols = JSON.parse(readFileSync(path.join(root, 'data', 'vols.json'), 'utf8'));

if (!existsSync(path.join(root, 'out'))) {
  console.error('No out/ directory. Run `npm run build` first.');
  process.exit(1);
}

let failures = 0;
for (const vol of vols) {
  const file = path.join(root, 'out', 'r', vol.slug, 'index.html');
  if (!existsSync(file)) {
    console.error(`MISSING  ${vol.slug}: no page was generated`);
    failures++;
    continue;
  }
  const html = readFileSync(file, 'utf8');

  for (const other of vols) {
    if (other.slug === vol.slug) continue;
    const secrets = [other.message, other.meme, ...(other.consoleLines ?? [])].filter(Boolean);
    for (const secret of secrets) {
      if (html.includes(secret)) {
        console.error(`LEAK     ${vol.slug} contains ${other.slug}'s content: "${secret}"`);
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} isolation failure(s).`);
  process.exit(1);
}
console.log(`Isolation OK - ${vols.length} page(s), no cross-vol content leaks.`);
