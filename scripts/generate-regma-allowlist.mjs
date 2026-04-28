import { writeFile } from 'node:fs/promises';

const sourceUrl = 'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/en/pokemon.html';
const outputPath = new URL('../src/data/seed/regMA/allowlist.ts', import.meta.url);
const catalogPokemonIdsByEnglishName = new Map([
  ['Garchomp', 'garchomp'],
  ['Incineroar', 'incineroar'],
  ['Politoed', 'politoed'],
  ['Torkoal', 'torkoal'],
]);

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
}

const html = await response.text();
const match = html.match(/const pokemons = (\[.*?\]);const noPrefix/s);
if (!match) {
  throw new Error('Could not find the Eligible Pokemon payload.');
}

const rows = JSON.parse(match[1]);
if (!Array.isArray(rows) || rows.length === 0) {
  throw new Error('Eligible Pokemon payload was empty or malformed.');
}

const toEntryId = (championsFormId) => `reg-ma-${championsFormId}`;
const toNationalDexNo = (championsFormId) => Number(championsFormId.slice(0, 4));
const toFormName = (englishName) => englishName.match(/\((.+)\)$/)?.[1];

const entries = rows.map(([championsFormId, _availabilityFlag, englishName]) => {
  const pokemonId = catalogPokemonIdsByEnglishName.get(englishName);
  const formName = toFormName(englishName);
  const lines = [
    '  {',
    `    id: '${toEntryId(championsFormId)}',`,
    ...(pokemonId ? [`    pokemonId: '${pokemonId}',`] : []),
    `    championsFormId: '${championsFormId}',`,
    `    nationalDexNo: ${toNationalDexNo(championsFormId)},`,
    `    englishName: '${englishName.replaceAll("'", "\\'")}',`,
    ...(formName ? [`    formName: '${formName.replaceAll("'", "\\'")}',`] : []),
    "    verificationStatus: 'manual-review',",
    '    sourceRefs: officialEligiblePokemonRefs,',
    "    reviewNotes: 'Imported from the official Eligible Pokemon page. This row remains manual-review until row count and normalization receive a second review.',",
    '  },',
  ];

  return lines.join('\n');
});

const content = `import type { EligiblePokemon } from '../../../types';

export const regMaPokemonAllowlistExpectedCount = ${rows.length};

const officialEligiblePokemonRefs = ['reg-ma-official-eligible-pokemon', 'manual-seed-review'];

export const regMaPokemonAllowlist: EligiblePokemon[] = [
${entries.join('\n')}
];
`;

await writeFile(outputPath, content, 'utf8');
console.log(`Wrote ${rows.length} Reg M-A allowlist rows to ${outputPath.pathname}`);
