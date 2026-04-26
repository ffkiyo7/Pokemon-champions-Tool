import { describe, expect, it } from 'vitest';
import { currentDataVersion, defaultTeams, speedBenchmarks } from '../data';
import { auditSeedData } from './dataAudit';

describe('seed data audit', () => {
  it('keeps current seed data internally consistent', () => {
    expect(auditSeedData()).toEqual([]);
  });

  it('keeps benchmark versions aligned with the active data version', () => {
    expect(speedBenchmarks.every((benchmark) => benchmark.dataVersionId === currentDataVersion.id)).toBe(true);
  });

  it('keeps default teams tied to the active data version', () => {
    expect(defaultTeams.every((team) => team.dataVersionId === currentDataVersion.id)).toBe(true);
  });
});
