# AWS SBG Vol Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Next.js static site where each AWS SBG technicals volunteer opens a private link, gets fake-rejected by a Y2K-skinned AWS Console parody, then sees an acceptance decorated with a meme and a message written for them.

**Architecture:** Next.js App Router with `output: 'export'`. `data/vols.json` is read at build time by `generateStaticParams`, prerendering one standalone HTML file per vol so no page contains another vol's content. All reveal choreography is client-side, driven by a single `phase` state machine. Pure logic (normalization, fallbacks, console script assembly, slug generation) lives in `src/lib` and is unit tested; visual phases are verified in a browser.

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, Vitest, `next/font/google` (VT323, Press Start 2P, Comic Neue). No animation, confetti, or canvas libraries — all hand-rolled to keep the bundle small and dependency-free.

**Spec:** `docs/superpowers/specs/2026-08-26-vol-results-design.md`

## Global Constraints

- Every vol in `data/vols.json` is **accepted**. There is no rejection or waitlist outcome. The rejection is a bait-and-switch only.
- Only `slug` and `name` are required per vol. `meme`, `message`, `consoleLines`, and `accent` MUST degrade to defaults so a half-filled entry renders a complete page.
- No page may contain another vol's `message`, `meme`, or `consoleLines`. This is enforced by an automated check (Task 4), not by convention.
- `public/music.mp3` will not exist during development. The site MUST run silently with no console errors and no broken UI when it is absent.
- `prefers-reduced-motion: reduce` MUST disable screen shake, confetti, and the cursor trail. The reveal sequence still plays through every phase.
- Mobile-first. Every phase must be legible and tappable at 375×667.
- Expansions are exactly "Amazon Web Services" and "Student Builder Group".
- No new runtime dependencies beyond `next`, `react`, `react-dom`. Dev dependencies for TypeScript and Vitest are fine.

---

### Task 1: Project scaffold and decoy home page

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a buildable Next static-export project. `npm run build` emits `out/`. `npm test` runs Vitest.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "aws-sbg-vol-results",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "npx serve out",
    "test": "vitest run",
    "links": "node scripts/links.mjs",
    "verify": "node scripts/verify-isolation.mjs"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `next.config.mjs`**

Static export with unoptimized images (the export target has no image optimizer) and trailing slashes so `out/r/<slug>/index.html` resolves on any static host.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

- [ ] **Step 5: Write a smoke test**

Create `src/lib/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('runs tests', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Install and run the smoke test**

Run: `npm install && npm test`
Expected: PASS, 1 test.

- [ ] **Step 7: Create the root layout**

Create `src/app/layout.tsx`. Loads the three fonts as CSS variables and sets a misleading title so a stray visitor learns nothing.

```tsx
import type { Metadata } from 'next';
import { VT323, Press_Start_2P, Comic_Neue } from 'next/font/google';
import './globals.css';

