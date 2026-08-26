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

  // Text this vol is entitled to show. Two vols may legitimately share a
  // message — deliberately, or because both fell back to the default — and
  // that is not a leak, so shared strings are never counted against a page.
  const own = new Set([vol.message, vol.meme, ...(vol.consoleLines ?? [])].filter(Boolean));

  for (const other of vols) {
    if (other.slug === vol.slug) continue;
    const secrets = [other.message, other.meme, ...(other.consoleLines ?? [])].filter(Boolean);
    for (const secret of secrets) {
      if (own.has(secret)) continue;
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

// Not an error — sharing a message is allowed — but the whole point of the
// site is that each reveal feels written for one person, so it is worth saying.
const byMessage = new Map();
for (const vol of vols) {
  if (!vol.message) continue;
  const names = byMessage.get(vol.message) ?? [];
  names.push(vol.name);
  byMessage.set(vol.message, names);
}
for (const [message, names] of byMessage) {
  if (names.length < 2) continue;
  console.log(`NOTE     ${names.join(', ')} share the same message: "${message.slice(0, 60)}..."`);
}

console.log(`Isolation OK - ${vols.length} page(s), no cross-vol content leaks.`);
