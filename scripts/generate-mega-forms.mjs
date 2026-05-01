import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'src/data/seed/regMA/mega-catalog.ts');
const MEGA_ALLOWLIST_PATH = resolve(ROOT, 'src/data/seed/regMA/megaAllowlist.ts');

const POKEAPI = 'https://pokeapi.co/api/v2';
const ARTWORK_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// ── Old-gen Megas with known game data ──
// Format: [englishName, nationalDexNo, megaName, types[], baseStats{}, ability, megaSpriteId]
// Sprite ID for megas = nationalDexNo + 10000 (PokeAPI convention)
// [megaName, dexNo, baseId, types, stats, ability, megaStoneId]
const OLD_GEN_MEGAS = [
  ['Mega Venusaur', 3, 'venusaur', ['Grass', 'Poison'], { hp: 80, attack: 100, defense: 123, specialAttack: 122, specialDefense: 120, speed: 80 }, 'Thick Fat', 'venusaurite'],
  ['Mega Charizard X', 6, 'charizard', ['Fire', 'Dragon'], { hp: 78, attack: 130, defense: 111, specialAttack: 130, specialDefense: 85, speed: 100 }, 'Tough Claws', 'charizardite-x'],
  ['Mega Charizard Y', 6, 'charizard', ['Fire', 'Flying'], { hp: 78, attack: 104, defense: 78, specialAttack: 159, specialDefense: 115, speed: 100 }, 'Drought', 'charizardite-y'],
  ['Mega Blastoise', 9, 'blastoise', ['Water'], { hp: 79, attack: 103, defense: 120, specialAttack: 135, specialDefense: 115, speed: 78 }, 'Mega Launcher', 'blastoisinite'],
  ['Mega Beedrill', 15, 'beedrill', ['Bug', 'Poison'], { hp: 65, attack: 150, defense: 40, specialAttack: 15, specialDefense: 80, speed: 145 }, 'Adaptability', 'beedrillite'],
  ['Mega Pidgeot', 18, 'pidgeot', ['Normal', 'Flying'], { hp: 83, attack: 80, defense: 80, specialAttack: 135, specialDefense: 80, speed: 121 }, 'No Guard', 'pidgeotite'],
  ['Mega Clefable', 36, 'clefable', ['Fairy'], { hp: 95, attack: 70, defense: 73, specialAttack: 125, specialDefense: 120, speed: 60 }, 'Magic Guard', 'clefablite'],
  ['Mega Alakazam', 65, 'alakazam', ['Psychic'], { hp: 55, attack: 50, defense: 65, specialAttack: 175, specialDefense: 105, speed: 150 }, 'Trace', 'alakazite'],
  ['Mega Victreebel', 71, 'victreebel', ['Grass', 'Poison'], { hp: 80, attack: 130, defense: 80, specialAttack: 120, specialDefense: 80, speed: 90 }, 'Chlorophyll', 'victreebelite'],
  ['Mega Slowbro', 80, 'slowbro', ['Water', 'Psychic'], { hp: 95, attack: 75, defense: 180, specialAttack: 130, specialDefense: 80, speed: 30 }, 'Shell Armor', 'slowbronite'],
  ['Mega Gengar', 94, 'gengar', ['Ghost', 'Poison'], { hp: 60, attack: 65, defense: 80, specialAttack: 170, specialDefense: 95, speed: 130 }, 'Shadow Tag', 'gengarite'],
  ['Mega Kangaskhan', 115, 'kangaskhan', ['Normal'], { hp: 105, attack: 125, defense: 100, specialAttack: 60, specialDefense: 100, speed: 100 }, 'Parental Bond', 'kangaskhanite'],
  ['Mega Starmie', 121, 'starmie', ['Water', 'Psychic'], { hp: 60, attack: 85, defense: 100, specialAttack: 130, specialDefense: 100, speed: 125 }, 'Analytic', 'starminite'],
  ['Mega Pinsir', 127, 'pinsir', ['Bug', 'Flying'], { hp: 65, attack: 155, defense: 120, specialAttack: 65, specialDefense: 90, speed: 105 }, 'Aerilate', 'pinsirite'],
  ['Mega Gyarados', 130, 'gyarados', ['Water', 'Dark'], { hp: 95, attack: 155, defense: 109, specialAttack: 70, specialDefense: 130, speed: 81 }, 'Mold Breaker', 'gyaradosite'],
  ['Mega Aerodactyl', 142, 'aerodactyl', ['Rock', 'Flying'], { hp: 80, attack: 135, defense: 85, specialAttack: 70, specialDefense: 95, speed: 150 }, 'Tough Claws', 'aerodactylite'],
  ['Mega Dragonite', 149, 'dragonite', ['Dragon', 'Flying'], { hp: 91, attack: 164, defense: 105, specialAttack: 120, specialDefense: 110, speed: 100 }, 'Multiscale', 'dragoninite'],
  ['Mega Meganium', 154, 'meganium', ['Grass'], { hp: 80, attack: 82, defense: 130, specialAttack: 113, specialDefense: 130, speed: 80 }, 'Thick Fat', 'meganiumite'],
  ['Mega Feraligatr', 160, 'feraligatr', ['Water'], { hp: 85, attack: 135, defense: 120, specialAttack: 79, specialDefense: 93, speed: 88 }, 'Strong Jaw', 'feraligite'],
  ['Mega Ampharos', 181, 'ampharos', ['Electric', 'Dragon'], { hp: 90, attack: 95, defense: 105, specialAttack: 165, specialDefense: 110, speed: 45 }, 'Mold Breaker', 'ampharosite'],
  ['Mega Steelix', 208, 'steelix', ['Steel', 'Ground'], { hp: 75, attack: 125, defense: 230, specialAttack: 55, specialDefense: 95, speed: 30 }, 'Sand Force', 'steelixite'],
  ['Mega Scizor', 212, 'scizor', ['Bug', 'Steel'], { hp: 70, attack: 150, defense: 140, specialAttack: 65, specialDefense: 100, speed: 75 }, 'Technician', 'scizorite'],
  ['Mega Heracross', 214, 'heracross', ['Bug', 'Fighting'], { hp: 80, attack: 185, defense: 115, specialAttack: 40, specialDefense: 105, speed: 75 }, 'Skill Link', 'heracronite'],
  ['Mega Houndoom', 229, 'houndoom', ['Dark', 'Fire'], { hp: 75, attack: 90, defense: 90, specialAttack: 140, specialDefense: 90, speed: 115 }, 'Solar Power', 'houndoominite'],
  ['Mega Tyranitar', 248, 'tyranitar', ['Rock', 'Dark'], { hp: 100, attack: 164, defense: 150, specialAttack: 95, specialDefense: 120, speed: 71 }, 'Sand Stream', 'tyranitarite'],
  ['Mega Gardevoir', 282, 'gardevoir', ['Psychic', 'Fairy'], { hp: 68, attack: 85, defense: 65, specialAttack: 165, specialDefense: 135, speed: 100 }, 'Pixilate', 'gardevoirite'],
  ['Mega Sableye', 302, 'sableye', ['Dark', 'Ghost'], { hp: 50, attack: 85, defense: 125, specialAttack: 85, specialDefense: 115, speed: 20 }, 'Magic Bounce', 'sablenite'],
  ['Mega Aggron', 306, 'aggron', ['Steel'], { hp: 70, attack: 140, defense: 230, specialAttack: 60, specialDefense: 80, speed: 50 }, 'Filter', 'aggronite'],
  ['Mega Medicham', 308, 'medicham', ['Fighting', 'Psychic'], { hp: 60, attack: 100, defense: 85, specialAttack: 80, specialDefense: 85, speed: 100 }, 'Pure Power', 'medichamite'],
  ['Mega Manectric', 310, 'manectric', ['Electric'], { hp: 70, attack: 75, defense: 80, specialAttack: 135, specialDefense: 80, speed: 135 }, 'Intimidate', 'manectite'],
  ['Mega Sharpedo', 319, 'sharpedo', ['Water', 'Dark'], { hp: 70, attack: 140, defense: 70, specialAttack: 110, specialDefense: 65, speed: 105 }, 'Strong Jaw', 'sharpedonite'],
  ['Mega Camerupt', 323, 'camerupt', ['Fire', 'Ground'], { hp: 70, attack: 120, defense: 100, specialAttack: 145, specialDefense: 105, speed: 20 }, 'Sheer Force', 'cameruptite'],
  ['Mega Altaria', 334, 'altaria', ['Dragon', 'Fairy'], { hp: 75, attack: 110, defense: 110, specialAttack: 110, specialDefense: 105, speed: 80 }, 'Pixilate', 'altarianite'],
  ['Mega Banette', 354, 'banette', ['Ghost'], { hp: 64, attack: 165, defense: 75, specialAttack: 93, specialDefense: 83, speed: 75 }, 'Prankster', 'banettite'],
  ['Mega Absol', 359, 'absol', ['Dark'], { hp: 65, attack: 150, defense: 60, specialAttack: 115, specialDefense: 60, speed: 115 }, 'Magic Bounce', 'absolite'],
  ['Mega Glalie', 362, 'glalie', ['Ice'], { hp: 80, attack: 120, defense: 80, specialAttack: 120, specialDefense: 80, speed: 100 }, 'Refrigerate', 'glalitite'],
  ['Mega Lopunny', 428, 'lopunny', ['Normal', 'Fighting'], { hp: 65, attack: 136, defense: 94, specialAttack: 54, specialDefense: 96, speed: 135 }, 'Scrappy', 'lopunnite'],
  ['Mega Garchomp', 445, 'garchomp', ['Dragon', 'Ground'], { hp: 108, attack: 170, defense: 115, specialAttack: 120, specialDefense: 95, speed: 92 }, 'Sand Force', 'garchompite'],
  ['Mega Lucario', 448, 'lucario', ['Fighting', 'Steel'], { hp: 70, attack: 145, defense: 88, specialAttack: 140, specialDefense: 70, speed: 112 }, 'Adaptability', 'lucarionite'],
  ['Mega Abomasnow', 460, 'abomasnow', ['Grass', 'Ice'], { hp: 90, attack: 132, defense: 105, specialAttack: 132, specialDefense: 105, speed: 30 }, 'Snow Warning', 'abomasite'],
  ['Mega Gallade', 475, 'gallade', ['Psychic', 'Fighting'], { hp: 68, attack: 165, defense: 95, specialAttack: 65, specialDefense: 115, speed: 110 }, 'Inner Focus', 'galladite'],
];

