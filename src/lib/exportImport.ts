import type { Team } from '../types';

export type TeamExportPayload = {
  schemaVersion: 1;
  exportedAt: string;
  teams: Team[];
};

export const buildExportPayload = (teams: Team[]): TeamExportPayload => ({
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  teams,
});

export const parseTeamImport = (text: string): Team[] => {
  const parsed = JSON.parse(text) as Partial<TeamExportPayload>;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.teams)) {
    throw new Error('导入文件格式不正确');
  }
  parsed.teams.forEach((team) => {
    if (!team.ruleSetId || !team.dataVersionId) {
      throw new Error('导入队伍缺少 ruleSetId 或 dataVersionId');
    }
  });
  return parsed.teams;
};
