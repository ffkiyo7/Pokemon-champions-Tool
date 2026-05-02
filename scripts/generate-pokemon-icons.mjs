import { writeFile, readFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ASSETS_DIR = resolve(ROOT, 'public/assets/pokemon/icons');
const CATALOG_DIR = resolve(ROOT, 'src/data/seed/regMA');

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const UA = 'PokemonChampionsTool/1.0';

await mkdir(ASSETS_DIR, { recursive: true });

// ── Collect all sprite IDs from catalog files ──

const files = (await readdir(CATALOG_DIR)).filter(f => f.endsWith('.ts'));
const allText = [];
for (const f of files) {
  allText.push(await readFile(resolve(CATALOG_DIR, f), 'utf8'));
}
const combined = allText.join('\n');

// Find all artwork() and formArtwork() calls
const spriteIds = new Set();
const re = /(?:form)?[Aa]rtwork\((\d+)\)/g;
let m;
while ((m = re.exec(combined))) {
  spriteIds.add(Number(m[1]));
}

console.log(`Found ${spriteIds.size} unique sprite IDs`);

// Also include national dex numbers for base forms
const dexRe = /nationalDexNo:\s*(\d+)/g;
while ((m = dexRe.exec(combined))) {
  spriteIds.add(Number(m[1]));
}

console.log(`After adding national dex numbers: ${spriteIds.size} total sprite IDs`);

// ── Download sprites ──

const failures = [];
let idx = 0;
const ids = [...spriteIds].sort((a, b) => a - b);

for (const id of ids) {
  idx++;
  const outPath = resolve(ASSETS_DIR, `${id}.png`);

  // Skip if already exists and non-empty
  if (existsSync(outPath)) {
    const stat = await readFile(outPath).then(b => b.length).catch(() => 0);
    if (stat > 0) {
      if (idx % 50 === 0) console.log(`  [${idx}/${ids.length}] skipped ${id}.png (cached)`);
      continue;
    }
  }

  const url = `${SPRITE_BASE}/${id}.png`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) {
      failures.push({ id, reason: `HTTP ${r.status}` });
      continue;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length === 0) {
      failures.push({ id, reason: 'empty response' });
      continue;
    }
    await writeFile(outPath, buf);
    if (idx % 20 === 0) console.log(`  [${idx}/${ids.length}] ${id}.png (${buf.length} bytes)`);
  } catch (e) {
    failures.push({ id, reason: e.message });
  }

  // Be polite
  if (idx % 5 === 0) await new Promise(r => setTimeout(r, 100));
}

console.log(`\nDownloaded: ${ids.length - failures.length}/${ids.length}`);
if (failures.length > 0) {
  console.error(`FAILURES (${failures.length}):`);
  failures.forEach(f => console.error(`  ${f.id}: ${f.reason}`));
  process.exit(1);
}
console.log('All sprites downloaded successfully.');
