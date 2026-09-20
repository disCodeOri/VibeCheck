import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const registry=JSON.parse(fs.readFileSync(path.join(root,'screens.json'),'utf8'));
const flows=JSON.parse(fs.readFileSync(path.join(root,'flows.json'),'utf8'));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
if(JSON.stringify(context.window.DESIGN.screens)!==JSON.stringify(registry.screens))throw Error('Registry and viewer differ');
const ids=new Set(registry.screens.map(s=>s.id));
const missing=registry.screens.flatMap(s=>s.actions.filter(a=>!ids.has(a.to)).map(a=>s.id+':'+a.to));
if(missing.length)throw Error('Broken action destinations: '+missing.join(','));
const workflowText=fs.readFileSync(path.join(root,'WORKFLOWS.md'),'utf8');
for(const s of registry.screens)if(!workflowText.includes('### '+s.id+' —'))throw Error('Missing written screen '+s.id);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const ref=match[1];if(!/^(https?:|data:)/.test(ref)&&!fs.existsSync(path.join(root,ref)))throw Error('Missing local document '+ref);}
const images=[];
for(const style of ['female','male'])for(const file of fs.readdirSync(path.join(root,'visuals',style)).filter(x=>x.endsWith('.png'))){const b=fs.readFileSync(path.join(root,'visuals',style,file));if(b.subarray(1,4).toString()!=='PNG')throw Error('Invalid PNG '+file);images.push({style,file,width:b.readUInt32BE(16),height:b.readUInt32BE(20)});}
if(images.length!==12)throw Error('Expected 12 desktop targets');
console.log(JSON.stringify({screens:ids.size,journeys:flows.length,actions:registry.screens.reduce((n,s)=>n+s.actions.length,0),missingDestinations:missing.length,desktopTargets:images,viewerMatchesRegistry:true,documentsPresent:true},null,2));
