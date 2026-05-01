import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const BATCH_SIZE = 40;
const BATCH_NUMBER = 1;
const CACHE_DIR = resolve(ROOT, '.npm-cache', 'pokeapi');
const POKEAPI = 'https://pokeapi.co/api/v2';

const ALLOWLIST_PATH = resolve(ROOT, 'src/data/seed/regMA/allowlist.ts');
const CATALOG_PATH = resolve(ROOT, 'src/data/seed/regMA/catalog.ts');
const BATCH_OUTPUT = resolve(ROOT, `src/data/seed/regMA/catalog-batch-${String(BATCH_NUMBER).padStart(3, '0')}.ts`);

const batchSourceRefs = [
  'reg-ma-official-eligible-pokemon',
  'pokeapi-pokemon-data',
  'pokeapi-official-artwork',
  'manual-seed-review',
];

const artwork = (n) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${n}.png`;

await mkdir(CACHE_DIR, { recursive: true });

// ── Cache helpers ──────────────────────────────────────────────

async function cachedFetch(url) {
  const key = url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 200);
  const cachePath = resolve(CACHE_DIR, `${key}.json`);
  if (existsSync(cachePath)) {
    return JSON.parse(await readFile(cachePath, 'utf8'));
  }
  console.log(`  GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const data = await res.json();
  await writeFile(cachePath, JSON.stringify(data));
  return data;
}

async function pokeapi(endpoint) {
  return cachedFetch(`${POKEAPI}${endpoint}`);
}

// ── Name helpers ───────────────────────────────────────────────

function findName(names, lang) {
  const entry = names?.find((n) => n.language?.name === lang);
  return entry?.name ?? undefined;
}

// ── Type mapping ───────────────────────────────────────────────

const TYPE_MAP = {
  normal: 'Normal', fire: 'Fire', water: 'Water', electric: 'Electric',
  grass: 'Grass', ice: 'Ice', fighting: 'Fighting', poison: 'Poison',
  ground: 'Ground', flying: 'Flying', psychic: 'Psychic', bug: 'Bug',
  rock: 'Rock', ghost: 'Ghost', dragon: 'Dragon', dark: 'Dark',
  steel: 'Steel', fairy: 'Fairy',
};

function mapType(t) {
  return TYPE_MAP[t] ?? t;
}

// ── Move category mapping ─────────────────────────────────────

const DAMAGE_CLASS = { physical: 'Physical', special: 'Special', status: 'Status' };

// ── Allowlist parsing ──────────────────────────────────────────

async function parseAllowlist() {
  const text = await readFile(ALLOWLIST_PATH, 'utf8');
  const entries = [];
  const re = /\{\s*\n\s*id:\s*'([^']+)',\s*\n(?:\s*pokemonId:\s*'([^']+)',\s*\n)?\s*championsFormId:\s*'([^']+)',\s*\n\s*nationalDexNo:\s*(\d+),\s*\n\s*englishName:\s*'([^']+)'(?:,\s*\n\s*formName:\s*'([^']+)')?/g;
  let m;
  while ((m = re.exec(text))) {
    entries.push({
      id: m[1],
      pokemonId: m[2] || undefined,
      championsFormId: m[3],
      nationalDexNo: Number(m[4]),
      englishName: m[5],
      formName: m[6] || undefined,
    });
  }
  return entries;
}

// ── Existing catalog IDs ───────────────────────────────────────

async function getExistingIds() {
  const text = await readFile(CATALOG_PATH, 'utf8');
  const pokemonIds = new Set();
  const abilityIds = new Set();
  const moveIds = new Set();
  const pokeRe = /id:\s*'([^']+)'/g;
  // Collect pokemon IDs from the pokemon array
  const pokeSection = text.slice(text.indexOf('export const pokemon: Pokemon[]'));
  let m;
  while ((m = pokeRe.exec(pokeSection))) {
    pokemonIds.add(m[1]);
  }
  // Collect ability IDs from abilities array
  const abilitySection = text.slice(0, text.indexOf('export const items:'));
  while ((m = pokeRe.exec(abilitySection))) {
    abilityIds.add(m[1]);
  }
  // Collect move IDs from moves array
  const moveSection = text.slice(text.indexOf('export const moves: Move[]'));
  while ((m = pokeRe.exec(moveSection))) {
    moveIds.add(m[1]);
  }
  return { pokemonIds, abilityIds, moveIds };
}

// ── PokeAPI data fetching ──────────────────────────────────────

