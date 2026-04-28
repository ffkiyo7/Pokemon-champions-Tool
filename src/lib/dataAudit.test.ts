import { describe, expect, it } from 'vitest';
import { currentDataVersion, dataSourceManifest, defaultTeams, speedBenchmarks } from '../data';
import { auditSeedData, auditSourceRefs } from './dataAudit';

describe('seed data audit', () => {
  it('keeps current seed data internally consistent', () => {
    expect(auditSeedData()).toEqual([]);
  });

  it('keeps every catalog source ref resolvable through the manifest', () => {
    const sourceRefIds = new Set(dataSourceManifest.sources.map((sourceRef) => sourceRef.id));

    expect(sourceRefIds.has('reg-ma-official-rule')).toBe(true);
    expect(sourceRefIds.has('manual-seed-review')).toBe(true);
    expect(auditSourceRefs('Test row', ['reg-ma-official-rule'])).toEqual([]);
  });

  it('reports source refs that are not present in the manifest', () => {
    const issues = auditSourceRefs('Test row', ['missing-source']);

    expect(issues).toEqual([
      {
        code: 'unresolved-source-ref',
        message: 'Test row references unknown sourceRef missing-source.',
      },
    ]);
  });

  it('keeps benchmark versions aligned with the active data version', () => {
    expect(speedBenchmarks.every((benchmark) => benchmark.dataVersionId === currentDataVersion.id)).toBe(true);
  });

  it('keeps default teams tied to the active data version', () => {
    expect(defaultTeams.every((team) => team.dataVersionId === currentDataVersion.id)).toBe(true);
  });
});
