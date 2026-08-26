import { existsSync } from 'node:fs';
import path from 'node:path';
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

/**
 * These validate whatever is actually in data/vols.json rather than any fixture,
 * so `npm test` doubles as a pre-flight check on the real roster. They must hold
 * for an empty file too — an empty roster is a normal state while setting up.
 */
describe('the real data file', () => {
  it('gives every vol a non-empty name', () => {
    for (const v of getAllVols()) expect(v.name.trim()).not.toBe('');
  });

  it('gives every vol a non-empty message and a hex accent', () => {
    for (const v of getAllVols()) {
      expect(v.message.trim()).not.toBe('');
      expect(v.accent).toMatch(/^#[0-9a-f]{3,8}$/i);
    }
  });

  it('gives every vol a URL-safe slug', () => {
    for (const v of getAllVols()) expect(v.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('has no duplicate slugs', () => {
    const slugs = getAllVols().map((v) => v.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  // Catches a typo'd path before the links go out, when it would otherwise
  // silently degrade to the placeholder frame on someone's results page.
  it('points every meme at a file that exists', () => {
    for (const v of getAllVols()) {
      if (!v.meme) continue;
      const file = path.join(process.cwd(), 'public', v.meme.replace(/^\//, ''));
      expect(existsSync(file), `${v.name}: missing ${v.meme}`).toBe(true);
    }
  });
});

describe('getVol', () => {
  it('finds every vol by its own slug', () => {
    for (const v of getAllVols()) expect(getVol(v.slug)?.name).toBe(v.name);
  });

  it('returns undefined for an unknown slug', () => {
    expect(getVol('definitely-not-a-real-slug')).toBeUndefined();
  });
});
