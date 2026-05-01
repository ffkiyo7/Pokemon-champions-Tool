import { ChevronLeft, Filter, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { abilities, moves } from '../data';
import { attackingTypes, defensiveMatchupMultiplier, statRows } from '../lib/calculations';
import { currentRuleMovesForPokemon, currentRuleSelectableItems } from '../lib/currentRuleCatalog';
import { createId } from '../lib/id';
import { evaluateMemberLegality } from '../lib/legality';
import { getDexFormEntries, type DexFormEntry } from '../lib/pokemonForms';
import { useAppStore } from '../state/AppContext';
import type { PokemonType } from '../types';
import { Button, Card, EmptyState, PokemonAvatar, TypeBadge } from '../components/ui';

type DexTab = 'pokemon' | 'moves' | 'items' | 'abilities';
type TypeFilter = { label: string; value: PokemonType };
type SecondaryNameMode = 'english' | 'japanese';

const typeFilters: TypeFilter[] = [
  { label: '一般', value: 'Normal' },
  { label: '火', value: 'Fire' },
  { label: '水', value: 'Water' },
  { label: '电', value: 'Electric' },
  { label: '草', value: 'Grass' },
  { label: '冰', value: 'Ice' },
  { label: '格斗', value: 'Fighting' },
  { label: '毒', value: 'Poison' },
  { label: '地面', value: 'Ground' },
  { label: '飞行', value: 'Flying' },
  { label: '超能力', value: 'Psychic' },
  { label: '虫', value: 'Bug' },
  { label: '岩石', value: 'Rock' },
  { label: '幽灵', value: 'Ghost' },
  { label: '龙', value: 'Dragon' },
  { label: '恶', value: 'Dark' },
  { label: '钢', value: 'Steel' },
  { label: '妖精', value: 'Fairy' },
];

const typeLabelByValue = Object.fromEntries(typeFilters.map((filter) => [filter.value, filter.label])) as Record<PokemonType, string>;
const categoryLabels = { Physical: '物理', Special: '特殊', Status: '变化' };

const statLabels = {
  HP: 'HP',
  '攻': '攻击',
  '防': '防御',
  '特攻': '特攻',
  '特防': '特防',
  '速': '速度',
} as const;

function TypeFilterSheet({
  selectedTypes,
  onToggle,
  onClear,
  onClose,
}: {
  selectedTypes: PokemonType[];
  onToggle: (type: PokemonType) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] rounded-t-2xl border border-border bg-card p-4 shadow-none">
      <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-disabled" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">属性筛选</h3>
          <p className="text-xs text-textSecondary">最多选择 2 个属性，双选时只显示同时具备两种属性的 Pokémon</p>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-lg text-textSecondary" title="关闭属性筛选" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {typeFilters.map((filter) => {
          const active = selectedTypes.includes(filter.value);
          const disabled = !active && selectedTypes.length >= 2;
          return (
            <button
              key={filter.value}
              aria-label={`${filter.label}属性`}
              aria-pressed={active}
              className={`flex min-h-10 items-center justify-center rounded-lg border p-2 text-xs active:scale-[0.99] ${
                active ? 'border-accent bg-accent/15 text-accent' : 'border-border bg-secondary text-textSecondary'
              } disabled:cursor-not-allowed disabled:opacity-45`}
              disabled={disabled}
              type="button"
              onClick={() => onToggle(filter.value)}
            >
              <TypeBadge type={filter.value} size="sm" />
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onClear} disabled={selectedTypes.length === 0}>
          清空
        </Button>
        <Button onClick={onClose}>完成</Button>
      </div>
    </div>
  );
}

