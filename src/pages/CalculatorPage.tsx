import { AlertTriangle, Calculator, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { moves, pokemon } from '../data';
import { memberLabel } from '../lib/calculations';
import { useAppStore } from '../state/AppContext';
import type { Pokemon } from '../types';
import { Badge, Button, Card, Chip, TypeBadge } from '../components/ui';

type CalcSide = 'attacker' | 'defender';

const makeManualMember = (entry: Pokemon) => ({
  id: `manual-${entry.id}`,
  pokemonId: entry.id,
  abilityId: entry.abilities[0],
  moveIds: entry.learnableMoves.slice(0, 2),
  nature: '爽朗',
  statPoints: { speed: 252 },
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
  const move = moves.find((entry) => attackerMember.moveIds.includes(entry.id)) ?? moves.find((entry) => attackerEntry.learnableMoves.includes(entry.id)) ?? moves[0];
  const filteredPokemon = useMemo(
    () => pokemon.filter((entry) => `${entry.chineseName} ${entry.englishName} ${entry.types.join(' ')}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const recommended = useMemo(() => {
    const ids = members.map(({ member }) => member.pokemonId).filter(Boolean) as string[];
    return pokemon.filter((entry) => ids.includes(entry.id)).slice(0, 8);
  }, [members]);
  const blocked = true;

  const pickPokemon = (pokemonId: string) => {
    if (activeSide === 'attacker') {
      setAttackerPokemonId(pokemonId);
      onPickMember(members.find(({ member }) => member.pokemonId === pokemonId)?.member.id ?? pokemonId);
    } else {
      setDefenderPokemonId(pokemonId);
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
          <p className="mt-1 text-xs text-textMuted">{attackerEntry.types.join(' / ')}</p>
        </button>
        <span className="text-center text-textMuted">→</span>
        <button
          className={`rounded-lg border p-3 text-left ${activeSide === 'defender' ? 'border-accent bg-card' : 'border-border bg-card'}`}
          onClick={() => setActiveSide('defender')}
        >
          <p className="text-[11px] text-textSecondary">防守方</p>
          <p className="truncate text-sm font-semibold">{memberLabel(defenderMember)}</p>
          <p className="mt-1 text-xs text-textMuted">{defenderEntry.types.join(' / ')}</p>
        </button>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-textSecondary">招式</p>
            <h3 className="font-semibold">{move.chineseName} {move.englishName}</h3>
          </div>
          <Badge status="version">示例数据</Badge>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          <Chip active>双打</Chip>
          <Chip active>分散伤害</Chip>
          <Chip>天气 ▾</Chip>
          <Chip>场地 ▾</Chip>
          <Chip>能力± ▾</Chip>
          <Chip>Mega状态</Chip>
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
            <p className="text-xs text-warning/80">Champions Stat Points、Mega 和计算库兼容性未验证前，不输出正式一确/二确/乱数结论。</p>
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
            placeholder="搜索名称或属性"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {recommended.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-textMuted">当前队伍推荐</p>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {recommended.map((entry) => (
                <button key={entry.id} className="min-w-[116px] rounded-lg border border-border bg-card p-2 text-left" onClick={() => pickPokemon(entry.id)}>
                  <div className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-elevated text-xs font-bold text-accent">{entry.iconRef}</div>
                  <p className="truncate text-xs font-semibold">{entry.chineseName}</p>
                  <p className="text-[11px] text-textMuted">队伍成员</p>
                </button>
              ))}
            </div>
          </div>
        )}

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
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-elevated text-xs font-bold text-accent">{entry.iconRef}</div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{entry.chineseName}</p>
                    <p className="text-[11px] text-textMuted">速度 {entry.baseStats.speed}</p>
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
      </Card>
    </div>
  );
}
