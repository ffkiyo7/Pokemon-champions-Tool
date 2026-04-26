import { ChevronRight, Plus, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { abilities, items, moves, pokemon } from '../data';
import { memberLabel, statRows, teamAnalysis } from '../lib/calculations';
import { evaluateMemberLegality } from '../lib/legality';
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
  onEdit,
  onOpenCalculator,
  onOpenSpeed,
}: {
  team: Team;
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
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
        <button className="mt-1 grid h-8 w-8 place-items-center rounded-lg text-textMuted" title="编辑成员" onClick={() => onEdit(member)}>
          <ChevronRight size={16} />
        </button>
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[11px] uppercase tracking-wide text-textMuted">{children}</label>;
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  min = 0,
  max = 252,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none"
        max={max}
        min={min}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function MemberEditor({
  team,
  member,
  onClose,
  onSave,
  onDelete,
}: {
  team: Team;
  member: TeamMember;
  onClose: () => void;
  onSave: (member: TeamMember) => Promise<void>;
  onDelete: (memberId: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TeamMember>(member);
  const selectedPokemon = pokemon.find((entry) => entry.id === draft.pokemonId) ?? pokemon[0];
  const availableMoves = moves.filter((move) => move.learnableByPokemonIds.includes(selectedPokemon.id));
  const availableAbilities = abilities.filter((ability) => selectedPokemon.abilities.includes(ability.id));
  const legality = useMemo(() => evaluateMemberLegality(draft, team), [draft, team]);

  const updateDraft = (patch: Partial<TeamMember>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const updateStatPoint = (key: keyof TeamMember['statPoints'], value: number) => {
    setDraft((current) => ({
      ...current,
      statPoints: {
        ...current.statPoints,
        [key]: Math.max(0, Math.min(252, value || 0)),
      },
    }));
  };

  const updateMoveSlot = (slot: number, moveId: string) => {
    const nextMoves = [...draft.moveIds];
    if (moveId) nextMoves[slot] = moveId;
    else nextMoves.splice(slot, 1);
    updateDraft({ moveIds: Array.from(new Set(nextMoves.filter(Boolean))).slice(0, 4) });
  };

  const save = async () => {
    await onSave({ ...draft, legalityStatus: legality.status });
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] rounded-t-2xl border border-border bg-card p-4 shadow-none">
      <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-disabled" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">编辑成员</h3>
          <p className="text-xs text-textSecondary">字段级校验会在保存前实时更新</p>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-lg text-textSecondary" title="关闭" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1">
        <SelectField
          label="Pokemon"
          value={selectedPokemon.id}
          onChange={(pokemonId) => {
            const nextPokemon = pokemon.find((entry) => entry.id === pokemonId) ?? pokemon[0];
            updateDraft({
              pokemonId,
              formId: pokemonId,
              abilityId: nextPokemon.abilities[0],
              moveIds: nextPokemon.learnableMoves.slice(0, 2),
            });
          }}
        >
          {pokemon.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.chineseName} {entry.englishName}
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-2">
          <SelectField label="特性" value={draft.abilityId ?? ''} onChange={(abilityId) => updateDraft({ abilityId })}>
            <option value="">未选择</option>
            {availableAbilities.map((ability) => (
              <option key={ability.id} value={ability.id}>
                {ability.chineseName}
              </option>
            ))}
          </SelectField>
          <SelectField label="道具" value={draft.itemId ?? ''} onChange={(itemId) => updateDraft({ itemId: itemId || undefined })}>
            <option value="">未选择</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.chineseName}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SelectField label="性格" value={draft.nature} onChange={(nature) => updateDraft({ nature })}>
            {['爽朗', '胆小', '固执', '慎重', '冷静', '怕慢(+速)'].map((nature) => (
              <option key={nature} value={nature}>
                {nature}
              </option>
            ))}
          </SelectField>
          <NumberField label="等级" max={100} min={1} value={draft.level} onChange={(level) => updateDraft({ level })} />
        </div>

        <div>
          <FieldLabel>招式</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((slot) => (
              <select
                key={slot}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none"
                value={draft.moveIds[slot] ?? ''}
                onChange={(event) => updateMoveSlot(slot, event.target.value)}
              >
                <option value="">空招式位</option>
                {availableMoves.map((move) => (
                  <option key={move.id} value={move.id}>
                    {move.chineseName}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <NumberField label="HP SP" value={draft.statPoints.hp ?? 0} onChange={(value) => updateStatPoint('hp', value)} />
          <NumberField label="攻击 SP" value={draft.statPoints.attack ?? 0} onChange={(value) => updateStatPoint('attack', value)} />
          <NumberField label="速度 SP" value={draft.statPoints.speed ?? 0} onChange={(value) => updateStatPoint('speed', value)} />
        </div>

        <div>
          <FieldLabel>备注</FieldLabel>
          <textarea
            className="min-h-20 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none"
            value={draft.notes}
            onChange={(event) => updateDraft({ notes: event.target.value })}
          />
        </div>

        <Card className="bg-secondary">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">校验结果</p>
            <Badge status={legality.status}>{legality.status === 'illegal' ? '非法' : legality.status === 'needs-review' ? '需复核' : legality.status === 'missing-config' ? '缺少配置' : '合法'}</Badge>
          </div>
          {legality.issues.length === 0 ? (
            <p className="text-xs text-success">当前字段未发现问题。</p>
          ) : (
            <div className="space-y-1">
              {legality.issues.map((issue) => (
                <p key={`${issue.code}-${issue.message}`} className={`text-xs ${issue.severity === 'error' ? 'text-danger' : 'text-warning'}`}>
                  {issue.message}
                </p>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_1fr_1.4fr] gap-2">
        <Button variant="danger" onClick={() => onDelete(member.id).then(onClose)}>
          <Trash2 size={14} />
          删除
        </Button>
        <Button variant="ghost" onClick={onClose}>
          取消
        </Button>
        <Button onClick={save}>
          <Save size={14} />
          保存
        </Button>
      </div>
    </div>
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
  const { teams, addTeam, deleteTeam, saveTeam, updateMember } = useAppStore();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const activeTeam = teams[0];
  const editingMember = activeTeam?.members.find((member) => member.id === editingMemberId);

  const addMember = async () => {
    if (!activeTeam || activeTeam.members.length >= 6) return;
    const entry = pokemon[activeTeam.members.length % pokemon.length];
    const member: TeamMember = {
      ...blankMember(),
      pokemonId: entry.id,
      abilityId: entry.abilities[0],
      itemId: activeTeam.members.length === 0 ? 'clear-amulet' : 'assault-vest',
      moveIds: entry.learnableMoves.slice(0, 2),
      notes: '由 MVP 快速添加生成，可继续编辑。',
    };
    const result = evaluateMemberLegality(member, activeTeam);
    await updateMember(activeTeam.id, { ...member, legalityStatus: result.status });
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
              <MemberCard
                key={member.id}
                team={activeTeam}
                member={member}
                onEdit={(nextMember) => setEditingMemberId(nextMember.id)}
                onOpenCalculator={onOpenCalculator}
                onOpenSpeed={onOpenSpeed}
              />
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
          {editingMember && (
            <MemberEditor
              team={activeTeam}
              member={editingMember}
              onClose={() => setEditingMemberId(null)}
              onDelete={async (memberId) => {
                await saveTeam({ ...activeTeam, members: activeTeam.members.filter((member) => member.id !== memberId) });
              }}
              onSave={(member) => updateMember(activeTeam.id, member)}
            />
          )}
        </>
      )}
    </div>
  );
}