async function fetchPokemonData(nationalDexNo) {
  const [poke, species] = await Promise.all([
    pokeapi(`/pokemon/${nationalDexNo}/`),
    pokeapi(`/pokemon-species/${nationalDexNo}/`),
  ]);
  return { poke, species };
}

function extractBaseStats(poke) {
  const s = {};
  for (const stat of poke.stats) {
    const name = stat.stat.name;
    if (name === 'hp') s.hp = stat.base_stat;
    else if (name === 'attack') s.attack = stat.base_stat;
    else if (name === 'defense') s.defense = stat.base_stat;
    else if (name === 'special-attack') s.specialAttack = stat.base_stat;
    else if (name === 'special-defense') s.specialDefense = stat.base_stat;
    else if (name === 'speed') s.speed = stat.base_stat;
  }
  return s;
}

function extractAbilities(poke) {
  return poke.abilities
    .sort((a, b) => a.slot - b.slot)
    .map((a) => a.ability.name);
}

function extractLearnableMoves(poke) {
  const moveSet = new Set();
  for (const m of poke.moves) {
    const hasRecent = m.version_group_details.some((d) => {
      const vg = d.version_group?.name ?? '';
      return vg.includes('scarlet') || vg.includes('violet') || vg.includes('sword') || vg.includes('shield') || vg === 'legends-arceus';
    });
    if (hasRecent) {
      moveSet.add(m.move.name);
    }
  }
  if (moveSet.size === 0) {
    // Fallback: take all level-up moves from any version
    for (const m of poke.moves) {
      if (m.version_group_details.some((d) => d.move_learn_method?.name === 'level-up')) {
        moveSet.add(m.move.name);
      }
    }
  }
  return [...moveSet];
}

// ── Ability effect summary generation ──────────────────────────

async function fetchAbilityChineseData(abilityName) {
  try {
    const data = await pokeapi(`/ability/${abilityName}/`);
    const zhName = findName(data.names, 'zh-hans');
    const zhEffect = data.effect_entries?.find((e) => e.language?.name === 'zh-hans');
    const enEffect = data.effect_entries?.find((e) => e.language?.name === 'en');
    const shortEntry = zhEffect || enEffect;
    const effectSummary = shortEntry
      ? shortEntry.short_effect?.replace(/\n/g, ' ').trim()
      : undefined;
    return { zhName, effectSummary };
  } catch {
    return { zhName: undefined, effectSummary: undefined };
  }
}

// ── Generate ability effect summary ────────────────────────────

