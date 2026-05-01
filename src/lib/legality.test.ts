import { describe, expect, it } from 'vitest';
import { currentDataVersion, currentRuleSet, defaultTeams } from '../data';
import type { TeamMember } from '../types';
import { catalogNeedsReview, evaluateMemberLegality } from './legality';

const baseMember: TeamMember = {
  id: 'test-garchomp',
  pokemonId: 'garchomp',
  formId: 'garchomp',
  abilityId: 'rough-skin',
  itemId: 'clear-amulet',
  moveIds: ['earthquake', 'protect'],
  nature: '爽朗',
  statPoints: { attack: 32, speed: 32, hp: 1 },
  level: 50,
  notes: '',
  legalityStatus: 'needs-review',
};

describe('legality evaluation', () => {
  it('marks complete seed entries as needs-review instead of strong legal', () => {
    const result = evaluateMemberLegality(baseMember);

    expect(result.status).toBe('needs-review');
    expect(result.issues.some((issue) => issue.code === 'seed-data-needs-review')).toBe(true);
  });

  it('blocks missing pokemon configuration', () => {
    const result = evaluateMemberLegality({ ...baseMember, pokemonId: undefined });

    expect(result.status).toBe('missing-config');
    expect(result.issues[0].code).toBe('missing-pokemon');
  });

  it('detects duplicate held items under Reg M-A team restrictions', () => {
    const team = {
      id: 'dup-team',
      name: 'Duplicate item team',
      ruleSetId: currentRuleSet.id,
      dataVersionId: currentDataVersion.id,
      createdAt: '2026-04-26T16:00:00.000Z',
      updatedAt: '2026-04-26T16:00:00.000Z',
      notes: '',
      members: [
        baseMember,
        {
          ...defaultTeams[0].members[1],
          id: 'test-incineroar',
          itemId: 'clear-amulet',
        },
      ],
    };

    const result = evaluateMemberLegality(baseMember, team);

    expect(result.status).toBe('illegal');
    expect(result.issues.some((issue) => issue.code === 'duplicate-held-item')).toBe(true);
  });

  it('rejects SP values over the Champions per-stat or total limits', () => {
    const result = evaluateMemberLegality({
      ...baseMember,
      statPoints: { attack: 33, speed: 32, hp: 2 },
    });

    expect(result.status).toBe('illegal');
    expect(result.issues.some((issue) => issue.code === 'stat-points-over-limit')).toBe(true);
  });

  it('accepts a matching Mega form and Mega Stone while keeping seed review visible', () => {
    const result = evaluateMemberLegality({
      ...baseMember,
      formId: 'mega-garchomp',
      abilityId: 'sand-force',
      itemId: 'garchompite',
    });

    expect(result.status).toBe('needs-review');
    expect(result.issues.some((issue) => issue.code === 'mega-item-mismatch')).toBe(false);
  });

  it('rejects Mega forms without their required Mega Stone', () => {
    const result = evaluateMemberLegality({
      ...baseMember,
      formId: 'mega-garchomp',
      abilityId: 'sand-force',
      itemId: 'clear-amulet',
    });

    expect(result.status).toBe('illegal');
    expect(result.issues.some((issue) => issue.code === 'mega-item-mismatch')).toBe(true);
  });

  it('keeps the catalog review flag visible at the data layer', () => {
    expect(catalogNeedsReview()).toBe(true);
  });
});
