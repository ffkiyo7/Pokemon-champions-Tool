import { items, pokemon } from '../data';
import type { BaseStats, Pokemon, PokemonForm, PokemonType, TeamMember } from '../types';

export type BattleFormView = {
  id: string;
  pokemonId: string;
  chineseName: string;
  englishName: string;
  japaneseName: string;
  iconRef: string;
  isMega: boolean;
  requiredItemId?: string;
  types: PokemonType[];
  baseStats: BaseStats;
  abilities: string[];
  legalInCurrentRule: boolean;
  sourceRefs: string[];
};

export type DexFormEntry = BattleFormView & {
  basePokemon: Pokemon;
};

export const toBaseFormView = (entry: Pokemon): BattleFormView => ({
  id: entry.id,
  pokemonId: entry.id,
  chineseName: entry.chineseName,
  englishName: entry.englishName,
  japaneseName: entry.japaneseName,
  iconRef: entry.iconRef,
  isMega: false,
  types: entry.types,
  baseStats: entry.baseStats,
  abilities: entry.abilities,
  legalInCurrentRule: entry.legalInCurrentRule,
  sourceRefs: entry.sourceRefs,
});

export const toMegaFormView = (form: PokemonForm): BattleFormView => ({
  id: form.id,
  pokemonId: form.pokemonId,
  chineseName: form.chineseName,
  englishName: form.englishName,
  japaneseName: form.japaneseName,
  iconRef: form.iconRef,
  isMega: form.isMega,
  requiredItemId: form.requiredItemId,
  types: form.types,
  baseStats: form.baseStats,
  abilities: form.abilities,
  legalInCurrentRule: form.legalInCurrentRule,
  sourceRefs: form.sourceRefs,
});

export const findPokemon = (pokemonId?: string) => pokemon.find((entry) => entry.id === pokemonId);

export const findBattleForm = (pokemonId?: string, formId?: string): BattleFormView | undefined => {
  const entry = findPokemon(pokemonId);
  if (!entry) return undefined;
  if (!formId || formId === entry.id) return toBaseFormView(entry);
  const megaForm = entry.megaForms.find((form) => form.id === formId);
  return megaForm ? toMegaFormView(megaForm) : toBaseFormView(entry);
};

export const findMegaFormByItem = (entry: Pokemon, itemId?: string) => {
  if (!itemId) return undefined;
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item?.isMegaStone) return undefined;
  return entry.megaForms.find((form) => form.requiredItemId === item.id);
};

export const getMemberBattleForm = (member: TeamMember): BattleFormView | undefined => {
  const entry = findPokemon(member.pokemonId);
  if (!entry) return undefined;
  return findBattleForm(entry.id, member.formId) ?? toBaseFormView(entry);
};

export const getDexFormEntries = (): DexFormEntry[] =>
  pokemon.flatMap((entry) => [
    { ...toBaseFormView(entry), basePokemon: entry },
    ...entry.megaForms.map((form) => ({ ...toMegaFormView(form), basePokemon: entry })),
  ]);
