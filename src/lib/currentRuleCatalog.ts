import { currentRuleNatureOptions, currentRuleSelectableItemIds, items, moves } from '../data';
import type { Item, Move } from '../types';

const selectableItemIds = new Set<string>(currentRuleSelectableItemIds);

export const isCurrentRuleSelectableItem = (item: Item) => item.legalInCurrentRule && selectableItemIds.has(item.id);

export const currentRuleSelectableItems = () => items.filter(isCurrentRuleSelectableItem);

export const currentRuleSelectableItemsForPokemon = (pokemonId: string) =>
  currentRuleSelectableItems().filter((item) => !item.isMegaStone || item.applicablePokemonIds.includes(pokemonId));

export const currentRuleMovesForPokemon = (pokemonId: string): Move[] =>
  moves.filter((move) => move.legalInCurrentRule && move.learnableByPokemonIds.includes(pokemonId));

export const currentRuleNatures = () => currentRuleNatureOptions.map((option) => option.id);

export const natureOptionLabel = (nature: string) => {
  const option = currentRuleNatureOptions.find((candidate) => nature.includes(candidate.id.replace('(+速)', '')));
  if (!option) return nature;

  const effects = [...option.up.map((label) => `+${label}`), ...option.down.map((label) => `-${label}`)];
  return effects.length > 0 ? `${nature}（${effects.join(' / ')}）` : nature;
};
