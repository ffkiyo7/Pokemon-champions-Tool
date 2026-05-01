import { describe, expect, it } from 'vitest';
import {
  abilities,
  currentDataVersion,
  currentRuleSelectableItemIds,
  dataSourceManifest,
  defaultTeams,
  items,
  pokemon,
  regMaMegaAllowlist,
  regMaMegaAllowlistExpectedCount,
  regMaPokemonAllowlist,
  regMaPokemonAllowlistExpectedCount,
  speedBenchmarks,
} from '../data';
import { auditSeedData, auditSourceRefs } from './dataAudit';

describe('seed data audit', () => {
  it('keeps current seed data internally consistent', () => {
    expect(auditSeedData()).toEqual([]);
  });

  it('keeps every catalog source ref resolvable through the manifest', () => {
    const sourceRefIds = new Set(dataSourceManifest.sources.map((sourceRef) => sourceRef.id));

    expect(sourceRefIds.has('reg-ma-official-rule')).toBe(true);
    expect(sourceRefIds.has('reg-ma-official-eligible-pokemon')).toBe(true);
    expect(sourceRefIds.has('reg-ma-official-mega-list')).toBe(true);
    expect(sourceRefIds.has('reg-ma-community-item-snapshot')).toBe(true);
    expect(sourceRefIds.has('manual-seed-review')).toBe(true);
    expect(sourceRefIds.has('champions-official-training')).toBe(true);
    expect(sourceRefIds.has('champions-stat-point-review')).toBe(true);
    expect(sourceRefIds.has('pokemon-zhwiki-ability-text')).toBe(true);
    expect(auditSourceRefs('Test row', ['reg-ma-official-rule'])).toEqual([]);
  });

  it('keeps the official Reg M-A allowlist traceable to catalog rows', () => {
    expect(regMaPokemonAllowlistExpectedCount).toBe(213);
    expect(regMaPokemonAllowlist).toHaveLength(regMaPokemonAllowlistExpectedCount);
    expect(regMaPokemonAllowlist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ championsFormId: '0445-000', englishName: 'Garchomp', pokemonId: 'garchomp' }),
        expect.objectContaining({ championsFormId: '0727-000', englishName: 'Incineroar', pokemonId: 'incineroar' }),
      ]),
    );
    expect(regMaPokemonAllowlist.some((entry) => entry.englishName === 'Cetitan')).toBe(false);
    expect(regMaPokemonAllowlist.every((entry) => entry.verificationStatus === 'manual-review')).toBe(true);
  });

  it('keeps the official Reg M-A Mega allowlist shell traceable', () => {
    expect(regMaMegaAllowlistExpectedCount).toBe(59);
    expect(regMaMegaAllowlist).toHaveLength(regMaMegaAllowlistExpectedCount);
    expect(regMaMegaAllowlist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ englishName: 'Mega Garchomp', basePokemonId: 'garchomp', formId: 'mega-garchomp' }),
        expect.objectContaining({ englishName: 'Mega Dragonite', legalInCurrentRule: true }),
      ]),
    );
    expect(regMaMegaAllowlist.every((entry) => entry.verificationStatus === 'manual-review')).toBe(true);
  });

  it('keeps unverified or out-of-rule items out of the current selector pool', () => {
    expect(currentRuleSelectableItemIds).toHaveLength(117);
    expect(currentRuleSelectableItemIds).toContain('sitrus-berry');
    expect(currentRuleSelectableItemIds).toContain('focus-sash');
    expect(currentRuleSelectableItemIds).toContain('choice-scarf');
    expect(currentRuleSelectableItemIds).toContain('lum-berry');
    expect(currentRuleSelectableItemIds).toContain('dragoninite');
    expect(currentRuleSelectableItemIds).toContain('garchompite');
    expect(currentRuleSelectableItemIds).not.toContain('assault-vest');
    expect(currentRuleSelectableItemIds).not.toContain('clear-amulet');
    expect(items.find((item) => item.id === 'assault-vest')?.legalInCurrentRule).toBe(false);
    expect(items.find((item) => item.id === 'clear-amulet')?.legalInCurrentRule).toBe(false);
  });

  it('keeps real catalog rows on real artwork URLs', () => {
    const ids = pokemon.map((entry) => entry.id);
    expect(ids).toEqual(expect.arrayContaining(['venusaur', 'charizard', 'politoed', 'torkoal', 'garchomp', 'incineroar']));
    expect(pokemon.length).toBeGreaterThanOrEqual(6);
    expect(pokemon.every((entry) => entry.iconRef.startsWith('https://raw.githubusercontent.com/PokeAPI/sprites/'))).toBe(true);
    expect(pokemon.flatMap((entry) => entry.megaForms).every((form) => form.iconRef.startsWith('https://raw.githubusercontent.com/PokeAPI/sprites/'))).toBe(true);
  });

  it('keeps ability text complete and maps abilities back to current Pokemon', () => {
    expect(abilities).toHaveLength(174);
    expect(abilities.every((ability) => ability.effectSummary && !ability.effectSummary.includes('待确认'))).toBe(true);

    const expectedPokemonIdsByAbility = new Map<string, string[]>();
    pokemon.forEach((entry) => {
      const abilityIds = new Set([...entry.abilities, ...entry.megaForms.flatMap((form) => form.abilities)]);
      abilityIds.forEach((abilityId) => {
        expectedPokemonIdsByAbility.set(abilityId, [...(expectedPokemonIdsByAbility.get(abilityId) ?? []), entry.id]);
      });
    });

    abilities.forEach((ability) => {
      expect(ability.pokemonIds).toEqual(expectedPokemonIdsByAbility.get(ability.id) ?? []);
    });
  });

  it('reports source refs that are not present in the manifest', () => {
    const issues = auditSourceRefs('Test row', ['missing-source']);

    expect(issues).toEqual([
      {
        code: 'unresolved-source-ref',
        message: 'Test row references unknown sourceRef missing-source.',
      },
    ]);
  });

  it('keeps benchmark versions aligned with the active data version', () => {
    expect(speedBenchmarks.every((benchmark) => benchmark.dataVersionId === currentDataVersion.id)).toBe(true);
    expect(speedBenchmarks.every((benchmark) => benchmark.speedStatPoints >= 0 && benchmark.speedStatPoints <= 32)).toBe(true);
  });

  it('keeps default teams tied to the active data version', () => {
    expect(defaultTeams.every((team) => team.dataVersionId === currentDataVersion.id)).toBe(true);
  });
});
