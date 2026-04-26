import type { Team } from '../types';
import { CURRENT_TEAM_EXPORT_SCHEMA_VERSION, migrateTeamExportPayload, type RawTeamExportPayload } from './teamSchema';

export type TeamExportPayload = {
  schemaVersion: typeof CURRENT_TEAM_EXPORT_SCHEMA_VERSION;
  exportedAt: string;
  teams: Team[];
};

export const buildExportPayload = (teams: Team[]): TeamExportPayload => ({
  schemaVersion: CURRENT_TEAM_EXPORT_SCHEMA_VERSION,
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
  let parsed: RawTeamExportPayload;
  try {
    parsed = JSON.parse(text) as RawTeamExportPayload;
  } catch {
    throw new TeamImportError('JSON 解析失败', '导入文件不是有效的 JSON。', '请确认文件来自本应用的“导出队伍”功能，或重新导出后再导入。');
  }

  if (parsed.schemaVersion === undefined || !Array.isArray(parsed.teams)) {
    throw new TeamImportError('导入文件格式不正确', '未找到 schemaVersion 或 teams 数组。', '请使用本应用导出的 JSON 格式，避免直接粘贴 Showdown paste 或其它工具格式。');
  }

  try {
    return migrateTeamExportPayload(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知导入错误。';
    if (message.includes('schemaVersion')) {
      throw new TeamImportError('导入文件版本不支持', message, '请使用当前版本应用重新导出，或先通过旧版本应用升级队伍数据。');
    }
    if (message.includes('teams 数组为空')) {
      throw new TeamImportError('导入文件没有队伍', message, '请导入至少包含一支队伍的 JSON 文件。');
    }
    if (message.includes('ruleSetId') || message.includes('dataVersionId')) {
      throw new TeamImportError(
        '导入队伍缺少版本信息',
        message,
        '请重新导出队伍，或补齐规则集和数据版本字段后再导入。',
      );
    }
    if (message.includes('id、name 或 members')) {
      throw new TeamImportError('导入队伍字段不完整', message, '请确认导入文件没有被手动删改。');
    }
    throw new TeamImportError('导入失败', message, '请确认文件格式后重试。');
  }
};
