const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function slugify(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2019]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'vol';
}

export function randomSuffix(length = 4): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function makeSlug(name: string, taken: Set<string>): string {
  const base = slugify(name);
  for (let attempt = 0; attempt < 100; attempt++) {
    const candidate = `${base}-${randomSuffix()}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${randomSuffix(10)}`;
}