const CHAMPIONS_ONLY_MEGAS = new Set([
  'Mega Skarmory', 'Mega Froslass', 'Mega Chimecho',
  'Mega Emboar', 'Mega Excadrill', 'Mega Audino',
  'Mega Chandelure', 'Mega Golurk', 'Mega Chesnaught',
  'Mega Delphox', 'Mega Greninja', 'Mega Floette',
  'Mega Meowstic', 'Mega Hawlucha', 'Mega Crabominable',
  'Mega Drampa', 'Mega Scovillain', 'Mega Glimmora',
]);

// ── Fetch Chinese/Japanese names from PokeAPI ──

async function fetchNames(nationalDexNo) {
  try {
    const res = await fetch(`${POKEAPI}/pokemon-species/${nationalDexNo}/`);
    if (!res.ok) return {};
    const data = await res.json();
    return {
      zhName: data.names?.find((n) => n.language.name === 'zh-hans')?.name,
      jaName: data.names?.find((n) => n.language.name === 'ja-hrkt')?.name || data.names?.find((n) => n.language.name === 'ja')?.name,
    };
  } catch {
    return {};
  }
}

// ── Main ──

console.log('Fetching Chinese/Japanese names for mega-capable Pokemon...');

const megaData = [];
let idx = 0;
for (const [megaName, dexNo, baseId, types, stats, ability, megaStoneId] of OLD_GEN_MEGAS) {
  const megaId = megaName.toLowerCase().replace(/ /g, '-');
  // PokeAPI special sprite ID for megas
  const spriteId = dexNo + 10000;

  if (CHAMPIONS_ONLY_MEGAS.has(megaName)) {
    console.log(`  SKIP ${megaName} (Champions-only, no data fabricated)`);
    continue;
  }

  const { zhName, jaName } = await fetchNames(dexNo);
  if (!zhName) {
    console.warn(`  WARN: No Chinese name for #${dexNo} ${megaName}`);
  }

  const megaZhPrefix = '超级';
  const chineseName = zhName ? megaZhPrefix + zhName : megaName;

  const abilityId = ability.toLowerCase().replace(/ /g, '-');

  megaData.push({
    megaName,
    megaId,
    dexNo,
    baseId,
    megaStoneId,
    spriteId,
    chineseName: chineseName,
    englishName: megaName,
    japaneseName: jaName ? `メガ${jaName}` : '',
    types,
    stats,
    ability,
    abilityId,
  });

  idx++;
  console.log(`  [${idx}] ${megaName} → ${baseId} (sprite: ${spriteId}, ability: ${ability})`);

  // Small delay
  if (idx % 10 === 0) await new Promise((r) => setTimeout(r, 200));
}

