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
