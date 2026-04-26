import { describe, expect, it } from 'vitest';
import { currentDataVersion, currentRuleSet, defaultTeams } from '../data';
import { CURRENT_TEAM_EXPORT_SCHEMA_VERSION, migrateTeamExportPayload } from './teamSchema';

describe('team schema migration', () => {
  it('keeps the current schema version explicit', () => {
    expect(CURRENT_TEAM_EXPORT_SCHEMA_VERSION).toBe(1);
  });

  it('normalizes current schema teams', () => {
    const migrated = migrateTeamExportPayload({
      schemaVersion: 1,
      teams: defaultTeams,
    });

    expect(migrated).toEqual(defaultTeams);
  });

  it('migrates v0 teams by filling optional member defaults', () => {
    const migrated = migrateTeamExportPayload({
      schemaVersion: 0,
      teams: [
        {
          id: 'legacy',
          name: 'Legacy',
          ruleSetId: currentRuleSet.id,
          dataVersionId: currentDataVersion.id,
          members: [{ pokemonId: 'garchomp' }],
        },
      ],
    });

    expect(migrated[0].members[0]).toMatchObject({
      id: 'imported-member-1',
      pokemonId: 'garchomp',
      moveIds: [],
      nature: '爽朗',
      level: 50,
      legalityStatus: 'needs-review',
    });
  });

  it('rejects unsupported future schema versions', () => {
    expect(() => migrateTeamExportPayload({ schemaVersion: 99, teams: defaultTeams })).toThrow('不支持的 schemaVersion: 99');
  });
});