// ── Generate mega-catalog.ts ──

const lines = [];
lines.push('// Auto-generated mega form catalog');
lines.push('// Source: competitive Pokemon data + PokeAPI names');
lines.push(`// Generated on ${new Date().toISOString()}`);
lines.push('');
lines.push("import type { PokemonForm } from '../../../types';");
lines.push('');
lines.push('const megaRefs = [');
lines.push("  'reg-ma-official-mega-list',");
lines.push("  'pokeapi-pokemon-data',");
lines.push("  'manual-seed-review',");
lines.push('];');
lines.push('');
lines.push(`const artwork = (n: number) => \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${n}.png\`;`);
lines.push('');
lines.push('// Mega form entries keyed by parent Pokemon ID');
lines.push('// Each entry maps base pokemon id → mega forms array');
lines.push('export const megaFormsByParentId: Record<string, PokemonForm[]> = {');

// Group by baseId
const byBaseId = new Map();
for (const m of megaData) {
  if (!byBaseId.has(m.baseId)) byBaseId.set(m.baseId, []);
  byBaseId.get(m.baseId).push(m);
}

for (const [baseId, forms] of byBaseId) {
  lines.push(`  '${baseId}': [`);
  for (const m of forms) {
    lines.push('    {');
    lines.push(`      id: '${m.megaId}',`);
    lines.push(`      pokemonId: '${m.baseId}',`);
    lines.push(`      name: '${m.englishName}',`);
    lines.push(`      chineseName: '${m.chineseName}',`);
    lines.push(`      englishName: '${m.englishName}',`);
    lines.push(`      japaneseName: '${m.japaneseName}',`);
    lines.push(`      iconRef: artwork(${m.spriteId}),`);
    lines.push(`      isMega: true,`);
    lines.push(`      requiredItemId: '${m.megaStoneId}',`);
    lines.push(`      types: [${m.types.map((t) => `'${t}'`).join(', ')}],`);
    lines.push(`      baseStats: { hp: ${m.stats.hp}, attack: ${m.stats.attack}, defense: ${m.stats.defense}, specialAttack: ${m.stats.specialAttack}, specialDefense: ${m.stats.specialDefense}, speed: ${m.stats.speed} },`);
    lines.push(`      abilities: ['${m.abilityId}'],`);
    lines.push(`      legalInCurrentRule: true,`);
    lines.push(`      sourceRefs: megaRefs,`);
    lines.push('    },');
  }
  lines.push('  ],');
}
lines.push('};');
lines.push('');

