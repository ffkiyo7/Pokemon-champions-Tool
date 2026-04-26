import { describe, expect, it } from 'vitest';
import { currentDataVersion, currentRuleSet, defaultTeams } from '../data';
import { buildExportPayload, parseTeamImport } from './exportImport';

describe('team import/export schema', () => {
  it('exports teams with schema version and timestamps', () => {
    const payload = buildExportPayload(defaultTeams);

    expect(payload.schemaVersion).toBe(1);
    expect(Date.parse(payload.exportedAt)).not.toBeNaN();
    expect(payload.teams).toHaveLength(defaultTeams.length);
    expect(payload.teams[0].ruleSetId).toBe(currentRuleSet.id);
    expect(payload.teams[0].dataVersionId).toBe(currentDataVersion.id);
  });

  it('parses valid v1 team exports', () => {
    const text = JSON.stringify(buildExportPayload(defaultTeams));

    expect(parseTeamImport(text)).toEqual(defaultTeams);
  });

  it('rejects unknown schema versions', () => {
    const text = JSON.stringify({ schemaVersion: 2, teams: defaultTeams });

    expect(() => parseTeamImport(text)).toThrow('导入文件格式不正确');
  });

  it('rejects teams without rule or data version ids', () => {
    const [team] = defaultTeams;
    const text = JSON.stringify({
      schemaVersion: 1,
      teams: [{ ...team, dataVersionId: '' }],
    });

    expect(() => parseTeamImport(text)).toThrow('导入队伍缺少 ruleSetId 或 dataVersionId');
  });
});
