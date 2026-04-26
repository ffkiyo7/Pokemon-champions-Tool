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

export class TeamImportError extends Error {
  title: string;
  suggestion: string;

  constructor(title: string, message: string, suggestion: string) {
    super(message);
    this.name = 'TeamImportError';
    this.title = title;
    this.suggestion = suggestion;
  }
}

export const parseTeamImport = (text: string): Team[] => {
  let parsed: Partial<TeamExportPayload>;
  try {
    parsed = JSON.parse(text) as Partial<TeamExportPayload>;
  } catch {
    throw new TeamImportError('JSON 解析失败', '导入文件不是有效的 JSON。', '请确认文件来自本应用的“导出队伍”功能，或重新导出后再导入。');
  }

  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.teams)) {
    throw new TeamImportError('导入文件格式不正确', '未找到 schemaVersion: 1 或 teams 数组。', '请使用 v1 导出格式，避免直接粘贴 Showdown paste 或其它工具格式。');
  }

  if (parsed.teams.length === 0) {
    throw new TeamImportError('导入文件没有队伍', 'teams 数组为空。', '请导入至少包含一支队伍的 JSON 文件。');
  }

  parsed.teams.forEach((team, index) => {
    if (!team.ruleSetId || !team.dataVersionId) {
      throw new TeamImportError(
        '导入队伍缺少版本信息',
        `第 ${index + 1} 支队伍缺少 ruleSetId 或 dataVersionId。`,
        '请重新导出队伍，或补齐规则集和数据版本字段后再导入。',
      );
    }
    if (!team.id || !team.name || !Array.isArray(team.members)) {
      throw new TeamImportError('导入队伍字段不完整', `第 ${index + 1} 支队伍缺少 id、name 或 members。`, '请确认导入文件没有被手动删改。');
    }
  });

  return parsed.teams;
};