function abilityEffectSummary(abilityId, apiSummary) {
  if (apiSummary) return apiSummary;
  // Fallback based on known ability IDs
  const known = {
    'static': '被接触时可能麻痹对手。',
    'lightning-rod': '吸引电属性招式并提升特攻。',
    'torrent': 'HP 降低时强化水属性招式。',
    'swarm': 'HP 降低时强化虫属性招式。',
    'keen-eye': '命中率不会被降低。',
    'tangled-feet': '混乱时提升闪避。',
    'shed-skin': '每回合有概率解除异常状态。',
    'inner-focus': '不会被畏缩。',
    'steadfast': '畏缩时速度提升。',
    'flash-fire': '受到火属性招式时提升自身火属性威力。',
    'unnerve': '让对手无法使用树果。',
    'mold-breaker': '无视对手特性造成招式效果。',
    'poison-point': '被接触时可能使对手中毒。',
    'rivalry': '面对同性对手时威力提升，异性时降低。',
    'cute-charm': '被接触时可能使对手着迷。',
    'magic-guard': '只受到攻击伤害，不受其他方式造成的伤害。',
    'unaware': '无视对手能力变化。',
    'limber': '不会被麻痹。',
    'water-veil': '不会被灼伤。',
    'anger-point': '被击中要害后攻击大幅提升。',
    'defiant': '能力被降低时攻击提升。',
    'justified': '被恶属性招式打中后攻击提升。',
    'rattled': '被恶/幽灵/虫属性招式影响时速度提升。',
    'magic-bounce': '反射部分变化招式。',
    'prankster': '先制使用变化招式。',
    'regenerator': '换下场时回复 HP。',
    'sturdy': '满 HP 时不会被一击打倒。',
    'multiscale': '满 HP 时受到的伤害降低。',
    'scrappy': '一般/格斗属性招式也能击中幽灵属性对手。',
    'speed-boost': '每回合结束时速度提升。',
    'compound-eyes': '命中率提升。',
    'no-guard': '双方招式均必定命中。',
    'huge-power': '攻击力大幅提升。',
    'pure-power': '攻击力大幅提升。',
    'adaptability': '同属性加成进一步增强。',
    'technician': '弱威力招式威力提升。',
    'iron-fist': '拳击类招式威力提升。',
    'reckless': '有反作用伤害的招式威力提升。',
    'sheer-force': '有追加效果的招式威力提升，但不再触发附加效果。',
    'pressure': '对手使用招式时消耗更多 PP。',
    'snow-warning': '登场时开启冰雹。',
    'sand-stream': '登场时开启沙暴。',
    'electric-surge': '登场时开启电场。',
    'psychic-surge': '登场时开启精神场地。',
    'grassy-surge': '登场时开启青草场地。',
    'misty-surge': '登场时开启薄雾场地。',
    'truant': '每两回合中只能行动一回。',
    'slow-start': '登场后一段时间内攻击和速度降低。',
    'defeatist': 'HP 降低时攻击下降。',
    'guts': '异常状态时攻击提升。',
    'marvel-scale': '异常状态时防御提升。',
    'quick-feet': '异常状态时速度提升。',
    'toxic-boost': '中毒时物理招式威力提升。',
    'flare-boost': '灼伤时特殊招式威力提升。',
    'harvest': '消耗树果后有概率再生。',
    'infiltrator': '可以突破光墙/反射壁/替身。',
    'competitive': '能力被降低时特攻提升。',
    'strong-jaw': '啃咬类招式威力提升。',
    'mega-launcher': '波动类招式威力提升。',
    'moxie': '打倒对手后攻击提升。',
    'beast-boost': '打倒对手后最高一项能力提升。',
  };
  return known[abilityId] ?? '待确认特性效果。';
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('Parsing allowlist...');
  const allowlist = await parseAllowlist();
  console.log(`Found ${allowlist.length} allowlist entries`);

  const { pokemonIds: existingPokeIds, abilityIds: existingAbilityIds, moveIds: existingMoveIds } = await getExistingIds();
  console.log(`Existing catalog: ${existingPokeIds.size} pokemon, ${existingAbilityIds.size} abilities, ${existingMoveIds.size} moves`);

  // Select batch: base-form entries without catalog pokemonId
  const candidates = allowlist.filter((e) => !e.formName && !existingPokeIds.has(e.pokemonId ?? `poke-${e.nationalDexNo}`));
  // Remove already-processed ones by checking if their pokemonId exists in catalog
  const batch = candidates.filter((e) => {
    // Entry already has a pokemonId that's in the catalog - skip
    if (e.pokemonId && existingPokeIds.has(e.pokemonId)) return false;
    return true;
  }).slice(0, BATCH_SIZE);

  console.log(`Processing batch of ${batch.length} Pokemon...`);

  const newPokemon = [];
  const newAbilities = [];
  const newMoves = [];
  const allAbilityIds = new Set();
  const allMoveIds = new Set();
  let errors = 0;

  for (let i = 0; i < batch.length; i++) {
    const entry = batch[i];
    const dexNo = entry.nationalDexNo;
    const pct = `[${i + 1}/${batch.length}]`;

    try {
      console.log(`${pct} #${dexNo} ${entry.englishName}...`);
      const { poke, species } = await fetchPokemonData(dexNo);

      const pokemonId = poke.name; // PokeAPI canonical lowercase id
      const zhName = findName(species.names, 'zh-hans') || entry.englishName;
      const jaName = findName(species.names, 'ja-hrkt') || findName(species.names, 'ja') || '';
      const types = poke.types.map((t) => mapType(t.type.name));
      const baseStats = extractBaseStats(poke);
      const abilities = extractAbilities(poke);
      const learnableMoves = extractLearnableMoves(poke);

      // Track new abilities
      for (const ab of abilities) {
        if (!existingAbilityIds.has(ab)) {
          allAbilityIds.add(ab);
        }
      }
      // Filter learnableMoves to only include moves already in the catalog
      const filteredMoves = learnableMoves.filter((m) => existingMoveIds.has(m));
      // If no existing moves match, default to 'protect' which every Pokemon can learn
      const finalMoves = filteredMoves.length > 0 ? filteredMoves : (existingMoveIds.has('protect') ? ['protect'] : []);

      // Check mega eligibility against megaAllowlist names
      const megaAllowlistNames = new Set([
        'Mega Venusaur','Mega Charizard X','Mega Charizard Y','Mega Blastoise','Mega Beedrill',
        'Mega Pidgeot','Mega Clefable','Mega Alakazam','Mega Victreebel','Mega Slowbro',
        'Mega Gengar','Mega Kangaskhan','Mega Starmie','Mega Pinsir','Mega Gyarados',
        'Mega Aerodactyl','Mega Dragonite','Mega Meganium','Mega Feraligatr','Mega Ampharos',
        'Mega Steelix','Mega Scizor','Mega Heracross','Mega Skarmory','Mega Houndoom',
        'Mega Tyranitar','Mega Gardevoir','Mega Sableye','Mega Aggron','Mega Medicham',
        'Mega Manectric','Mega Sharpedo','Mega Camerupt','Mega Altaria','Mega Banette',
        'Mega Chimecho','Mega Absol','Mega Glalie','Mega Lopunny','Mega Garchomp',
        'Mega Lucario','Mega Abomasnow','Mega Gallade','Mega Froslass','Mega Emboar',
        'Mega Excadrill','Mega Audino','Mega Chandelure','Mega Golurk','Mega Chesnaught',
        'Mega Delphox','Mega Greninja','Mega Floette','Mega Meowstic','Mega Hawlucha',
        'Mega Crabominable','Mega Drampa','Mega Scovillain','Mega Glimmora',
      ]);
      const canMega = megaAllowlistNames.has(`Mega ${entry.englishName}`);

      const isExistingPoke = existingPokeIds.has(pokemonId);

      newPokemon.push({
        id: pokemonId,
        nationalDexNo: dexNo,
        chineseName: zhName,
        englishName: entry.englishName,
        japaneseName: jaName,
        iconRef: artwork(dexNo),
        types,
        baseStats,
        legalInCurrentRule: true,
        forms: [],
        abilities,
        learnableMoves: finalMoves,
        canMega: false,
        megaForms: [],
        notes: `Batch ${String(BATCH_NUMBER).padStart(3, '0')} catalog row from PokeAPI structured data joined to official Reg M-A allowlist. Manual review still required.`,
        sourceRefs: batchSourceRefs,
      });
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      errors++;
    }

    // Small delay to be polite to PokeAPI
    if (i < batch.length - 1) {
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  // Fetch ability Chinese names
  console.log(`\nFetching Chinese names for ${allAbilityIds.size} new abilities...`);
  const abilityData = new Map();
  let abIdx = 0;
  for (const abId of allAbilityIds) {
    abIdx++;
    try {
      const { zhName, effectSummary } = await fetchAbilityChineseData(abId);
      abilityData.set(abId, { zhName, effectSummary });
      if (abIdx % 10 === 0) console.log(`  Ability ${abIdx}/${allAbilityIds.size}`);
    } catch {
      abilityData.set(abId, { zhName: undefined, effectSummary: undefined });
    }
    if (abIdx < allAbilityIds.size) await new Promise((r) => setTimeout(r, 100));
  }

  // Build ability entries
  for (const [abId, { zhName, effectSummary }] of abilityData) {
    const pokemonWithAbility = newPokemon
      .filter((p) => p.abilities.includes(abId))
      .map((p) => p.id);

    const knownEffect = abilityEffectSummary(abId, effectSummary);
    newAbilities.push({
      id: abId,
      chineseName: zhName || abId.charAt(0).toUpperCase() + abId.slice(1),
      englishName: abId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      effectSummary: knownEffect,
      pokemonIds: pokemonWithAbility,
      calculationImpact: 'pending',
      legalInCurrentRule: true,
      sourceRefs: batchSourceRefs,
    });
  }

  // ── Generate output file ──────────────────────────────────────

  const escapeStr = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const lines = [];

  lines.push(`// Auto-generated batch ${BATCH_NUMBER}: ${newPokemon.length} Pokemon, ${newAbilities.length} abilities`);
  lines.push(`// Generated from PokeAPI on ${new Date().toISOString()}`);
  lines.push(`// Source: ${POKEAPI}`);
  lines.push('');
  lines.push("import type { Ability, Pokemon } from '../../../types';");
  lines.push('');
  lines.push(`const batchRefs = ['reg-ma-official-eligible-pokemon', 'pokeapi-pokemon-data', 'pokeapi-official-artwork', 'manual-seed-review'];`);
  lines.push(`const artwork = (n: number) => \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${n}.png\`;`);
  lines.push('');

  // Abilities
  lines.push(`export const abilitiesBatch${String(BATCH_NUMBER).padStart(3, '0')}: Ability[] = [`);
  for (const ab of newAbilities) {
    lines.push('  {');
    lines.push(`    id: '${escapeStr(ab.id)}',`);
    lines.push(`    chineseName: '${escapeStr(ab.chineseName)}',`);
    lines.push(`    englishName: '${escapeStr(ab.englishName)}',`);
    lines.push(`    effectSummary: '${escapeStr(ab.effectSummary)}',`);
    lines.push(`    pokemonIds: [${ab.pokemonIds.map((id) => `'${escapeStr(id)}'`).join(', ')}],`);
    lines.push(`    calculationImpact: 'pending',`);
    lines.push(`    legalInCurrentRule: true,`);
    lines.push(`    sourceRefs: batchRefs,`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');

  // Pokemon
  lines.push(`export const pokemonBatch${String(BATCH_NUMBER).padStart(3, '0')}: Pokemon[] = [`);
  for (const p of newPokemon) {
    lines.push('  {');
    lines.push(`    id: '${escapeStr(p.id)}',`);
    lines.push(`    nationalDexNo: ${p.nationalDexNo},`);
    lines.push(`    chineseName: '${escapeStr(p.chineseName)}',`);
    lines.push(`    englishName: '${escapeStr(p.englishName)}',`);
    lines.push(`    japaneseName: '${escapeStr(p.japaneseName)}',`);
    lines.push(`    iconRef: artwork(${p.nationalDexNo}),`);
    lines.push(`    types: [${p.types.map((t) => `'${t}'`).join(', ')}],`);
    lines.push(`    baseStats: { hp: ${p.baseStats.hp}, attack: ${p.baseStats.attack}, defense: ${p.baseStats.defense}, specialAttack: ${p.baseStats.specialAttack}, specialDefense: ${p.baseStats.specialDefense}, speed: ${p.baseStats.speed} },`);
    lines.push(`    legalInCurrentRule: true,`);
    lines.push(`    forms: [],`);
    lines.push(`    abilities: [${p.abilities.map((a) => `'${escapeStr(a)}'`).join(', ')}],`);
    lines.push(`    learnableMoves: [${p.learnableMoves.map((m) => `'${escapeStr(m)}'`).join(', ')}],`);
    lines.push(`    canMega: false,`);
    lines.push(`    megaForms: [],`);
    lines.push(`    notes: '${escapeStr(p.notes)}',`);
    lines.push(`    sourceRefs: batchRefs,`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');

  const output = lines.join('\n');
  await writeFile(BATCH_OUTPUT, output, 'utf8');
  console.log(`\nWrote ${newPokemon.length} Pokemon + ${newAbilities.length} abilities to ${BATCH_OUTPUT}`);

  if (errors > 0) {
    console.log(`\nWARNING: ${errors} Pokemon failed to fetch.`);
  }

  // ── Update catalog.ts to import and spread the batch ──────────

  console.log('\nUpdating catalog.ts...');
  let catalog = await readFile(CATALOG_PATH, 'utf8');

  // Check if already imported
  if (catalog.includes(`catalog-batch-${String(BATCH_NUMBER).padStart(3, '0')}`)) {
    console.log('  Batch already imported in catalog.ts, skipping.');
    return;
  }

  // Add import line after the existing import
  catalog = catalog.replace(
    "import type { Ability, Item, Move, Pokemon } from '../../../types';",
    `import type { Ability, Item, Move, Pokemon } from '../../../types';\nimport { pokemonBatch${String(BATCH_NUMBER).padStart(3, '0')}, abilitiesBatch${String(BATCH_NUMBER).padStart(3, '0')} } from './catalog-batch-${String(BATCH_NUMBER).padStart(3, '0')}';`,
  );

  // Spread batch abilities into the abilities array
  catalog = catalog.replace(
    'export const abilities: Ability[] = [',
    `export const abilities: Ability[] = [\n  ...abilitiesBatch${String(BATCH_NUMBER).padStart(3, '0')},`,
  );

  // Spread batch pokemon into the pokemon array
  catalog = catalog.replace(
    'export const pokemon: Pokemon[] = [',
    `export const pokemon: Pokemon[] = [\n  ...pokemonBatch${String(BATCH_NUMBER).padStart(3, '0')},`,
  );

  await writeFile(CATALOG_PATH, catalog, 'utf8');
  console.log('  Done.');

  console.log('\nBatch generation complete!');
  console.log(`Run: npm test       to verify`);
  console.log(`Run: npm run build  to verify`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
