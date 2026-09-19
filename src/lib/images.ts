export async function readImage(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP photo.');
 if(file.size>12*1024*1024)throw new Error('Choose a photo smaller than 12 MB.');
 const bitmap=await createImageBitmap(file).catch(()=>{throw new Error('That photo could not be opened. Try another file.')});
 const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const c=document.createElement('canvas');c.width=Math.round(bitmap.width*scale);c.height=Math.round(bitmap.height*scale);const ctx=c.getContext('2d')!;ctx.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();return c.toDataURL('image/jpeg',.88);
}
export async function imageData(src:string):Promise<string>{
 if(src.startsWith('data:'))return src;
 const [path,index]=src.split('#');const r=await fetch(path);if(!r.ok)throw new Error('Could not load the photo.');const b=await createImageBitmap(await r.blob());const c=document.createElement('canvas');const ctx=c.getContext('2d')!;
 if(index!==undefined){const i=Number(index);c.width=b.width/3;c.height=b.height/2;ctx.drawImage(b,(i%3)*c.width,Math.floor(i/3)*c.height,c.width,c.height,0,0,c.width,c.height)}else{const s=Math.min(1,1600/Math.max(b.width,b.height));c.width=b.width*s;c.height=b.height*s;ctx.drawImage(b,0,0,c.width,c.height)}b.close();return c.toDataURL('image/jpeg',.88);
}
export async function cropImage(src:string,zoom:number,offset:number,ratio:number):Promise<string>{const img=new Image();img.src=src;await img.decode();const c=document.createElement('canvas');c.width=1080;c.height=Math.round(1080/ratio);const ctx=c.getContext('2d')!;const base=Math.max(c.width/img.width,c.height/img.height)*zoom;const w=img.width*base,h=img.height*base;ctx.drawImage(img,(c.width-w)/2,(c.height-h)*(offset/100),w,h);return c.toDataURL('image/jpeg',.94)}
export function download(url:string,name:string){const a=document.createElement('a');a.href=url;a.download=name;a.click()}
export async function outfitBoard(sources:string[]):Promise<string>{
 if(!sources.length)throw new Error('Choose at least one garment for your try-on.');
 if(sources.length===1)return imageData(sources[0]);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1024,1024);
 const cols=2,rows=Math.ceil(sources.length/cols),w=1024/cols,h=1024/rows;
 for(let i=0;i<sources.length;i++){const img=new Image();img.src=await imageData(sources[i]);await img.decode();const scale=Math.min((w-32)/img.width,(h-32)/img.height);ctx.drawImage(img,(i%cols)*w+(w-img.width*scale)/2,Math.floor(i/cols)*h+(h-img.height*scale)/2,img.width*scale,img.height*scale)}
 return canvas.toDataURL('image/jpeg',.9);
}
