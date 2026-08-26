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
