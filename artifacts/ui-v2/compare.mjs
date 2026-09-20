import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='artifacts/ui-v2';
const specs=[['home','01-story-and-expression.png',302,112,347,819],['story','01-story-and-expression.png',696,112,350,819],['loox','02-loox-and-chicfit.png',303,112,346,819],['wardrobe','02-loox-and-chicfit.png',696,112,350,819]];
for(const [name,source,left,top,width,height] of specs){
  const ref=await sharp(`Design/integrated-male-v1/${source}`).extract({left,top,width,height}).resize({width:390}).png().toBuffer();
  const impl=await sharp(`${root}/${name}.png`).resize({width:390}).png().toBuffer();
  const rh=(await sharp(ref).metadata()).height, ih=(await sharp(impl).metadata()).height;
  await sharp({create:{width:800,height:Math.max(rh,ih),channels:3,background:'#e1e8f0'}}).composite([{input:ref,left:0,top:0},{input:impl,left:410,top:0}]).png().toFile(`${root}/${name}-comparison.png`);
  console.log(name,JSON.stringify({sourceCrop:[width,height],referenceNormalized:[390,rh],implementation:await sharp(`${root}/${name}.png`).metadata().then(({width,height})=>[width,height])}));
}
