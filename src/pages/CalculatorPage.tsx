import { AlertTriangle, Calculator } from 'lucide-react';
import { moves, pokemon } from '../data';
import { memberLabel } from '../lib/calculations';
import { useAppStore } from '../state/AppContext';
import { Badge, Button, Card, Chip, EmptyState } from '../components/ui';

export function CalculatorPage({
  selectedMemberId,
  onPickMember,
}: {
  selectedMemberId?: string;
  onPickMember: (memberId: string) => void;
}) {
  const { teams } = useAppStore();
  const members = teams.flatMap((team) => team.members.map((member) => ({ team, member })));
  const selectedPokemon = pokemon.find((entry) => entry.id === selectedMemberId);
  const manualAttacker = selectedPokemon
    ? {
        id: `manual-${selectedPokemon.id}`,
        pokemonId: selectedPokemon.id,
        abilityId: selectedPokemon.abilities[0],
        moveIds: selectedPokemon.learnableMoves.slice(0, 2),
        nature: '爽朗',
        statPoints: { speed: 252 },
        level: 50,
        notes: '从图鉴带入的手动配置。',
        legalityStatus: 'needs-review' as const,
      }
    : undefined;
  const attacker = members.find(({ member }) => member.id === selectedMemberId)?.member ?? manualAttacker ?? members[0]?.member;
  const defender = members.find(({ member }) => member.id !== attacker?.id)?.member ?? members[1]?.member;
  const move = moves.find((entry) => attacker?.moveIds.includes(entry.id)) ?? moves[0];
  const blocked = true;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">伤害计算</h2>
        <p className="text-xs text-textSecondary">队伍带入 + 手动配置 · 机制待确认时阻断正式结论</p>
      </div>

      {members.length === 0 ? (
        <EmptyState title="还没有可用于计算的队伍成员" />
      ) : (
        <>
          <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
            <button className="rounded-lg border border-border bg-card p-3 text-left" onClick={() => onPickMember(attacker?.id ?? '')}>
              <p className="text-[11px] text-textSecondary">进攻方</p>
              <p className="truncate text-sm font-semibold">{attacker ? memberLabel(attacker) : '未选择 Pokémon'}</p>
            </button>
            <span className="text-center text-textMuted">→</span>
            <button className="rounded-lg border border-border bg-card p-3 text-left">
              <p className="text-[11px] text-textSecondary">防守方</p>
              <p className="truncate text-sm font-semibold">{defender ? memberLabel(defender) : '未选择 Pokémon'}</p>
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
            <p className="text-xs text-textSecondary">可选成员</p>
            <div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar">
              {members.map(({ member }) => (
                <Button key={member.id} variant={member.id === attacker?.id ? 'primary' : 'ghost'} onClick={() => onPickMember(member.id)}>
                  {memberLabel(member).split(' ')[0]}
                </Button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
