import { Star } from 'lucide-react';
import { pokemon, speedBenchmarks } from '../data/mockData';
import { buildTeamBenchmarks, calculateSpeed } from '../lib/calculations';
import { useAppStore } from '../state/AppContext';
import type { Team } from '../types';
import { Button, Card, Chip, TypeBadge } from '../components/ui';

export function SpeedPage({
  selectedPokemonId,
  onSelectPokemon,
  activeTeam,
}: {
  selectedPokemonId: string;
  onSelectPokemon: (pokemonId: string) => void;
  activeTeam?: Team;
}) {
  const { preferences, toggleFavoriteBenchmark } = useAppStore();
  const selected = pokemon.find((entry) => entry.id === selectedPokemonId) ?? pokemon[0];
  const currentSpeed = calculateSpeed(selected.baseStats.speed, 252, 50, '爽朗');
  const favoriteIds = preferences.favoriteBenchmarkIds;
  const teamBenchmarks = activeTeam ? buildTeamBenchmarks(activeTeam) : [];
  const benchmarks = [...speedBenchmarks, ...teamBenchmarks].slice(0, 12);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">速度线</h2>
        <p className="text-xs text-textSecondary">默认最多 12 个 benchmark · 示例数据 / 非真实计算</p>
      </div>

      <Card>
        <select
          className="mb-3 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none"
          value={selected.id}
          onChange={(event) => onSelectPokemon(event.target.value)}
        >
          {pokemon.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.chineseName} {entry.englishName}
            </option>
          ))}
        </select>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <Chip active>爽朗(+速)</Chip>
          <Chip active>SP:252</Chip>
          <Chip>{selected.canMega ? 'Mega 可用' : '原始形态'}</Chip>
          <Chip>道具 ▾</Chip>
          <Chip>顺风</Chip>
        </div>
      </Card>

      <Card>
        <p className="text-[11px] text-textSecondary">最终速度</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[26px] font-bold text-white">{currentSpeed}</p>
            <p className="text-xs text-textSecondary">基础速度 {selected.baseStats.speed} · 性格×1.1 · SP+252</p>
          </div>
          <div className="flex gap-1">
            {selected.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-4 border-b border-divider text-sm">
        {['当前队伍', '收藏', '常见', '全部'].map((label) => (
          <button key={label} className={`pb-2 ${label === '常见' ? 'border-b-2 border-accent text-accent' : 'text-textMuted'}`}>
            {label}
          </button>
        ))}
      </div>

      <Card className="speed-grid min-h-[220px] overflow-hidden bg-page">
        <div className="relative h-[170px]">
          <div className="absolute inset-x-0 top-[86px] h-px bg-border" />
          {[50, 100, 150, 200, 250].map((tick) => (
            <span key={tick} className="absolute top-[96px] -translate-x-1/2 text-[10px] text-textMuted" style={{ left: `${(tick / 250) * 100}%` }}>
              {tick}
            </span>
          ))}
          <div className="absolute top-6 -translate-x-1/2 text-center" style={{ left: `${Math.min(96, Math.max(4, (currentSpeed / 250) * 100))}%` }}>
            <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-[#1e2a45] text-xs font-bold text-accent">{selected.iconRef}</div>
            <div className="mx-auto h-12 w-px bg-accent/70" />
            <div className="mx-auto h-4 w-4 rotate-45 bg-accent" />
            <p className="mt-2 text-xs font-bold text-accent">{currentSpeed}</p>
          </div>
          {benchmarks.map((benchmark, index) => {
            const left = Math.min(96, Math.max(4, (benchmark.finalSpeed / 250) * 100));
            const faster = currentSpeed > benchmark.finalSpeed;
            const top = faster ? 58 - (index % 3) * 16 : 116 + (index % 3) * 14;
            return (
              <button
                key={benchmark.id}
                className="absolute -translate-x-1/2 text-center"
                style={{ left: `${left}%`, top }}
                title={benchmark.notes}
              >
                <span className={`mx-auto block h-2 w-2 rounded-full ${faster ? 'bg-success' : 'bg-danger'}`} />
                <span className={`mt-1 block max-w-[58px] truncate text-[10px] ${faster ? 'text-success' : 'text-danger'}`}>{benchmark.name}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center gap-3 text-[11px] text-textMuted">
          <span className="text-success">● 我更快</span>
          <span className="text-danger">● 我更慢</span>
          <span className="text-accent">◆ 当前</span>
        </div>
      </Card>

      <div className="space-y-2">
        {benchmarks.map((benchmark) => {
          const favorite = favoriteIds.includes(benchmark.id);
          return (
            <Card key={benchmark.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{benchmark.name}</h3>
                <p className="text-xs text-textSecondary">最终速度 {benchmark.finalSpeed} · {benchmark.source}</p>
                <div className="mt-1 flex gap-1">
                  {benchmark.tags.slice(0, 2).map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
              </div>
              <Button variant={favorite ? 'primary' : 'ghost'} onClick={() => toggleFavoriteBenchmark(benchmark.id)}>
                <Star size={14} fill={favorite ? 'currentColor' : 'none'} />
                收藏
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
