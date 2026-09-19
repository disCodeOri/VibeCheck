const fs=require('fs');
const path=require('path');
const sharp=require('C:/Users/Sri-Krishna/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'vibecheck-main.svg');
async function main(){
  const s=fs.readFileSync(file,'utf8');
  const defs=s.match(/<defs>(.*?)<\/defs>/s)[0];
  if(process.argv.includes('--masks')){
    for(const part of ['upper','lower']){
      const mask=`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="600">${defs}<rect width="1536" height="600" fill="black"/><use href="#${part}-shape" fill="white"/>${part==='lower'?'<use href="#upper-shape" fill="black"/>':''}</svg>`;
      await sharp(Buffer.from(mask)).png().toFile(path.join(__dirname,part+'-mask.png'));
    }
  }
  await sharp(file,{density:144}).flatten({background:'#ffffff'}).png().toFile(path.join(root,'vibecheck-main-preview.png'));
  await sharp(file,{density:72}).png().toFile(path.join(__dirname,'transparent-check.png'));
  console.log('Rendered previews and requested masks.');
}
main();
