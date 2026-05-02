import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGMA_DIR = resolve(__dirname, '..', 'src', 'data', 'seed', 'regMA');

const files = (await readdir(REGMA_DIR)).filter(f => f.endsWith('.ts'));

const OLD = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const NEW = '/assets/pokemon/icons';

let count = 0;
for (const f of files) {
  const fp = resolve(REGMA_DIR, f);
  let content = await readFile(fp, 'utf8');
  if (content.includes(OLD)) {
    content = content.replaceAll(OLD, NEW);
    await writeFile(fp, content, 'utf8');
    console.log(`Updated: ${f}`);
    count++;
  }
}
console.log(`\nUpdated ${count} files.`);
