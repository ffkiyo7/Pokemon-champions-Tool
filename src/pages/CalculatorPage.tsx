import { AlertTriangle, Calculator, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { moves, pokemon } from '../data';
import { memberLabel } from '../lib/calculations';
import { useAppStore } from '../state/AppContext';
import type { Pokemon, TeamMember } from '../types';
import { Badge, Card, PokemonAvatar, TypeBadge } from '../components/ui';

type CalcSide = 'attacker' | 'defender';
type BattleTypeOption = 'singles' | 'doubles';

const weatherOptions = ['无天气', '晴天', '雨天', '沙暴', '雪天'];
const terrainOptions = ['无场地', '青草场地', '电气场地', '精神场地', '薄雾场地'];
const stageOptions = ['0', '+1', '+2', '-1', '-2'];
type MegaOption = { value: string; label: string; disabled?: boolean };

const isSpreadMove = (targetScope: string, battleType: BattleTypeOption) =>
  battleType === 'doubles' && ['对手全体', '全体邻近目标', '全体'].some((scope) => targetScope.includes(scope));

const makeManualMember = (entry: Pokemon) => ({
  id: `manual-${entry.id}`,
  pokemonId: entry.id,
  abilityId: entry.abilities[0],
  moveIds: entry.learnableMoves.slice(0, 2),
  nature: '爽朗',
  statPoints: { speed: 32 },
  level: 50,
  notes: '手动图鉴配置。',
  legalityStatus: 'needs-review' as const,
});

export function CalculatorPage({
  selectedMemberId,
  onPickMember,
}: {
  selectedMemberId?: string;
  onPickMember: (memberId: string) => void;
}) {
  const { teams } = useAppStore();
  const members = teams.flatMap((team) => team.members.map((member) => ({ team, member })));
  const firstPokemonId = pokemon[0]?.id ?? '';
  const [activeSide, setActiveSide] = useState<CalcSide>('attacker');
  const [attackerPokemonId, setAttackerPokemonId] = useState(members[0]?.member.pokemonId ?? selectedMemberId ?? firstPokemonId);
  const [defenderPokemonId, setDefenderPokemonId] = useState(members[1]?.member.pokemonId ?? pokemon[1]?.id ?? firstPokemonId);
  const [query, setQuery] = useState('');
  const [selectedMoveId, setSelectedMoveId] = useState<string | undefined>();
  const [battleType, setBattleType] = useState<BattleTypeOption>('doubles');
  const [weather, setWeather] = useState(weatherOptions[0]);
  const [terrain, setTerrain] = useState(terrainOptions[0]);
  const [attackStage, setAttackStage] = useState('0');
  const [megaState, setMegaState] = useState('none');

  useEffect(() => {
    if (!selectedMemberId) return;
    const memberPokemonId = members.find(({ member }) => member.id === selectedMemberId)?.member.pokemonId;
    const pokemonId = memberPokemonId ?? pokemon.find((entry) => entry.id === selectedMemberId)?.id;
    if (pokemonId) setAttackerPokemonId(pokemonId);
  }, [members, selectedMemberId]);

  const attackerEntry = pokemon.find((entry) => entry.id === attackerPokemonId) ?? pokemon[0];
  const defenderEntry = pokemon.find((entry) => entry.id === defenderPokemonId) ?? pokemon[1] ?? pokemon[0];
  const attackerMember = members.find(({ member }) => member.pokemonId === attackerEntry.id)?.member ?? makeManualMember(attackerEntry);
  const defenderMember = members.find(({ member }) => member.pokemonId === defenderEntry.id)?.member ?? makeManualMember(defenderEntry);
  const availableMoves = moves.filter((entry) => attackerEntry.learnableMoves.includes(entry.id));
  const move =
    moves.find((entry) => entry.id === selectedMoveId && availableMoves.some((available) => available.id === entry.id)) ??
    moves.find((entry) => attackerMember.moveIds.includes(entry.id)) ??
    availableMoves[0] ??
    moves[0];
  const derivedSpreadDamage = isSpreadMove(move.targetScope, battleType);
  const megaOptions = useMemo<MegaOption[]>(() => {
    const options: MegaOption[] = [{ value: 'none', label: '无 Mega' }];
    if (attackerEntry.megaForms.length > 0) {
      options.push(...attackerEntry.megaForms.map((form) => ({ value: `attacker:${form.id}`, label: `进攻方 ${form.name}` })));
    } else {
      options.push({ value: 'attacker:unsupported', label: '进攻方不支持 Mega', disabled: true });
    }
    if (defenderEntry.megaForms.length > 0) {
      options.push(...defenderEntry.megaForms.map((form) => ({ value: `defender:${form.id}`, label: `防守方 ${form.name}` })));
    } else {
      options.push({ value: 'defender:unsupported', label: '防守方不支持 Mega', disabled: true });
    }
    return options;
  }, [attackerEntry, defenderEntry]);

  useEffect(() => {
    if (!megaOptions.some((option) => option.value === megaState && !option.disabled)) {
      setMegaState('none');
    }
  }, [megaOptions, megaState]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPokemon = useMemo(
    () =>
      normalizedQuery
        ? pokemon.filter((entry) => `${entry.chineseName} ${entry.englishName}`.toLowerCase().includes(normalizedQuery))
        : [],
    [normalizedQuery],
  );
  const recommended = useMemo(() => {
    return members
      .map(({ team, member }) => {
        const entry = pokemon.find((candidate) => candidate.id === member.pokemonId);
        return entry ? { teamName: team.name, member, entry } : undefined;
      })
      .filter(Boolean)
      .slice(0, 8) as Array<{ teamName: string; member: TeamMember; entry: Pokemon }>;
  }, [members]);
  const blocked = true;

  const pickPokemon = (pokemonId: string) => {
    if (activeSide === 'attacker') {
      setAttackerPokemonId(pokemonId);
      setSelectedMoveId(undefined);
      onPickMember(members.find(({ member }) => member.pokemonId === pokemonId)?.member.id ?? pokemonId);
    } else {
      setDefenderPokemonId(pokemonId);
    }
  };

  const pickTeamMember = (member: TeamMember) => {
    if (!member.pokemonId) return;
    if (activeSide === 'attacker') {
      setAttackerPokemonId(member.pokemonId);
      setSelectedMoveId(undefined);
      onPickMember(member.id);
    } else {
      setDefenderPokemonId(member.pokemonId);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">伤害计算</h2>
        <p className="text-xs text-textSecondary">攻防双方可从当前规则图鉴选择 · 机制待确认时阻断正式结论</p>
      </div>

      <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
        <button
          className={`rounded-lg border p-3 text-left ${activeSide === 'attacker' ? 'border-accent bg-card' : 'border-border bg-card'}`}
          onClick={() => setActiveSide('attacker')}
        >
          <p className="text-[11px] text-textSecondary">进攻方</p>
          <p className="truncate text-sm font-semibold">{memberLabel(attackerMember)}</p>
          <div className="mt-1 flex gap-1">
            {attackerEntry.types.map((type) => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </button>
        <span className="text-center text-textMuted">→</span>
        <button
          className={`rounded-lg border p-3 text-left ${activeSide === 'defender' ? 'border-accent bg-card' : 'border-border bg-card'}`}
          onClick={() => setActiveSide('defender')}
        >
          <p className="text-[11px] text-textSecondary">防守方</p>
          <p className="truncate text-sm font-semibold">{memberLabel(defenderMember)}</p>
          <div className="mt-1 flex gap-1">
            {defenderEntry.types.map((type) => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </button>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-textSecondary">招式</p>
            <h3 className="font-semibold">{move.chineseName} {move.englishName}</h3>
          </div>
          <Badge status="version">示例数据</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-textMuted">选择招式</span>
            <select
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none"
              value={move.id}
              onChange={(event) => setSelectedMoveId(event.target.value)}
            >
              {availableMoves.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.chineseName} / {entry.englishName}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-textMuted">规则</span>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
              {(['doubles', 'singles'] as const).map((option) => (
                <button
                  key={option}
                  className={`min-h-9 text-xs font-semibold ${battleType === option ? 'bg-accent text-page' : 'bg-secondary text-textSecondary'}`}
                  type="button"
                  onClick={() => setBattleType(option)}
                >
                  {option === 'doubles' ? '双打' : '单打'}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-textMuted">天气</span>
            <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none" value={weather} onChange={(event) => setWeather(event.target.value)}>
              {weatherOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-textMuted">场地</span>
            <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none" value={terrain} onChange={(event) => setTerrain(event.target.value)}>
              {terrainOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-textMuted">进攻能力</span>
            <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none" value={attackStage} onChange={(event) => setAttackStage(event.target.value)}>
              {stageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-textMuted">Mega 状态</span>
            <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none" value={megaState} onChange={(event) => setMegaState(event.target.value)}>
              {megaOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-textMuted">
          <span>威力 {move.power ?? '-'}</span>
          <span>命中 {move.accuracy ?? '-'}</span>
          <span>{move.category}</span>
        </div>
      </Card>

      <Card className="relative min-h-[290px] overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wide text-textSecondary">伤害计算结果</p>
          <Calculator size={18} className="text-accent" />
        </div>
        <div className="text-center">
          <p className="text-[28px] font-bold text-white">68.4% - 80.7%</p>
          <p className="mt-1 text-sm text-textSecondary">103 - 121 伤害 / 对方 HP: 149</p>
        </div>
        <div className="my-5 h-px bg-divider" />
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <span className="rounded-lg border border-border px-2 py-3 text-textMuted">一确</span>
          <span className="rounded-lg bg-accent px-2 py-3 font-semibold text-page">二确 ✓</span>
          <span className="rounded-lg border border-border px-2 py-3 text-textMuted">乱数</span>
        </div>
        <p className="mt-5 text-center text-[11px] text-textMuted">示例数据 · 非真实计算 · 数据 v2.1.0-mock</p>
        {blocked && (
          <div className="absolute inset-x-3 bottom-3 rounded-lg border border-warning/30 bg-reviewBg p-3 text-warning">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <AlertTriangle size={16} />
              该机制待确认，计算暂不可用
            </div>
            <p className="text-xs text-warning/80">Champions 伤害公式、Mega 细节和计算库兼容性未验证前，不输出正式一确/二确/乱数结论。</p>
          </div>
        )}
      </Card>

      <Card className="bg-secondary">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">选择{activeSide === 'attacker' ? '进攻方' : '防守方'}</p>
            <p className="text-xs text-textSecondary">可搜索当前规则图鉴，队伍成员会优先推荐</p>
          </div>
          <Badge status="version">{activeSide === 'attacker' ? '进攻' : '防守'}</Badge>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search size={16} className="text-textMuted" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-textMuted"
            placeholder="搜索名称"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {recommended.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-textMuted">当前队伍推荐</p>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {recommended.map(({ teamName, member, entry }) => (
                <button
                  key={member.id}
                  aria-pressed={activeSide === 'attacker' ? entry.id === attackerEntry.id : entry.id === defenderEntry.id}
                  className={`min-w-[116px] rounded-lg border bg-card p-2 text-left ${
                    activeSide === 'attacker' ? (entry.id === attackerEntry.id ? 'border-accent' : 'border-border') : entry.id === defenderEntry.id ? 'border-accent' : 'border-border'
                  }`}
                  onClick={() => pickTeamMember(member)}
                >
                  <div className="mb-2">
                    <PokemonAvatar iconRef={entry.iconRef} label={entry.chineseName} />
                  </div>
                  <p className="truncate text-xs font-semibold">{entry.chineseName}</p>
                  <p className="truncate text-[11px] text-textMuted">{teamName}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {normalizedQuery && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {filteredPokemon.map((entry) => {
              const active = activeSide === 'attacker' ? entry.id === attackerEntry.id : entry.id === defenderEntry.id;
              return (
                <button
                  key={entry.id}
                  className={`rounded-lg border p-2 text-left ${active ? 'border-accent bg-card' : 'border-border bg-card'}`}
                  onClick={() => pickPokemon(entry.id)}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <PokemonAvatar iconRef={entry.iconRef} label={entry.chineseName} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{entry.chineseName}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {entry.types.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
