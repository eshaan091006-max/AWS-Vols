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
