import { describe, expect, it } from 'vitest';
import { currentDataVersion, currentRuleSet, defaultTeams } from '../data';
import { TeamImportError, buildExportPayload, parseTeamImport } from './exportImport';

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

    try {
      parseTeamImport(text);
    } catch (error) {
      expect(error).toBeInstanceOf(TeamImportError);
      expect((error as TeamImportError).title).toBe('导入文件格式不正确');
      expect((error as TeamImportError).suggestion).toContain('v1 导出格式');
    }
  });

  it('rejects invalid JSON with actionable import details', () => {
    expect(() => parseTeamImport('{bad-json')).toThrow(TeamImportError);
    try {
      parseTeamImport('{bad-json');
    } catch (error) {
      expect(error).toBeInstanceOf(TeamImportError);
      expect((error as TeamImportError).title).toBe('JSON 解析失败');
      expect((error as TeamImportError).suggestion).toContain('重新导出');
    }
  });

  it('rejects teams without rule or data version ids', () => {
    const [team] = defaultTeams;
    const text = JSON.stringify({
      schemaVersion: 1,
      teams: [{ ...team, dataVersionId: '' }],
    });

    expect(() => parseTeamImport(text)).toThrow('第 1 支队伍缺少 ruleSetId 或 dataVersionId');
  });

  it('rejects structurally incomplete teams', () => {
    const text = JSON.stringify({
      schemaVersion: 1,
      teams: [{ id: 'broken', ruleSetId: currentRuleSet.id, dataVersionId: currentDataVersion.id }],
    });

    expect(() => parseTeamImport(text)).toThrow('第 1 支队伍缺少 id、name 或 members');
  });
});
