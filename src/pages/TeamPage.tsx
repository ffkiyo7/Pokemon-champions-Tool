import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { abilities, items, moves, pokemon } from '../data/mockData';
import { memberLabel, statRows, teamAnalysis } from '../lib/calculations';
import { useAppStore } from '../state/AppContext';
import type { Team, TeamMember } from '../types';
import { RuleSummary, SyncStrip } from '../components/RuleSummary';
import { Badge, Button, Card, Chip, EmptyState } from '../components/ui';

const blankMember = (): TeamMember => ({
  id: crypto.randomUUID(),
  moveIds: [],
  nature: '爽朗',
  statPoints: { speed: 252 },
  level: 50,
  notes: '',
  legalityStatus: 'missing-config',
});

function MemberCard({
  team,
  member,
  onOpenCalculator,
  onOpenSpeed,
}: {
  team: Team;
  member: TeamMember;
  onOpenCalculator: (memberId: string) => void;
  onOpenSpeed: (pokemonId: string) => void;
}) {
  const entry = pokemon.find((item) => item.id === member.pokemonId);
  const item = items.find((candidate) => candidate.id === member.itemId);
  const ability = abilities.find((candidate) => candidate.id === member.abilityId);
  const learnedMoves = member.moveIds.map((id) => moves.find((move) => move.id === id)?.chineseName).filter(Boolean);

  return (
    <Card className="bg-card">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-elevated text-sm font-bold text-accent">{entry?.iconRef ?? '?'}</div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{memberLabel(member)}</h3>
            <Badge status={member.legalityStatus}>{member.legalityStatus === 'legal' ? '合法' : member.legalityStatus === 'needs-review' ? '需复核' : '缺少配置'}</Badge>
          </div>
          <p className="text-xs text-textSecondary">
            {item?.chineseName ?? '未选道具'} · {ability?.chineseName ?? '未选特性'} · {member.nature} · Lv.{member.level}
          </p>
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
            {(learnedMoves.length ? learnedMoves : ['未配置招式']).map((move) => (
              <Chip key={move}>{move}</Chip>
            ))}
          </div>
        </div>
        <ChevronRight className="mt-2 text-textMuted" size={16} />
      </div>
      {entry && (
        <>
          <div className="mt-3 space-y-1.5 rounded-lg bg-elevated p-2">
            {statRows(entry.baseStats).map(([label, value]) => (
              <div key={label} className="grid grid-cols-[34px_1fr_32px] items-center gap-2 text-[11px]">
                <span className="text-textSecondary">{label}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-border">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (value / 180) * 100)}%` }} />
                </span>
                <span className="text-right text-textPrimary">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" onClick={() => onOpenCalculator(member.id)}>
              → 伤害计算
            </Button>
            <Button variant="ghost" onClick={() => onOpenSpeed(entry.id)}>
              → 速度线
            </Button>
          </div>
        </>
      )}
      <p className="mt-2 text-[11px] text-textMuted">数据版本：{team.dataVersionId}</p>
    </Card>
  );
}

export function TeamPage({
  onOpenRule,
  onOpenCalculator,
  onOpenSpeed,
}: {
  onOpenRule: () => void;
  onOpenCalculator: (memberId: string) => void;
  onOpenSpeed: (pokemonId: string) => void;
}) {
  const { teams, addTeam, deleteTeam, updateMember } = useAppStore();
  const activeTeam = teams[0];

  const addMember = async () => {
    if (!activeTeam || activeTeam.members.length >= 6) return;
    const entry = pokemon[activeTeam.members.length % pokemon.length];
    await updateMember(activeTeam.id, {
      ...blankMember(),
      pokemonId: entry.id,
      abilityId: entry.abilities[0],
      itemId: activeTeam.members.length === 0 ? 'clear-amulet' : 'assault-vest',
      moveIds: entry.learnableMoves.slice(0, 2),
      legalityStatus: activeTeam.members.length < 2 ? 'legal' : 'needs-review',
      notes: '由 MVP 快速添加生成，可继续编辑。',
    });
  };

  return (
    <div className="space-y-3">
      <SyncStrip />
      <RuleSummary onOpen={onOpenRule} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">我的队伍</h2>
          <p className="text-xs text-textSecondary">本地保存 · 无账号依赖</p>
        </div>
        <Button onClick={addTeam}>
          <Plus size={14} />
          新建
        </Button>
      </div>

      {teams.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {teams.map((team, index) => (
            <Chip key={team.id} active={index === 0}>
              {team.name}
            </Chip>
          ))}
        </div>
      )}

      {!activeTeam ? (
        <EmptyState title="还没有队伍" action={<Button onClick={addTeam}>新建第一支队伍</Button>} />
      ) : (
        <>
          <Card className="bg-secondary">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{activeTeam.name}</h3>
                <p className="text-xs text-textSecondary">{activeTeam.members.length}/6 成员 · {activeTeam.notes || '未填写队伍备注'}</p>
              </div>
              <button className="text-danger" title="删除队伍" onClick={() => deleteTeam(activeTeam.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </Card>

          <div className="space-y-2">
            {activeTeam.members.map((member) => (
              <MemberCard key={member.id} team={activeTeam} member={member} onOpenCalculator={onOpenCalculator} onOpenSpeed={onOpenSpeed} />
            ))}
          </div>

          {activeTeam.members.length < 6 && (
            <Button variant="ghost" className="w-full" onClick={addMember}>
              <Plus size={14} />
              添加 Pokémon
            </Button>
          )}

          <Card className="sticky bottom-[88px] z-10 bg-secondary">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-textMuted">队伍基础分析</p>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {teamAnalysis(activeTeam).map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
