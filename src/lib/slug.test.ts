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
