import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(async e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat()}
const files=(await walk('dist')).filter(f=>!f.endsWith('sw.js')).map(f=>'/'+path.relative('dist',f).split(path.sep).join('/'));
const assets=['/',...files];
const hash=createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0,12);
const template=await readFile('public/sw.js','utf8');
await writeFile('dist/sw.js',template.replace("const CACHE='vibecheck-v1';",`const CACHE='vibecheck-${hash}';`).replace("['/','/brand/icon.svg','/assets/portrait.png','/assets/portrait-close.png','/assets/garments.png']",JSON.stringify(assets)));
console.log(`Offline cache prepared: ${assets.length} local assets, including all app screens.`);
