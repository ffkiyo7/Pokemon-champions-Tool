import type { Team } from '../../../types';
import { currentDataVersion, currentRuleSet } from './metadata';

export const defaultTeams: Team[] = [
  {
    id: 'team-starter',
    name: 'M-A 测试队',
    ruleSetId: currentRuleSet.id,
    dataVersionId: currentDataVersion.id,
    createdAt: '2026-04-26T16:00:00.000Z',
    updatedAt: '2026-04-26T16:00:00.000Z',
    notes: 'Seed team for local editing and import/export validation.',
    members: [
      {
        id: 'member-garchomp',
        pokemonId: 'garchomp',
        formId: 'garchomp',
        abilityId: 'rough-skin',
        itemId: 'clear-amulet',
        moveIds: ['earthquake', 'protect'],
        nature: '爽朗',
        statPoints: { attack: 32, speed: 32, hp: 1 },
        level: 50,
        notes: '物攻输出位。',
        legalityStatus: 'needs-review',
      },
      {
        id: 'member-incineroar',
        pokemonId: 'incineroar',
        formId: 'incineroar',
        abilityId: 'intimidate',
        itemId: 'sitrus-berry',
        moveIds: ['flare-blitz', 'protect'],
        nature: '慎重',
        statPoints: { hp: 30, specialDefense: 20, speed: 10 },
        level: 50,
        notes: '威吓和节奏位。',
        legalityStatus: 'needs-review',
      },
    ],
  },
];
