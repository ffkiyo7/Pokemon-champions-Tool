import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { abilities, items, moves, pokemon } from '../data/mockData';
import { statRows } from '../lib/calculations';
import { useAppStore } from '../state/AppContext';
import type { Pokemon } from '../types';
import { Badge, Button, Card, Chip, EmptyState, TypeBadge } from '../components/ui';

type DexTab = 'pokemon' | 'moves' | 'items' | 'abilities';

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
    await updateMember(activeTeam.id, {
      id: crypto.randomUUID(),
      pokemonId: entry.id,
      formId: entry.id,
      abilityId: entry.abilities[0],
      itemId: undefined,
      moveIds: entry.learnableMoves.slice(0, 2),
      nature: '爽朗',
      statPoints: { speed: 252 },
      level: 50,
      notes: '从图鉴加入。',
      legalityStatus: 'needs-review',
    });
  };

  return (
    <Card>
      <div className="mb-3 flex gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-elevated text-lg font-bold text-accent">{entry.iconRef}</div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{entry.chineseName} {entry.englishName}</h3>
          <div className="mt-1 flex gap-1">
            {entry.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
            <Badge status="legal">M-A 合法</Badge>
            {entry.canMega && <Chip>Mega 可用</Chip>}
          </div>
        </div>
      </div>
      <div className="space-y-1.5 rounded-lg bg-elevated p-2">
        {statRows(entry.baseStats).map(([label, value]) => (
          <div key={label} className="grid grid-cols-[34px_1fr_32px] items-center gap-2 text-[11px]">
            <span className="text-textSecondary">{label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-border">
              <span className={`block h-full rounded-full ${value >= 100 ? 'bg-success' : value >= 70 ? 'bg-accent' : 'bg-danger'}`} style={{ width: `${Math.min(100, (value / 180) * 100)}%` }} />
            </span>
            <span className="text-right">{value}</span>
          </div>
        ))}
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
      <p className="mt-3 text-[11px] text-textMuted">图鉴合法性来自模拟数据版本，不暗示完整合法列表。</p>
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
  const [selectedPokemonId, setSelectedPokemonId] = useState('garchomp');
  const selected = pokemon.find((entry) => entry.id === selectedPokemonId) ?? pokemon[0];

  const filteredPokemon = useMemo(
    () => pokemon.filter((entry) => `${entry.chineseName} ${entry.englishName} ${entry.types.join(' ')}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

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
          placeholder="搜索名称或属性"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {tab === 'pokemon' && (
        <>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {['全部', '火', '水', '地面', '龙', '冰'].map((label, index) => (
              <Chip key={label} active={index === 0}>
                {label}
              </Chip>
            ))}
          </div>
          {filteredPokemon.length === 0 ? (
            <EmptyState title="没有找到相关内容" action={<Button onClick={() => setQuery('')}>清除筛选</Button>} />
          ) : (
            <div className="space-y-2">
              {filteredPokemon.map((entry) => (
                <button key={entry.id} className="w-full" onClick={() => setSelectedPokemonId(entry.id)}>
                  <Card className={`flex items-center gap-3 text-left ${entry.id === selected.id ? 'border-accent/70' : ''}`}>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-elevated text-xs font-bold text-accent">{entry.iconRef}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{entry.chineseName} {entry.englishName}</h3>
                      <p className="text-xs text-textSecondary">速度 {entry.baseStats.speed}</p>
                    </div>
                    <div className="flex gap-1">
                      {entry.types.map((type) => (
                        <TypeBadge key={type} type={type} />
                      ))}
                    </div>
                    <Badge status="legal">合法</Badge>
                  </Card>
                </button>
              ))}
            </div>
          )}
          <PokemonDetail entry={selected} onOpenSpeed={onOpenSpeed} onOpenCalculator={onOpenCalculator} />
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
              <Badge status="legal">合法</Badge>
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
              <Badge status="legal">合法</Badge>
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
