import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataPath = path.join(root, 'data', 'vols.json');

const slugify = (name) =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2019]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'vol';

const randomSuffix = (length = 4) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
};

const baseUrl = (process.env.SITE_URL ?? 'https://your-site.vercel.app').replace(/\/$/, '');
const vols = JSON.parse(readFileSync(dataPath, 'utf8'));
const taken = new Set(vols.map((v) => v.slug).filter(Boolean));

let added = 0;
for (const vol of vols) {
  if (vol.slug) continue;
  let candidate;
  do {
    candidate = `${slugify(vol.name)}-${randomSuffix()}`;
  } while (taken.has(candidate));
  taken.add(candidate);
  vol.slug = candidate;
  added++;
}

if (added > 0) {
  writeFileSync(dataPath, `${JSON.stringify(vols, null, 2)}\n`);
  console.log(`Generated ${added} new slug(s).\n`);
} else {
  console.log('All vols already have slugs.\n');
}

const width = Math.max(...vols.map((v) => v.name.length));
for (const vol of vols) {
  const missing = [];
  if (!vol.meme) missing.push('meme');
  if (!vol.message) missing.push('message');
  const flag = missing.length ? `   [no ${missing.join(', no ')}]` : '';
  console.log(`${vol.name.padEnd(width)}  ${baseUrl}/r/${vol.slug}/${flag}`);
}
