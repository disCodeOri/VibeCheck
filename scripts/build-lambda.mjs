import {rm,mkdir,readFile,writeFile,cp,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {build} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'build','lambda');
if(path.relative(root,out)!==path.join('build','lambda'))throw new Error('Unexpected build output directory');
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await build({entryPoints:[path.join(root,'server','lambda.ts')],outfile:path.join(out,'lambda.js'),bundle:true,platform:'node',target:'node22',format:'cjs',sourcemap:true,external:['sharp','@cedar-policy/cedar-wasm'],logLevel:'info'});
await writeFile(path.join(out,'package.json'),JSON.stringify({type:'commonjs',private:true}));

const npmCli=process.env.npm_execpath;
if(!npmCli)throw new Error('Run this script with npm run build:lambda');
async function install(packages,extra=[]){await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[npmCli,'install','--omit=dev','--no-package-lock','--os=linux','--cpu=x64',...extra,...packages],{cwd:out,stdio:'inherit',shell:false});
  child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(new Error(`Linux sharp install exited ${code}`)));
});}
await install([`sharp@${pkg.dependencies.sharp}`,`@cedar-policy/cedar-wasm@${pkg.dependencies['@cedar-policy/cedar-wasm']}`]);
// Some Windows npm versions omit foreign optional binaries. Install the exact Linux
// dependencies explicitly and fail the build unless both files are present.
const sharpPackage=JSON.parse(await readFile(path.join(out,'node_modules/sharp/package.json'),'utf8'));
const linuxPackages=['@img/sharp-linux-x64','@img/sharp-libvips-linux-x64'];
await install(linuxPackages.map(name=>`${name}@${sharpPackage.optionalDependencies[name]}`),['--force','--ignore-scripts']);
if(!(await readdir(path.join(out,'node_modules/@img/sharp-linux-x64/lib'))).some(file=>file.endsWith('.node')))throw new Error('Linux sharp binary is missing');
if(!(await readdir(path.join(out,'node_modules/@img/sharp-libvips-linux-x64/lib'))).some(file=>file.startsWith('libvips-cpp.so')))throw new Error('Linux libvips binary is missing');
const license=path.join(root,'LICENSE');
try{await cp(license,path.join(out,'LICENSE'));}catch{}
