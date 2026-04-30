import { Filter, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { abilities, items, moves, pokemon } from '../data';
import { createId } from '../lib/id';
import { evaluateMemberLegality } from '../lib/legality';
import { useAppStore } from '../state/AppContext';
import type { Pokemon, PokemonType } from '../types';
import { Button, Card, Chip, EmptyState, PokemonAvatar, TypeBadge } from '../components/ui';

type DexTab = 'pokemon' | 'moves' | 'items' | 'abilities';
type TypeFilter = { label: string; value: PokemonType };

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
  onOpenSpeed,
  onOpenCalculator,
}: {
  entry: Pokemon;
  onOpenSpeed: (pokemonId: string) => void;
  onOpenCalculator: (pokemonId: string) => void;
}) {
  const { teams, updateMember } = useAppStore();
  const activeTeam = teams[0];
  const addToTeam = async () => {
    if (!activeTeam || activeTeam.members.length >= 6) return;
    const member = {
      id: createId('member'),
      pokemonId: entry.id,
      formId: entry.id,
      abilityId: entry.abilities[0],
      itemId: undefined,
      moveIds: entry.learnableMoves.slice(0, 2),
      nature: '爽朗',
      statPoints: { speed: 32 },
      level: 50,
      notes: '从图鉴加入。',
      legalityStatus: 'needs-review' as const,
    };
    const result = evaluateMemberLegality(member, activeTeam);
    await updateMember(activeTeam.id, { ...member, legalityStatus: result.status });
  };

  return (
    <Card>
      <div className="mb-3 flex gap-3">
        <PokemonAvatar iconRef={entry.iconRef} label={`${entry.chineseName} ${entry.englishName}`} size="lg" />
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{entry.chineseName} {entry.englishName}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {entry.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
            {entry.canMega && <Chip className="h-5 items-center leading-none">Mega 可用</Chip>}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-1 text-[11px] text-textSecondary">特性</p>
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {entry.abilities.map((id) => (
            <Chip key={id}>{abilities.find((ability) => ability.id === id)?.chineseName ?? id}</Chip>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-1 text-[11px] text-textSecondary">招式</p>
        <div className="flex flex-wrap gap-1">
          {entry.learnableMoves.map((id) => (
            <Chip key={id}>{moves.find((move) => move.id === id)?.chineseName ?? id}</Chip>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button variant="ghost" onClick={addToTeam}>
          <Plus size={13} />
          加入队伍
        </Button>
        <Button variant="ghost" onClick={() => onOpenSpeed(entry.id)}>
          → 速度线
        </Button>
        <Button variant="ghost" onClick={() => onOpenCalculator(entry.id)}>
          → 计算
        </Button>
      </div>
      <p className="mt-3 text-[11px] text-textMuted">当前仅展示规则内 seed data，真实完整列表仍需数据源复核。</p>
    </Card>
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
  const [selectedPokemonId, setSelectedPokemonId] = useState('garchomp');

  const filteredPokemon = useMemo(
    () =>
      pokemon.filter((entry) => {
        const matchesQuery = `${entry.chineseName} ${entry.englishName}`.toLowerCase().includes(query.toLowerCase());
        const matchesType = selectedTypes.length === 0 || selectedTypes.every((type) => entry.types.includes(type));
        return matchesQuery && matchesType;
      }),
    [query, selectedTypes],
  );
  const selected = filteredPokemon.find((entry) => entry.id === selectedPokemonId) ?? filteredPokemon[0] ?? pokemon.find((entry) => entry.id === selectedPokemonId) ?? pokemon[0];
  const typeFilterLabel = selectedTypes.length === 0 ? '属性：全部' : `属性：${selectedTypes.map((type) => typeLabelByValue[type]).join(' + ')}`;

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
              <Button variant="ghost" onClick={() => setSelectedTypes([])}>
                清空
              </Button>
            )}
          </div>
          {filteredPokemon.length === 0 ? (
            <EmptyState title="没有找到相关内容" action={<Button onClick={() => { setQuery(''); setSelectedTypes([]); }}>清除筛选</Button>} />
          ) : (
            <div className="space-y-2">
              {filteredPokemon.map((entry) => (
                <button key={entry.id} className="w-full" onClick={() => setSelectedPokemonId(entry.id)}>
                  <Card className={`flex items-center gap-3 text-left ${entry.id === selected.id ? 'border-accent/70' : ''}`}>
                    <PokemonAvatar iconRef={entry.iconRef} label={`${entry.chineseName} ${entry.englishName}`} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{entry.chineseName} {entry.englishName}</h3>
                      <p className="text-xs text-textSecondary">{entry.canMega ? 'Mega 可用' : '当前规则候选'}</p>
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
          <PokemonDetail entry={selected} onOpenSpeed={onOpenSpeed} onOpenCalculator={onOpenCalculator} />
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
        <div className="space-y-2">
          {moves.map((move) => (
            <Card key={move.id} className="flex items-center gap-3">
              <TypeBadge type={move.type} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{move.chineseName} {move.englishName}</h3>
                <p className="text-xs text-textSecondary">威力 {move.power ?? '-'} · 命中 {move.accuracy ?? '-'} · PP {move.pp}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'items' && (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-elevated text-xs text-accent">{item.isMegaStone ? 'M' : 'I'}</div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{item.chineseName}</h3>
                <p className="truncate text-xs text-textSecondary">{item.effectSummary}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'abilities' && (
        <div className="space-y-2">
          {abilities.map((ability) => (
            <Card key={ability.id}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{ability.chineseName} {ability.englishName}</h3>
                <span className="text-[11px] text-textMuted">{ability.pokemonIds.length}个 Pokémon</span>
              </div>
              <p className="mt-1 text-xs text-textSecondary">{ability.effectSummary}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
