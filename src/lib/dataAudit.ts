import { abilities, currentDataVersion, currentRuleSet, defaultTeams, items, moves, pokemon, speedBenchmarks } from '../data';

export type DataAuditIssue = {
  code:
    | 'missing-source-ref'
    | 'version-mismatch'
    | 'missing-pokemon-ref'
    | 'missing-ability-ref'
    | 'missing-move-ref'
    | 'missing-item-ref'
    | 'invalid-mega-ref'
    | 'default-team-rule-mismatch';
  message: string;
};

const issue = (code: DataAuditIssue['code'], message: string): DataAuditIssue => ({ code, message });

const hasSourceRefs = (entry: { sourceRefs: string[] }) => entry.sourceRefs.length > 0 && entry.sourceRefs.every(Boolean);

export function auditSeedData(): DataAuditIssue[] {
  const issues: DataAuditIssue[] = [];
  const pokemonIds = new Set(pokemon.map((entry) => entry.id));
  const abilityIds = new Set(abilities.map((entry) => entry.id));
  const moveIds = new Set(moves.map((entry) => entry.id));
  const itemIds = new Set(items.map((entry) => entry.id));

  pokemon.forEach((entry) => {
    if (!hasSourceRefs(entry)) issues.push(issue('missing-source-ref', `Pokemon ${entry.id} is missing sourceRefs.`));

    entry.abilities.forEach((abilityId) => {
      if (!abilityIds.has(abilityId)) issues.push(issue('missing-ability-ref', `Pokemon ${entry.id} references unknown ability ${abilityId}.`));
    });

    entry.learnableMoves.forEach((moveId) => {
      if (!moveIds.has(moveId)) issues.push(issue('missing-move-ref', `Pokemon ${entry.id} references unknown move ${moveId}.`));
    });

    entry.megaForms.forEach((form) => {
      if (!hasSourceRefs(form)) issues.push(issue('missing-source-ref', `Mega form ${form.id} is missing sourceRefs.`));
      if (form.requiredItemId && !itemIds.has(form.requiredItemId)) {
        issues.push(issue('missing-item-ref', `Mega form ${form.id} references unknown item ${form.requiredItemId}.`));
      }
      if (form.pokemonId !== entry.id) {
        issues.push(issue('invalid-mega-ref', `Mega form ${form.id} does not point back to ${entry.id}.`));
      }
    });
  });

  moves.forEach((entry) => {
    if (!hasSourceRefs(entry)) issues.push(issue('missing-source-ref', `Move ${entry.id} is missing sourceRefs.`));
    entry.learnableByPokemonIds.forEach((pokemonId) => {
      if (!pokemonIds.has(pokemonId)) issues.push(issue('missing-pokemon-ref', `Move ${entry.id} references unknown Pokemon ${pokemonId}.`));
    });
  });

  items.forEach((entry) => {
    if (!hasSourceRefs(entry)) issues.push(issue('missing-source-ref', `Item ${entry.id} is missing sourceRefs.`));
    entry.applicablePokemonIds.forEach((pokemonId) => {
      if (!pokemonIds.has(pokemonId)) issues.push(issue('missing-pokemon-ref', `Item ${entry.id} references unknown Pokemon ${pokemonId}.`));
    });
  });

  abilities.forEach((entry) => {
    if (!hasSourceRefs(entry)) issues.push(issue('missing-source-ref', `Ability ${entry.id} is missing sourceRefs.`));
    entry.pokemonIds.forEach((pokemonId) => {
      if (!pokemonIds.has(pokemonId)) issues.push(issue('missing-pokemon-ref', `Ability ${entry.id} references unknown Pokemon ${pokemonId}.`));
    });
  });

  speedBenchmarks.forEach((entry) => {
    if (entry.dataVersionId !== currentDataVersion.id) {
      issues.push(issue('version-mismatch', `Benchmark ${entry.id} uses ${entry.dataVersionId}, expected ${currentDataVersion.id}.`));
    }
    if (!pokemonIds.has(entry.pokemonId)) {
      issues.push(issue('missing-pokemon-ref', `Benchmark ${entry.id} references unknown Pokemon ${entry.pokemonId}.`));
    }
  });

  defaultTeams.forEach((team) => {
    if (team.ruleSetId !== currentRuleSet.id || team.dataVersionId !== currentDataVersion.id) {
      issues.push(issue('default-team-rule-mismatch', `Default team ${team.id} does not match the current rule/data version.`));
    }
    team.members.forEach((member) => {
      if (member.pokemonId && !pokemonIds.has(member.pokemonId)) {
        issues.push(issue('missing-pokemon-ref', `Default team ${team.id} references unknown Pokemon ${member.pokemonId}.`));
      }
      if (member.abilityId && !abilityIds.has(member.abilityId)) {
        issues.push(issue('missing-ability-ref', `Default team ${team.id} references unknown ability ${member.abilityId}.`));
      }
      if (member.itemId && !itemIds.has(member.itemId)) {
        issues.push(issue('missing-item-ref', `Default team ${team.id} references unknown item ${member.itemId}.`));
      }
      member.moveIds.forEach((moveId) => {
        if (!moveIds.has(moveId)) issues.push(issue('missing-move-ref', `Default team ${team.id} references unknown move ${moveId}.`));
      });
    });
  });

  return issues;
}
