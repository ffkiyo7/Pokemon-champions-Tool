import type { Team, TeamMember } from '../types';

export const CURRENT_TEAM_EXPORT_SCHEMA_VERSION = 1;

export type TeamExportSchemaVersion = 0 | typeof CURRENT_TEAM_EXPORT_SCHEMA_VERSION;

type RawTeamMember = Partial<TeamMember>;

type RawTeam = Omit<Partial<Team>, 'members'> & {
  members?: RawTeamMember[];
};

export type RawTeamExportPayload = {
  schemaVersion?: number;
  exportedAt?: string;
  teams?: RawTeam[];
};

const now = () => new Date().toISOString();

const migrateMember = (member: RawTeamMember, index: number): TeamMember => ({
  id: member.id || `imported-member-${index + 1}`,
  pokemonId: member.pokemonId,
  formId: member.formId,
  abilityId: member.abilityId,
  itemId: member.itemId,
  moveIds: Array.isArray(member.moveIds) ? member.moveIds.filter(Boolean) : [],
  nature: member.nature || '爽朗',
  statPoints: member.statPoints ?? {},
  level: Number.isFinite(member.level) && member.level ? Number(member.level) : 50,
  notes: member.notes || '',
  legalityStatus: member.legalityStatus || 'needs-review',
});

const normalizeTeam = (team: RawTeam, index: number): Team => {
  if (!team.ruleSetId || !team.dataVersionId) {
    throw new Error(`第 ${index + 1} 支队伍缺少 ruleSetId 或 dataVersionId。`);
  }
  if (!team.id || !team.name || !Array.isArray(team.members)) {
    throw new Error(`第 ${index + 1} 支队伍缺少 id、name 或 members。`);
  }

  return {
    id: team.id,
    name: team.name,
    ruleSetId: team.ruleSetId,
    dataVersionId: team.dataVersionId,
    members: team.members.map(migrateMember),
    createdAt: team.createdAt || now(),
    updatedAt: team.updatedAt || now(),
    notes: team.notes || '',
  };
};

const migrateV0Team = (team: RawTeam, index: number): Team => {
  const migrated: RawTeam = {
    ...team,
    id: team.id || `imported-team-${index + 1}`,
    name: team.name || `导入队伍 ${index + 1}`,
    members: Array.isArray(team.members) ? team.members : [],
  };

  return normalizeTeam(migrated, index);
};

export const migrateTeamExportPayload = (payload: RawTeamExportPayload): Team[] => {
  if (!Array.isArray(payload.teams)) {
    throw new Error('未找到 teams 数组。');
  }
  if (payload.teams.length === 0) {
    throw new Error('teams 数组为空。');
  }

  switch (payload.schemaVersion) {
    case 0:
      return payload.teams.map(migrateV0Team);
    case CURRENT_TEAM_EXPORT_SCHEMA_VERSION:
      return payload.teams.map(normalizeTeam);
    default:
      throw new Error(`不支持的 schemaVersion: ${String(payload.schemaVersion)}。`);
  }
};