const vt = VT323({ weight: '400', subsets: ['latin'], variable: '--font-terminal' });
const ps = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel' });
const cn = Comic_Neue({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-comic' });

export const metadata: Metadata = {
  title: 'under construction',
  description: 'this page is under construction',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${vt.variable} ${ps.variable} ${cn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create a minimal `globals.css`**

Just enough to build. The full design system arrives in Task 5.

```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: #000; color: #fff; font-family: var(--font-terminal), monospace; }
```

- [ ] **Step 9: Create the decoy home page**

Create `src/app/page.tsx`. A stray visitor to the root must find no vol list and no hint that per-vol pages exist.

```tsx
export default function Home() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', textAlign: 'center', padding: '2rem' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(2rem, 12vw, 6rem)' }}>404</h1>
        <p>this site is under construction</p>
        <p style={{ opacity: 0.5 }}>best viewed in Netscape Navigator 4.0</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 10: Verify the build**

Run: `npm run build`
Expected: build succeeds, `out/index.html` exists.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next static export project with decoy home page"
```

---

### Task 2: Vol data model with graceful fallbacks

**Files:**
- Create: `data/vols.json`
- Create: `src/lib/vols.ts`
- Test: `src/lib/vols.test.ts`
- Delete: `src/lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type RawVol = { slug: string; name: string; meme?: string; message?: string; consoleLines?: string[]; accent?: string }`
  - `type Vol = { slug: string; name: string; meme: string | null; message: string; consoleLines: string[]; accent: string }`
  - `normalizeVol(raw: RawVol, index: number): Vol`
  - `getAllVols(): Vol[]`
  - `getVol(slug: string): Vol | undefined`
  - `ACCENT_PALETTE: string[]`
  - `DEFAULT_MESSAGE: string`

- [ ] **Step 1: Create seed data**

Create `data/vols.json` with two sample entries — one fully filled, one minimal — so the fallback path is exercised from day one. The organizer replaces these.

```json
[
  {
    "slug": "sample-full-a1b2",
    "name": "Aditya",
    "meme": "/memes/sample.jpg",
    "message": "you asked what a for loop was on day one. now look at you.",
    "consoleLines": ["EXCUSES COUNTED...... 4", "CHAI CONSUMED...... 61L"],
    "accent": "#ff00ff"
  },
  {
    "slug": "sample-bare-c3d4",
    "name": "Priya"
  }
]
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/vols.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ACCENT_PALETTE, DEFAULT_MESSAGE, getAllVols, getVol, normalizeVol } from './vols';

describe('normalizeVol', () => {
  it('keeps every provided field', () => {
    const v = normalizeVol(
      { slug: 's', name: 'A', meme: '/m.jpg', message: 'hi', consoleLines: ['X'], accent: '#abc' },
      0,
    );
    expect(v).toEqual({
      slug: 's', name: 'A', meme: '/m.jpg', message: 'hi', consoleLines: ['X'], accent: '#abc',
    });
  });

  it('falls back to a null meme when none is given', () => {
    expect(normalizeVol({ slug: 's', name: 'A' }, 0).meme).toBeNull();
  });

  it('falls back to the default message when none is given', () => {
    expect(normalizeVol({ slug: 's', name: 'A' }, 0).message).toBe(DEFAULT_MESSAGE);
  });

  it('falls back to an empty console line list when none is given', () => {
    expect(normalizeVol({ slug: 's', name: 'A' }, 0).consoleLines).toEqual([]);
  });

  it('assigns accents from the palette by index, wrapping around', () => {
    expect(normalizeVol({ slug: 's', name: 'A' }, 0).accent).toBe(ACCENT_PALETTE[0]);
    expect(normalizeVol({ slug: 's', name: 'A' }, 1).accent).toBe(ACCENT_PALETTE[1]);
    expect(normalizeVol({ slug: 's', name: 'A' }, ACCENT_PALETTE.length).accent).toBe(ACCENT_PALETTE[0]);
  });

  it('treats blank strings as missing', () => {
    const v = normalizeVol({ slug: 's', name: 'A', message: '   ', meme: '', accent: '' }, 0);
    expect(v.message).toBe(DEFAULT_MESSAGE);
    expect(v.meme).toBeNull();
    expect(v.accent).toBe(ACCENT_PALETTE[0]);
  });
});

describe('getAllVols', () => {
  it('returns every vol from the data file', () => {
    expect(getAllVols().length).toBeGreaterThanOrEqual(2);
  });

  it('gives every vol a non-empty message and accent', () => {
    for (const v of getAllVols()) {
      expect(v.message.length).toBeGreaterThan(0);
      expect(v.accent).toMatch(/^#/);
    }
  });

  it('has no duplicate slugs', () => {
    const slugs = getAllVols().map((v) => v.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('getVol', () => {
  it('finds a vol by slug', () => {
    expect(getVol('sample-bare-c3d4')?.name).toBe('Priya');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getVol('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `./vols`.

- [ ] **Step 4: Implement `src/lib/vols.ts`**

```ts
import rawVols from '../../data/vols.json';

export type RawVol = {
  slug: string;
  name: string;
  meme?: string;
  message?: string;
  consoleLines?: string[];
  accent?: string;
};

export type Vol = {
  slug: string;
  name: string;
  meme: string | null;
  message: string;
  consoleLines: string[];
  accent: string;
};

export const ACCENT_PALETTE = ['#ff00ff', '#00ffff', '#ffff00', '#00ff66', '#ff6600', '#ff0066'];

export const DEFAULT_MESSAGE =
  'we watched you the whole time. you had no idea. welcome to technicals.';

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function normalizeVol(raw: RawVol, index: number): Vol {
  return {
    slug: raw.slug,
    name: raw.name,
    meme: clean(raw.meme),
    message: clean(raw.message) ?? DEFAULT_MESSAGE,
    consoleLines: raw.consoleLines?.filter((l) => l.trim()) ?? [],
    accent: clean(raw.accent) ?? ACCENT_PALETTE[index % ACCENT_PALETTE.length],
  };
}

export function getAllVols(): Vol[] {
  return (rawVols as RawVol[]).map(normalizeVol);
}

export function getVol(slug: string): Vol | undefined {
  return getAllVols().find((v) => v.slug === slug);
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all 10 tests.

Note: `getAllVols` passes `normalizeVol` directly to `.map`, which supplies the index as the second argument. That is intentional and is what makes the palette-wrapping test pass.

- [ ] **Step 6: Delete the smoke test**

```bash
rm src/lib/smoke.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add vol data model with graceful fallbacks"
```

---

### Task 3: Slug generator and link export script

**Files:**
- Create: `scripts/links.mjs`
- Create: `src/lib/slug.ts`
- Test: `src/lib/slug.test.ts`

**Interfaces:**
- Consumes: `RawVol` from `src/lib/vols.ts`.
- Produces:
  - `slugify(name: string): string` — lowercase ASCII base, no random suffix.
  - `randomSuffix(length?: number): string` — default length 4.
  - `makeSlug(name: string, taken: Set<string>): string` — collision-free full slug.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/slug.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { makeSlug, randomSuffix, slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Aditya Kumar')).toBe('aditya-kumar');
  });

  it('strips punctuation and collapses separators', () => {
    expect(slugify("D'Souza,  Ravi!")).toBe('dsouza-ravi');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Riya--  ')).toBe('riya');
  });

  it('falls back to "vol" when nothing survives', () => {
    expect(slugify('!!!')).toBe('vol');
  });
});

describe('randomSuffix', () => {
  it('returns the requested length', () => {
    expect(randomSuffix(4)).toHaveLength(4);
    expect(randomSuffix(6)).toHaveLength(6);
  });

  it('uses only lowercase alphanumerics', () => {
    for (let i = 0; i < 50; i++) expect(randomSuffix()).toMatch(/^[a-z0-9]+$/);
  });

  it('is not trivially repetitive', () => {
    const seen = new Set(Array.from({ length: 50 }, () => randomSuffix()));
    expect(seen.size).toBeGreaterThan(40);
  });
});

describe('makeSlug', () => {
  it('combines the name base with a suffix', () => {
    expect(makeSlug('Aditya', new Set())).toMatch(/^aditya-[a-z0-9]{4}$/);
  });

  it('never returns a slug already taken', () => {
    const taken = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const s = makeSlug('Same Name', taken);
      expect(taken.has(s)).toBe(false);
      taken.add(s);
    }
    expect(taken.size).toBe(200);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `./slug`.

- [ ] **Step 3: Implement `src/lib/slug.ts`**

```ts
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function slugify(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Write the link script**

Create `scripts/links.mjs`. It fills in any missing slug, writes the file back, and prints a distribution list. It must never regenerate a slug that already exists — links may already have been sent.

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataPath = path.join(root, 'data', 'vols.json');

const slugify = (name) =>
  name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'vol';

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
  do { candidate = `${slugify(vol.name)}-${randomSuffix()}`; } while (taken.has(candidate));
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
```

- [ ] **Step 6: Run the script**

Run: `npm run links`
Expected: prints "All vols already have slugs." then two rows, with `sample-bare-c3d4` flagged `[no meme, no message]`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add slug generation and link export script"
```

---

### Task 4: Per-vol route with enforced content isolation

**Files:**
- Create: `src/app/r/[slug]/page.tsx`
- Create: `scripts/verify-isolation.mjs`

**Interfaces:**
- Consumes: `getAllVols`, `getVol`, `Vol` from `src/lib/vols.ts`.
- Produces: a static page per vol at `out/r/<slug>/index.html`. Renders a temporary plain view of the vol; Tasks 5–11 replace the body with the real reveal.

- [ ] **Step 1: Write the route**

`generateStaticParams` enumerates the slugs. Because the page is a server component under `output: 'export'`, only the resolved vol's data reaches the HTML.

```tsx
import { getAllVols, getVol } from '@/lib/vols';

export function generateStaticParams() {
  return getAllVols().map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export default async function VolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vol = getVol(slug);
  if (!vol) return null;

  return (
    <main>
      <h1>{vol.name}</h1>
      <p>{vol.message}</p>
      <p>{vol.accent}</p>
    </main>
  );
}
```

- [ ] **Step 2: Build and confirm the pages exist**

Run: `npm run build`
Expected: `out/r/sample-full-a1b2/index.html` and `out/r/sample-bare-c3d4/index.html` both exist.

- [ ] **Step 3: Write the isolation verifier**

Create `scripts/verify-isolation.mjs`. This guards the one property that would ruin the surprise for everyone if it broke, so it must be mechanical rather than eyeballed.

```js
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
console.log(`Isolation OK — ${vols.length} page(s), no cross-vol content leaks.`);
```

- [ ] **Step 4: Run the verifier**

Run: `npm run verify`
Expected: `Isolation OK — 2 page(s), no cross-vol content leaks.`

- [ ] **Step 5: Prove the verifier can actually fail**

Temporarily change the route to render every vol:

```tsx
{getAllVols().map((v) => <p key={v.slug}>{v.message}</p>)}
```

Run: `npm run build && npm run verify`
Expected: FAIL with `LEAK` lines and a non-zero exit code. Then revert the change, rebuild, and confirm it passes again. A verifier that cannot fail is worth nothing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add per-vol static route with isolation verification"
```

---

### Task 5: Y2K design system and persistent desktop chrome

**Files:**
- Rewrite: `src/app/globals.css`
- Create: `src/components/Chrome.tsx`
- Create: `src/hooks/useReducedMotion.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - CSS custom properties: `--y2k-teal` (`#008080`), `--y2k-silver` (`#c0c0c0`), `--y2k-navy` (`#000080`), `--y2k-bsod` (`#0000aa`), `--accent` (set per page from `vol.accent`).
  - Utility classes: `.win` (raised bevel panel), `.win-title` (gradient title bar), `.win-btn` (bevelled button), `.wordart` (bevelled outlined display text), `.marquee`.
  - `useReducedMotion(): boolean`
  - `<Chrome accent={string} muted={boolean} onToggleMute={() => void} />` — fixed taskbar with a live clock and mute toggle, plus the cursor trail.

- [ ] **Step 1: Implement `useReducedMotion`**

```ts
'use client';
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
```

Note it starts `false` and corrects in an effect, because the static export renders on the server where no media query exists. Every consumer must therefore tolerate one frame of motion-enabled state.

- [ ] **Step 2: Write `globals.css`**

Required contents, in order:

1. A reset: `* { box-sizing: border-box }`, zeroed `html, body` margins, `overflow-x: hidden`.
2. `:root` with the four Y2K colours above plus `--accent: #ff00ff` as a default.
3. `body` — the tiled Windows-98 teal, `font-family: var(--font-comic)`, `color: #000`, `min-height: 100dvh`.
4. `.win` — `background: var(--y2k-silver)`, `border: 2px outset #fff`, `box-shadow: 4px 4px 0 rgba(0,0,0,0.5)`.
5. `.win-title` — `background: linear-gradient(90deg, var(--y2k-navy), var(--accent))`, white bold text, `font-family: var(--font-pixel)`, `font-size: 0.6rem`, `padding: 4px 6px`, flex with the close/minimise glyphs pushed right.
6. `.win-btn` — silver, `border: 2px outset #fff`, `:active { border-style: inset }`, `font-family: var(--font-pixel)`, minimum 44px tall for thumbs.
7. `.wordart` — `font-family: Impact, var(--font-pixel), sans-serif`, `text-transform: uppercase`, `background: linear-gradient(180deg, #ffef00, #ff008a)` with `background-clip: text` and transparent fill, plus a stacked `text-shadow` bevel of at least four offsets in black. Include a `-webkit-text-stroke: 2px #000`.
8. `.marquee` — a `translateX(100%) → translateX(-100%)` keyframe over 18s linear infinite, wrapped in `overflow: hidden; white-space: nowrap`.
9. `@keyframes shake` — 6 steps of ±6px translate and ±1deg rotate.
10. `@keyframes blink` — `50% { opacity: 0 }`.
11. A closing `@media (prefers-reduced-motion: reduce)` block that sets `animation: none !important` on `.marquee`, `.shake`, and `.blink`, and hides `.cursor-trail`.

Font sizing must use `clamp()` throughout so the 375px viewport stays legible.

- [ ] **Step 3: Implement `Chrome.tsx`**

A client component rendering:
- A fixed bottom taskbar (`.win`, `height: 40px`) with a `START` button on the left, a mute toggle, and a live clock on the right updating each second via `setInterval`, cleared on unmount.
- A cursor trail: track `pointermove`, keep the last 12 positions in a ref, render them as small accent-coloured squares with decreasing opacity via `requestAnimationFrame`. Skip entirely when `useReducedMotion()` is true or when `window.matchMedia('(pointer: coarse)').matches` — a trail on a touchscreen is pointless and costs frames. Cancel the rAF loop on unmount.

The taskbar clock must render nothing until mounted (`useState` + `useEffect`) so server and client markup match and React does not warn about a hydration mismatch.

- [ ] **Step 4: Mount Chrome on the vol page and check visually**

Wire `<Chrome>` into `src/app/r/[slug]/page.tsx` beneath the temporary content, then:

Run: `npm run dev`
Open `http://localhost:3000/r/sample-full-a1b2/` and confirm: teal tiled background, bevelled panels, taskbar pinned to the bottom with a ticking clock, cursor trail following the pointer on desktop and absent on a mobile emulation.

- [ ] **Step 5: Confirm reduced motion**

In devtools, emulate `prefers-reduced-motion: reduce`, reload, and confirm the cursor trail is gone and no marquee animates.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Y2K design system and desktop chrome"
```

---

### Task 6: Phase machine, desktop, and dial-up

**Files:**
- Create: `src/components/Reveal.tsx`
- Create: `src/components/phases/Desktop.tsx`
- Create: `src/components/phases/Dialup.tsx`
- Modify: `src/app/r/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Vol`, `Chrome`, `useReducedMotion`.
- Produces:
  - `type Phase = 'desktop' | 'dialup' | 'evaluating' | 'rejected' | 'accepted'`
  - `<Reveal vol={Vol} />` — the client root owning `phase` and the audio element.
  - `<Desktop onLaunch={() => void} />`
  - `<Dialup onDone={() => void} />`

- [ ] **Step 1: Implement `Reveal.tsx`**

A client component holding `const [phase, setPhase] = useState<Phase>('desktop')`, rendering exactly one phase component, and setting `--accent` on its own wrapper from `vol.accent` so every descendant picks it up. It renders `<Chrome>` at all times.

Advance rules: `desktop → dialup` on launch; `dialup → evaluating` on done; `evaluating → rejected` on done; `rejected → accepted` on done or on user skip. Later tasks supply the last three components; for now, render a placeholder `<div>` for phases beyond `dialup`.

- [ ] **Step 2: Implement `Desktop.tsx`**

Full-viewport teal desktop with one selectable icon: a bevelled square above the label `SBG_TECHNICALS_VERDICT.exe` in pixel font. Single tap selects (inverted highlight); double-click or a second tap launches. On touch, a single tap must launch — double-tap on mobile is a discoverability trap and often triggers zoom.

Include a small `.blink` hint reading `>> double-click to open <<`. This is the only gesture that unlocks audio, so nothing may auto-advance past this phase.

- [ ] **Step 3: Implement `Dialup.tsx`**

A centred `.win` dialog titled `Connecting to sbg-technicals.aws...` containing:
- A bevelled progress bar filling 0→100% over ~2.6s, driven by `requestAnimationFrame` against a `performance.now()` start stamp, not `setInterval`.
- Status lines swapping at intervals: `Dialing...`, `Handshaking...`, `Verifying credentials...`, `Connected at 56.6 Kbps`.
- Calls `onDone()` once, ~400ms after reaching 100%.

Guard `onDone` with a ref so a re-render cannot fire it twice. Cancel the rAF loop in the effect cleanup.

- [ ] **Step 4: Wire into the page**

Replace the temporary body of `src/app/r/[slug]/page.tsx` with `<Reveal vol={vol} />`. Keep `generateStaticParams` and `dynamicParams` untouched.

- [ ] **Step 5: Verify the flow**

Run: `npm run dev`, open a vol page, double-click the icon, and confirm the dial-up dialog runs to 100% and advances to the placeholder. Then run `npm run build && npm run verify` and confirm isolation still passes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add phase machine with desktop and dial-up phases"
```

---

### Task 7: AWS Console evaluation phase

**Files:**
- Create: `src/lib/consoleScript.ts`
- Test: `src/lib/consoleScript.test.ts`
- Create: `src/components/phases/Evaluating.tsx`
- Modify: `src/components/Reveal.tsx`

**Interfaces:**
- Consumes: `Vol`.
- Produces:
  - `type ConsoleLine = { text: string; status: 'ok' | 'warn' | 'fail' | 'plain' }`
  - `buildConsoleScript(vol: Vol): ConsoleLine[]`
  - `<Evaluating vol={Vol} onDone={() => void} />`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/consoleScript.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildConsoleScript } from './consoleScript';
import { normalizeVol } from './vols';

const bare = normalizeVol({ slug: 's', name: 'Priya' }, 0);
const rich = normalizeVol(
  { slug: 't', name: 'Aditya', consoleLines: ['EXCUSES COUNTED...... 4'] },
  1,
);

describe('buildConsoleScript', () => {
  it('produces a usable script for a vol with no custom lines', () => {
    expect(buildConsoleScript(bare).length).toBeGreaterThanOrEqual(6);
  });

  it('personalizes the provisioning line with the vol name', () => {
    expect(buildConsoleScript(bare).some((l) => l.text.includes('Priya'))).toBe(true);
  });

  it('includes the vol custom lines', () => {
    expect(buildConsoleScript(rich).some((l) => l.text === 'EXCUSES COUNTED...... 4')).toBe(true);
  });

  it('ends on the rollback line that sets up the fake rejection', () => {
    const script = buildConsoleScript(rich);
    expect(script[script.length - 1].status).toBe('fail');
    expect(script[script.length - 1].text).toMatch(/ROLLBACK/i);
  });

  it('never leaks another vol name into the script', () => {
    expect(buildConsoleScript(bare).some((l) => l.text.includes('Aditya'))).toBe(false);
  });

  it('is deterministic for the same vol', () => {
    expect(buildConsoleScript(rich)).toEqual(buildConsoleScript(rich));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `./consoleScript`.

- [ ] **Step 3: Implement `src/lib/consoleScript.ts`**

```ts
import type { Vol } from './vols';

export type ConsoleLine = { text: string; status: 'ok' | 'warn' | 'fail' | 'plain' };

export function buildConsoleScript(vol: Vol): ConsoleLine[] {
  const custom: ConsoleLine[] = vol.consoleLines.map((text) => ({ text, status: 'ok' }));

  return [
    { text: 'aws sbg configure --profile technicals', status: 'plain' },
    { text: `PROVISIONING VOL INSTANCE: ${vol.name} (t2.micro)`, status: 'ok' },
    { text: 'REGION: ap-south-1', status: 'plain' },
    { text: 'ATTACHING IAM ROLE: VolunteerFullAccess', status: 'ok' },
    { text: 'SCANNING S3 BUCKET: sbg-technicals-memes', status: 'ok' },
    { text: 'MEASURING VIBE............ 97%', status: 'ok' },
    { text: 'WOULD THEY SURVIVE A 3AM DEBUG?...... PASS', status: 'ok' },
    ...custom,
    { text: 'BILLING ALERT: $0.00 — UNPAID LABOUR DETECTED', status: 'warn' },
    { text: 'CLOUDWATCH: sleep_hours METRIC BELOW THRESHOLD', status: 'warn' },
    { text: 'FINALIZING DECISION............ 99%', status: 'warn' },
    { text: 'CREATE_FAILED — STACK ROLLBACK INITIATED', status: 'fail' },
  ];
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Implement `Evaluating.tsx`**

A full-screen `.win` styled as an AWS Console window — title bar reading `AWS Management Console — SBG Technicals`, body on near-black with `font-family: var(--font-terminal)` at a comfortable mobile size.

Behaviour:
- Reveal lines one at a time on a ~380ms cadence via a single `setTimeout` chain (not one timer per line), keeping an index in state.
- Colour by status: `ok` green `#00ff66`, `warn` amber `#ffcc00`, `fail` red `#ff2222`, `plain` grey.
- Auto-scroll the container to the bottom as lines land.
- The `FINALIZING DECISION` line renders a progress bar that visibly stalls at 99% for ~1.4s before the final line.
- Call `onDone()` once, ~900ms after the last line, guarded by a ref.
- Clear any pending timeout in the effect cleanup.

Wire `evaluating` into `Reveal.tsx`.

- [ ] **Step 6: Verify**

Run: `npm run dev`, walk the flow, and confirm lines stream, the bar stalls at 99%, and it advances after the rollback line.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add AWS console evaluation phase"
```

---

### Task 8: Rejection phase and the flip

**Files:**
- Create: `src/components/phases/Rejected.tsx`
- Modify: `src/components/Reveal.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: `Vol`, `useReducedMotion`.
- Produces: `<Rejected vol={Vol} onDone={() => void} />`

- [ ] **Step 1: Implement the BSOD**

Full-viewport `--y2k-bsod` blue, white terminal font, centred, reading as a CloudFormation failure:

```
SBG_TECHNICALS_STACK

A fatal exception has occurred at DEPLOYMENT:0x0000SBG.

  Status ....... CREATE_FAILED
  Resource ..... VolunteerRole/<name>
  Reason ....... APPLICATION REJECTED

Press any key to continue _
```

The word `REJECTED` renders large, red, and blinking. The vol's name appears in the Resource line so it reads as personally addressed.

- [ ] **Step 2: Stack the error dialogs**

Over ~1.2s, spawn four `.win` error dialogs at staggered offsets, each with a red X glyph, an `OK` button, and text cycling through: `decision.exe has stopped responding`, `Cannot allocate free time`, `ERR_TOO_MANY_APPLICANTS`, `sbg_technicals.dll not found`. Their `OK` buttons are decorative — clicking does nothing, which is the joke.

- [ ] **Step 3: Add the shake**

Apply the `shake` keyframe to the root wrapper for the first ~600ms, gated on `useReducedMotion()` being false.

- [ ] **Step 4: Hold, then flip**

Hold the full rejection state for **3000ms** total from mount, then call `onDone()`. Guard with a ref; clear the timer on unmount.

Provide a skip affordance: a small, low-contrast `[skip]` in a corner and a `keydown`/`pointerdown` handler on the phase that both call `onDone()` early. Nobody should be trapped in the bad news.

- [ ] **Step 5: Add the shatter transition**

Add a `.shatter` class in `globals.css`: a ~520ms animation combining `scale(1 → 1.15)`, `opacity(1 → 0)`, and a `clip-path` polygon that fragments the panel. Apply it to the BSOD wrapper once `onDone` fires, before unmounting. Under reduced motion, substitute a plain 200ms fade.

- [ ] **Step 6: Verify the emotional beat**

Run: `npm run dev` and walk the whole flow at mobile width. The rejection must read as genuinely convincing for its full three seconds — if it reads as an obvious joke, the flip has nothing to land against. Confirm the skip control works and that reduced motion removes the shake.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add rejection phase with stack rollback and shatter transition"
```

---

### Task 9: The acceptance panel

**Files:**
- Create: `src/components/phases/Accepted.tsx`
- Create: `src/components/Confetti.tsx`
- Modify: `src/components/Reveal.tsx`

**Interfaces:**
- Consumes: `Vol`, `useReducedMotion`.
- Produces:
  - `<Accepted vol={Vol} />`
  - `<Confetti active={boolean} accent={string} />`

- [ ] **Step 1: Implement `Confetti.tsx`**

A `<canvas>` fixed at `inset: 0` with `pointer-events: none`, sized to `devicePixelRatio`. On `active`, spawn ~140 particles with random `x`, velocity, rotation, and a colour drawn from the accent plus the Y2K palette. Integrate with gravity in a `requestAnimationFrame` loop, drawing each as a rotated rectangle. Stop the loop and clear the canvas when all particles fall past the bottom, or immediately when `useReducedMotion()` is true. Cancel the rAF and remove the resize listener on unmount.

No confetti library. This is ~60 lines and avoids a dependency.

- [ ] **Step 2: Implement `Accepted.tsx`**

Composition, top to bottom:
1. A full-width `.marquee` ticker repeating `★ WELCOME TO AWS SBG TECHNICALS ★ YOU ABSOLUTE LEGEND ★`.
2. `YOU'RE IN` in `.wordart` at `clamp(2.5rem, 14vw, 8rem)`, with the vol's name beneath it in the accent colour.
3. A draggable `.win` window titled `<name>.exe — Properties` containing the meme and the message. Dragging is pointer-event based and desktop-only; on touch the window is simply static and centred.
4. The meme: when `vol.meme` is set, an `<img>` with `alt={`meme for ${vol.name}`}`, `max-width: 100%`, and a bevelled inset frame. When it is `null`, render a placeholder panel — a bevelled box with a broken-image glyph and the text `[meme.gif — coming soon]`. The page must never show a broken image icon.
5. The message in `var(--font-comic)` at a readable size, generously spaced.
6. A `.win-btn` slot for the flex card button, filled in Task 11.
7. `<Confetti active accent={vol.accent} />`.

- [ ] **Step 3: Verify both data paths**

Run: `npm run dev` and walk both `sample-full-a1b2` (meme and custom message) and `sample-bare-c3d4` (placeholder and default message) to the end. Both must look deliberate — the bare one must not look broken.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add acceptance panel with confetti and meme display"
```

---

### Task 10: Audio with graceful absence

**Files:**
- Create: `src/hooks/useAudio.ts`
- Modify: `src/components/Reveal.tsx`, `src/components/Chrome.tsx`
- Create: `public/README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `useAudio(src: string): { play: () => void; pause: () => void; toggleMute: () => void; muted: boolean; available: boolean }`

- [ ] **Step 1: Implement the hook**

Create an `HTMLAudioElement` in a ref inside `useEffect` (never during render — it does not exist on the server). Set `loop = true` and `preload = 'auto'`.

Handle absence explicitly: attach an `error` listener that sets `available` to `false`. Wrap `play()` in `.catch(() => {})` because it returns a rejected promise when autoplay is blocked or the file is missing, and an unhandled rejection would print an error the spec forbids.

`toggleMute` flips `element.muted` and mirrors it into state.

- [ ] **Step 2: Wire into the flow**

In `Reveal.tsx`: call `play()` at the `dialup` transition — the double-click satisfies the browser gesture requirement. Set `volume = 0` for the duration of the `rejected` phase and restore it on the flip, so the silence lands with the bad news and the music slams back in.

In `Chrome.tsx`: render the mute toggle as a taskbar `.win-btn` showing `♪ ON` / `♪ OFF`. Hide it entirely when `available` is `false`, so the missing-file state shows no dead control.

- [ ] **Step 3: Document the drop-in for the organizer**

Create `public/README.md`:

```markdown
# Assets

## music.mp3

Drop your track here as `music.mp3`. It starts when the dial-up dialog
opens, goes silent during the fake rejection, and returns on the reveal.
It loops.

Until this file exists the site runs silently and the mute button is
hidden. Nothing else changes.

Keep it under ~3 MB — most vols will open this on mobile data.

## memes/

Per-vol images. Reference them from `data/vols.json` as `/memes/<file>`.
Anything the browser renders works: jpg, png, gif, webp.
```

- [ ] **Step 4: Verify both states**

With no `public/music.mp3`: run `npm run dev`, walk the flow, and confirm the console is clean and the mute button is absent.

Then drop any MP3 in as `public/music.mp3`, reload, and confirm it starts at dial-up, cuts during the rejection, returns on the flip, and the mute toggle works.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add audio with graceful handling of a missing track"
```

---

### Task 11: Downloadable flex card

**Files:**
- Create: `src/lib/flexCard.ts`
- Test: `src/lib/flexCard.test.ts`
- Create: `src/components/FlexCardButton.tsx`
- Modify: `src/components/phases/Accepted.tsx`

**Interfaces:**
- Consumes: `Vol`.
- Produces:
  - `cardFilename(name: string): string`
  - `wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[]`
  - `CARD_WIDTH = 1080`, `CARD_HEIGHT = 1350`
  - `<FlexCardButton vol={Vol} />`

- [ ] **Step 1: Write the failing tests**

Only the pure helpers are tested; the canvas drawing is verified by eye. Create `src/lib/flexCard.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cardFilename, wrapText } from './flexCard';

describe('cardFilename', () => {
  it('builds a safe filename from the name', () => {
    expect(cardFilename('Aditya Kumar')).toBe('aditya-kumar-sbg-technicals.png');
  });

  it('strips punctuation', () => {
    expect(cardFilename("D'Souza, Ravi!")).toBe('dsouza-ravi-sbg-technicals.png');
  });

  it('handles a name that reduces to nothing', () => {
    expect(cardFilename('!!!')).toBe('vol-sbg-technicals.png');
  });
});

describe('wrapText', () => {
  const ctx = { measureText: (t: string) => ({ width: t.length * 10 }) } as CanvasRenderingContext2D;

  it('keeps a short line whole', () => {
    expect(wrapText(ctx, 'hello there', 1000)).toEqual(['hello there']);
  });

  it('wraps at the width limit', () => {
    expect(wrapText(ctx, 'aaa bbb ccc ddd', 70)).toEqual(['aaa bbb', 'ccc ddd']);
  });

  it('does not drop a word that is longer than the limit', () => {
    expect(wrapText(ctx, 'supercalifragilistic', 50)).toEqual(['supercalifragilistic']);
  });

  it('returns an empty array for empty input', () => {
    expect(wrapText(ctx, '   ', 100)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `./flexCard`.

- [ ] **Step 3: Implement the helpers**

```ts
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

export function cardFilename(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'vol'}-sbg-technicals.png`;
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Implement `FlexCardButton.tsx`**

On click, draw to an offscreen 1080×1350 canvas:
1. A vertical gradient from `var(--y2k-navy)` to the vol's accent.
2. A chunky bevelled border inset 24px.
3. `I'M IN` in Impact, huge, with the same stacked-shadow bevel as `.wordart`, drawn as repeated `fillText` offsets since canvas has no `text-shadow`.
4. The vol's name beneath it.
5. The meme, when present, drawn into a fixed square frame with aspect-preserving `object-fit: cover` maths — compute the source crop rectangle rather than distorting it.
6. The message, wrapped with `wrapText`.
7. `AWS SBG TECHNICALS '26` across the footer.

Then `canvas.toBlob()` → `URL.createObjectURL` → a synthetic `<a download={cardFilename(vol.name)}>` click → `URL.revokeObjectURL`.

Two things that will bite otherwise: set `img.crossOrigin = 'anonymous'` and await `img.decode()` before drawing, and wait for `document.fonts.ready` before the first `fillText` or Impact will not have loaded and the metrics will be wrong.

Render the button as a `.win-btn` reading `💾 SAVE YOUR FLEX CARD` in the slot left in `Accepted.tsx`. While rendering, disable it and show `RENDERING...`.

- [ ] **Step 6: Verify the output**

Run: `npm run dev`, reach the acceptance, click the button, and open the downloaded PNG. Check: exactly 1080×1350, the meme is cropped not squashed, long messages wrap inside the frame, and the filename matches the vol. Repeat for `sample-bare-c3d4` and confirm the no-meme layout still looks composed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add downloadable flex card"
```

---

### Task 12: Organizer documentation and release pass

**Files:**
- Create: `README.md`
- Modify: whatever the mobile and verification passes turn up.

**Interfaces:**
- Consumes: everything.
- Produces: a deployable site and instructions the organizer can follow without reading code.

- [ ] **Step 1: Write `README.md`**

Cover, in this order:
1. **Adding a vol** — the `data/vols.json` field table, with a copy-paste example object and a note that only `name` is truly required.
2. **Adding a meme** — drop in `public/memes/`, reference as `/memes/<file>`.
3. **Generating links** — `SITE_URL=https://<real>.vercel.app npm run links`, and the warning that existing slugs are never regenerated because links may already be sent.
4. **The music** — point at `public/README.md`.
5. **Deploying** — push to GitHub, import in Vercel, framework preset Next.js, no env vars needed.
6. **Before you send the links** — the pre-flight checklist below.

- [ ] **Step 2: Add the pre-flight checklist to the README**

```markdown
## Before you send the links

- [ ] `npm test` passes
- [ ] `npm run build && npm run verify` reports no leaks
- [ ] `npm run links` shows no `[no meme, no message]` flags
- [ ] Every name is spelled the way that person spells it
- [ ] You have opened at least two real vol links on an actual phone
- [ ] `public/music.mp3` is in place, or you are happy shipping silent
- [ ] Nobody on the list is someone who was *not* selected
```

The last item exists because this site tells everyone in the file they got in. A wrong name in that file is the one failure mode that genuinely hurts someone.

- [ ] **Step 3: Mobile pass**

At 375×667 in devtools, walk every phase. Fix any horizontal overflow, any tap target under 44px, and any text under 14px. The `.wordart` and console phases are the likely offenders.

- [ ] **Step 4: Full verification**

Run: `npm test && npm run build && npm run verify`
Expected: all tests pass, build succeeds, isolation reports no leaks.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add organizer guide and pre-flight checklist"
```

---

## Self-Review

**Spec coverage:** Purpose → Tasks 6–9. Unguessable per-vol links → Task 3. Content isolation → Task 4. Data model and fallbacks → Task 2. Reveal sequence phases 1–7 → Tasks 6, 7, 8, 9, 11. Reduced motion → Tasks 5, 8, 9. Audio safety valves and absent-file behaviour → Task 10. Skippable rejection → Task 8. Mobile-first → Task 12. Decoy root route → Task 1. Organizer workflow → Tasks 3, 10, 12. No gaps.

**Placeholder scan:** No TBDs. Every tested module carries real test code and real implementation code. Visual components are specified by exact file, props, behaviour, and timing values rather than transcribed markup, because their correctness is judged in a browser and not by assertion.

**Type consistency:** `Vol` and `RawVol` (Task 2) are consumed unchanged by Tasks 4, 6, 7, 9, 11. `Phase` (Task 6) covers exactly the five states Tasks 6–9 render. `ConsoleLine.status` values `ok | warn | fail | plain` (Task 7) match the colour mapping in the same task. `useReducedMotion` (Task 5) is used with the same signature in Tasks 8, 9. `cardFilename` and `wrapText` (Task 11) match their tests.
