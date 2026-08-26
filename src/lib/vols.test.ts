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