// Also export the mega stone -> parent mapping
lines.push('// Mega Stone ID → parent Pokemon ID mapping');
lines.push('export const megaStoneParentMap: Record<string, string> = {');
for (const m of megaData) {
  lines.push(`  '${m.megaStoneId}': '${m.baseId}',`);
}
lines.push('};');
lines.push('');

// Also export which base Pokemon can mega evolve
lines.push('// Base Pokemon IDs that can Mega evolve (old-gen, with data)');
lines.push('export const megaCapableBaseIds = new Set([');
for (const baseId of byBaseId.keys()) {
  lines.push(`  '${baseId}',`);
}
lines.push(']);');
lines.push('');

// Champions-only list for documentation
lines.push('// Champions-only Megas (no old-gen data, never fabricate)');
lines.push('export const championsOnlyMegaNames = new Set([');
for (const name of CHAMPIONS_ONLY_MEGAS) {
  lines.push(`  '${name}',`);
}
lines.push(']);');

const output = lines.join('\n');
await writeFile(OUTPUT, output, 'utf8');
console.log(`\nWrote ${megaData.length} mega forms (${byBaseId.size} base Pokemon) to ${OUTPUT}`);
console.log(`Champions-only (not fabricated): ${CHAMPIONS_ONLY_MEGAS.size} entries`);
