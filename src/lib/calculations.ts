import type { BaseStats, Pokemon, SpeedBenchmark, Team, TeamMember } from '../types';
import { items, pokemon } from '../data';

const natureSpeedMultiplier: Record<string, number> = {
  爽朗: 1.1,
  胆小: 1.1,
  怕慢: 1.1,
  固执: 1,
  慎重: 1,
  冷静: 0.9,
};

export const calculateSpeed = (baseSpeed: number, investment = 0, level = 50, nature = '爽朗', tailwind = false, iv = 31) => {
  const stat = Math.floor(((2 * baseSpeed + iv + Math.floor(investment / 4)) * level) / 100 + 5);
  const natureKey = Object.keys(natureSpeedMultiplier).find((key) => nature.includes(key));
  const withNature = Math.floor(stat * (natureKey ? natureSpeedMultiplier[natureKey] : 1));
  return tailwind ? withNature * 2 : withNature;
};

export type SpeedMechanismStatus = 'confirmed' | 'pending';

export type SpeedCalculationResult =
  | {
      status: 'confirmed';
      finalSpeed: number;
      explanation: string;
    }
  | {
      status: 'blocked';
      finalSpeed?: undefined;
      explanation: string;
    };

export const calculateSpeedWithMechanismGate = ({
  baseSpeed,
  investment = 0,
  level = 50,
  nature = '爽朗',
  tailwind = false,
  iv = 31,
  mechanismStatus,
}: {
  baseSpeed: number;
  investment?: number;
  level?: number;
  nature?: string;
  tailwind?: boolean;
  iv?: number;
  mechanismStatus: SpeedMechanismStatus;
}): SpeedCalculationResult => {
  if (mechanismStatus !== 'confirmed') {
    return {
      status: 'blocked',
      explanation: 'Champions Stat Points / speed modifiers are not confirmed for formal calculation.',
    };
  }

  return {
    status: 'confirmed',
    finalSpeed: calculateSpeed(baseSpeed, investment, level, nature, tailwind, iv),
    explanation: 'Computed with confirmed Lv.50 base speed, investment, nature, and tailwind modifiers.',
  };
};

export const statRows = (stats: BaseStats) => [
  ['HP', stats.hp],
  ['攻', stats.attack],
  ['防', stats.defense],
  ['特攻', stats.specialAttack],
  ['特防', stats.specialDefense],
  ['速', stats.speed],
] as const;

export const getPokemon = (id?: string) => pokemon.find((entry) => entry.id === id);

export const memberLabel = (member: TeamMember) => {
  const found = getPokemon(member.pokemonId);
  return found ? `${found.chineseName} ${found.englishName}` : '未选择 Pokémon';
};

export const memberSpeed = (member: TeamMember) => {
  const found = getPokemon(member.pokemonId);
  return calculateSpeed(found?.baseStats.speed ?? 50, member.statPoints.speed ?? 0, member.level, member.nature);
};

export const buildTeamBenchmarks = (team: Team): SpeedBenchmark[] =>
  team.members
    .filter((member) => member.pokemonId)
    .map((member) => {
      const found = getPokemon(member.pokemonId);
      return {
        id: `team-${team.id}-${member.id}`,
        name: found ? `${found.chineseName} 队内` : '队内成员',
        pokemonId: member.pokemonId ?? 'unknown',
        nature: member.nature,
        speedInvestment: member.statPoints.speed ?? 0,
        itemOrStatus: items.find((item) => item.id === member.itemId)?.chineseName ?? '无',
        isMega: false,
        finalSpeed: memberSpeed(member),
        tags: ['当前队伍'],
        source: team.name,
        notes: '由当前队伍配置生成的 benchmark。',
        benchmarkType: 'team',
        dataVersionId: team.dataVersionId,
      };
    });

export const teamAnalysis = (team: Team) => {
  const members = team.members.map((member) => getPokemon(member.pokemonId)).filter(Boolean) as Pokemon[];
  const typeCounts = members.flatMap((entry) => entry.types).reduce<Record<string, number>>((acc, type) => {
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});
  const physicalBias = members.filter((entry) => entry.baseStats.attack >= entry.baseStats.specialAttack).length;
  const speedCoverage = members.filter((entry) => entry.baseStats.speed >= 90).length;

  return [
    members.length < 6 ? `缺少配置 ${6 - members.length}` : '6 位齐整',
    physicalBias > members.length / 2 ? '物攻倾向' : '攻防较均衡',
    speedCoverage >= 2 ? '速度覆盖' : '速度偏慢',
    Object.values(typeCounts).some((count) => count >= 3) ? '属性重复需复核' : '属性分布可读',
  ];
};