function PokemonDetail({
  entry,
  onBack,
  onOpenSpeed,
  onOpenCalculator,
}: {
  entry: DexFormEntry;
  onBack: () => void;
  onOpenSpeed: (pokemonId: string) => void;
  onOpenCalculator: (pokemonId: string) => void;
}) {
  const { teams, updateMember } = useAppStore();
  const [secondaryNameMode, setSecondaryNameMode] = useState<SecondaryNameMode>('english');
  const [expandedAbilityIds, setExpandedAbilityIds] = useState<string[]>([]);
  const activeTeam = teams[0];
  const entryAbilities = entry.abilities
    .map((id) => abilities.find((ability) => ability.id === id))
    .filter(Boolean) as typeof abilities;
  const entryMoves = currentRuleMovesForPokemon(entry.basePokemon.id);
  const weaknesses = attackingTypes
    .map((type) => ({ type, multiplier: defensiveMatchupMultiplier(type, entry.types) }))
    .filter((matchup) => matchup.multiplier > 1);
  const resistances = attackingTypes
    .map((type) => ({ type, multiplier: defensiveMatchupMultiplier(type, entry.types) }))
    .filter((matchup) => matchup.multiplier > 0 && matchup.multiplier < 1);
  const immunities = attackingTypes.filter((type) => defensiveMatchupMultiplier(type, entry.types) === 0);

  const addToTeam = async () => {
    if (!activeTeam || activeTeam.members.length >= 6) return;
    const member = {
      id: createId('member'),
      pokemonId: entry.basePokemon.id,
      formId: entry.id,
      abilityId: entry.abilities[0],
      itemId: entry.requiredItemId,
      moveIds: currentRuleMovesForPokemon(entry.basePokemon.id).slice(0, 2).map((move) => move.id),
      nature: '爽朗',
      statPoints: { speed: 32 },
      level: 50,
      notes: '从图鉴加入。',
      legalityStatus: 'needs-review' as const,
    };
    const result = evaluateMemberLegality(member, activeTeam);
    await updateMember(activeTeam.id, { ...member, legalityStatus: result.status });
  };
  const toggleAbility = (abilityId: string) => {
    setExpandedAbilityIds((current) => (current.includes(abilityId) ? current.filter((id) => id !== abilityId) : [...current, abilityId]));
  };
  const secondaryName = secondaryNameMode === 'english' ? entry.englishName : entry.japaneseName;

  return (
    <div className="space-y-3">
      <Button variant="ghost" onClick={onBack}>
        <ChevronLeft size={14} />
        返回图鉴列表
      </Button>
      <Card>
        <div className="mb-3 flex gap-3">
          <PokemonAvatar iconRef={entry.iconRef} label={entry.chineseName} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{entry.chineseName}</h3>
            <div className="mt-1 flex items-center gap-2">
              <p className="truncate text-xs text-textSecondary">{secondaryName}</p>
              <button
                className="rounded border border-border px-2 py-1 text-[11px] text-textSecondary"
                type="button"
                onClick={() => setSecondaryNameMode((mode) => (mode === 'english' ? 'japanese' : 'english'))}
              >
                {secondaryNameMode === 'english' ? '切日文' : '切英文'}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1">
            {entry.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-textSecondary">特性</p>
          {entryAbilities.map((ability) => {
            const expanded = expandedAbilityIds.includes(ability.id);
            return (
              <button key={ability.id} className="w-full rounded-lg border border-border bg-secondary p-2 text-left" type="button" onClick={() => toggleAbility(ability.id)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{ability.chineseName}</span>
                  <span className="text-[11px] text-textMuted">{expanded ? '收起' : '展开'}</span>
                </div>
                {expanded && <p className="mt-1 text-xs text-textSecondary">{ability.effectSummary}</p>}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] text-textSecondary">种族值</p>
          <div className="space-y-1.5">
            {statRows(entry.baseStats).map(([label, value]) => (
              <div key={label} className="grid grid-cols-[42px_34px_1fr] items-center gap-2 text-[11px]">
                <span className="text-textSecondary">{statLabels[label]}</span>
                <span className="font-semibold text-textPrimary">{value}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-border">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (value / 180) * 100)}%` }} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-textSecondary">当前规则可学会招式</p>
            <span className="text-[11px] text-warning">示例待补齐</span>
          </div>
          <div className="space-y-2">
            {entryMoves.map((move) => (
              <div key={move.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-border bg-secondary p-2">
                <TypeBadge type={move.type} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{move.chineseName}</p>
                  <p className="text-[11px] text-textMuted">{categoryLabels[move.category]} · {move.targetScope}</p>
                </div>
                <p className="text-right text-[11px] text-textSecondary">
                  威力 {move.power ?? '-'}<br />
                  命中 {move.accuracy ?? '-'}
                </p>
              </div>
            ))}
            {entryMoves.length === 0 && <p className="rounded-lg bg-secondary p-2 text-xs text-textSecondary">暂无 seed 招式数据。</p>}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] text-textSecondary">属性相克</p>
          <div className="space-y-2">
            {[
              ['弱点', weaknesses],
              ['抗性', resistances],
              ['免疫', immunities.map((type) => ({ type, multiplier: 0 }))],
            ].map(([label, rows]) => (
              <div key={label as string} className="rounded-lg border border-border bg-secondary p-2">
                <p className="mb-1 text-[11px] text-textMuted">{label as string}</p>
                <div className="flex flex-wrap gap-1">
                  {(rows as Array<{ type: PokemonType; multiplier: number }>).length > 0 ? (
                    (rows as Array<{ type: PokemonType; multiplier: number }>).map(({ type, multiplier }) => (
                      <span key={`${label}-${type}`} className="inline-flex items-center gap-1">
                        <TypeBadge type={type} size="sm" />
                        {multiplier !== 0 && <span className="text-[10px] text-textMuted">×{multiplier}</span>}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-textMuted">无</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button variant="ghost" onClick={addToTeam}>
            <Plus size={13} />
            加入队伍
          </Button>
          <Button variant="ghost" onClick={() => onOpenSpeed(entry.basePokemon.id)}>
            → 速度线
          </Button>
          <Button variant="ghost" onClick={() => onOpenCalculator(entry.basePokemon.id)}>
            → 计算
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-textMuted">当前仅展示规则内 seed data，真实完整列表仍需数据源复核。</p>
      </Card>
    </div>
  );
}

export function DexPage({
  onOpenSpeed,
  onOpenCalculator,
}: {
  onOpenSpeed: (pokemonId: string) => void;
  onOpenCalculator: (pokemonId: string) => void;
}) {
  const [tab, setTab] = useState<DexTab>('pokemon');
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [detailPokemonId, setDetailPokemonId] = useState<string | null>(null);
  const dexEntries = useMemo(() => getDexFormEntries(), []);

  const filteredPokemon = useMemo(
    () =>
      dexEntries.filter((entry) => {
        const matchesQuery = `${entry.chineseName} ${entry.englishName} ${entry.japaneseName}`.toLowerCase().includes(query.toLowerCase());
        const matchesType = selectedTypes.length === 0 || selectedTypes.every((type) => entry.types.includes(type));
        return matchesQuery && matchesType;
      }),
    [dexEntries, query, selectedTypes],
  );
  const detailPokemon = detailPokemonId ? dexEntries.find((entry) => entry.id === detailPokemonId) ?? null : null;
  const typeFilterLabel = selectedTypes.length === 0 ? '属性：全部' : `属性：${selectedTypes.map((type) => typeLabelByValue[type]).join(' + ')}`;
  const matchesSearch = (...values: Array<string | number | undefined>) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return values.some((value) => String(value ?? '').toLowerCase().includes(normalized));
  };
  const filteredMoves = useMemo(
    () => moves.filter((move) => matchesSearch(move.chineseName, move.englishName, move.type, move.category, move.effectSummary)),
    [query],
  );
  const selectableItems = useMemo(() => currentRuleSelectableItems(), []);
  const filteredItems = useMemo(
    () => selectableItems.filter((item) => matchesSearch(item.chineseName, item.englishName, item.effectSummary)),
    [query, selectableItems],
  );
  const filteredAbilities = useMemo(
    () => abilities.filter((ability) => matchesSearch(ability.chineseName, ability.englishName, ability.effectSummary)),
    [query],
  );

  const toggleTypeFilter = (type: PokemonType) => {
    setSelectedTypes((current) => {
      if (current.includes(type)) return current.filter((item) => item !== type);
      if (current.length >= 2) return current;
      return [...current, type];
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">规则内图鉴</h2>
        <p className="text-xs text-textSecondary">Pokémon / 招式 / 道具 / 特性 · 当前规则模拟数据</p>
      </div>

      <div className="flex gap-4 border-b border-divider text-sm">
        {[
          ['pokemon', 'Pokémon'],
          ['moves', '招式'],
          ['items', '道具'],
          ['abilities', '特性'],
        ].map(([id, label]) => (
          <button key={id} className={`pb-2 ${tab === id ? 'border-b-2 border-accent text-accent' : 'text-textMuted'}`} onClick={() => setTab(id as DexTab)}>
            {label}
          </button>
        ))}
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

      {tab === 'pokemon' && (
        <>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setShowTypeFilter(true)}>
              <Filter size={13} />
              {typeFilterLabel}
            </Button>
            {selectedTypes.length > 0 && (
              <Button variant="ghost" onClick={() => { setSelectedTypes([]); setDetailPokemonId(null); }}>
                清空
              </Button>
            )}
          </div>
          {filteredPokemon.length === 0 ? (
            <EmptyState title="没有找到相关内容" action={<Button onClick={() => { setQuery(''); setSelectedTypes([]); setDetailPokemonId(null); }}>清除筛选</Button>} />
          ) : detailPokemon ? (
            <PokemonDetail
              entry={detailPokemon}
              onBack={() => setDetailPokemonId(null)}
              onOpenSpeed={onOpenSpeed}
              onOpenCalculator={onOpenCalculator}
            />
          ) : (
            <div className="space-y-2">
              {filteredPokemon.map((entry) => (
                <button key={entry.id} className="w-full" onClick={() => setDetailPokemonId(entry.id)}>
                  <Card className="flex items-center gap-3 text-left">
                    <PokemonAvatar iconRef={entry.iconRef} label={entry.chineseName} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{entry.chineseName}</h3>
                      <p className="text-xs text-textSecondary">#{entry.basePokemon.nationalDexNo}</p>
                    </div>
                    <div className="flex gap-1">
                      {entry.types.map((type) => (
                        <TypeBadge key={type} type={type} />
                      ))}
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}
          {showTypeFilter && (
            <TypeFilterSheet
              selectedTypes={selectedTypes}
              onToggle={toggleTypeFilter}
              onClear={() => setSelectedTypes([])}
              onClose={() => setShowTypeFilter(false)}
            />
          )}
        </>
      )}

      {tab === 'moves' && (
        filteredMoves.length === 0 ? (
          <EmptyState title="没有找到相关招式" action={<Button onClick={() => setQuery('')}>清除搜索</Button>} />
        ) : (
        <div className="space-y-2">
          {filteredMoves.map((move) => (
            <Card key={move.id} className="flex items-center gap-3">
              <TypeBadge type={move.type} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{move.chineseName} {move.englishName}</h3>
                <p className="text-xs text-textSecondary">威力 {move.power ?? '-'} · 命中 {move.accuracy ?? '-'} · PP {move.pp}</p>
              </div>
            </Card>
          ))}
        </div>
        )
      )}

      {tab === 'items' && (
        filteredItems.length === 0 ? (
          <EmptyState title="没有找到相关道具" action={<Button onClick={() => setQuery('')}>清除搜索</Button>} />
        ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Card key={item.id} className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-elevated text-xs text-accent">{item.isMegaStone ? 'M' : 'I'}</div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{item.chineseName}</h3>
                <p className="truncate text-xs text-textSecondary">{item.effectSummary}</p>
              </div>
            </Card>
          ))}
        </div>
        )
      )}

      {tab === 'abilities' && (
        filteredAbilities.length === 0 ? (
          <EmptyState title="没有找到相关特性" action={<Button onClick={() => setQuery('')}>清除搜索</Button>} />
        ) : (
        <div className="space-y-2">
          {filteredAbilities.map((ability) => (
            <Card key={ability.id}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{ability.chineseName} {ability.englishName}</h3>
                <span className="text-[11px] text-textMuted">{ability.pokemonIds.length}个 Pokémon</span>
              </div>
              <p className="mt-1 text-xs text-textSecondary">{ability.effectSummary}</p>
            </Card>
          ))}
        </div>
        )
      )}
    </div>
  );
}
