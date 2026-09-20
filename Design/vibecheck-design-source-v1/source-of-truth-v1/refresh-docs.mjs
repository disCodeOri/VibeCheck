import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const registry=JSON.parse(fs.readFileSync(path.join(root,'screens.json'),'utf8'));
const screens=registry.screens;
const flows=JSON.parse(fs.readFileSync(path.join(root,'flows.json'),'utf8'));
const ids=new Set(screens.map(s=>s.id));
if(ids.size!==screens.length)throw Error('Duplicate screen ID');
for(const s of screens){if(!s.rules.length||!s.actions.length)throw Error('Incomplete contract '+s.id);for(const a of s.actions)if(!ids.has(a.to))throw Error('Missing destination '+s.id+' '+a.to);if(s.back&&!ids.has(s.back))throw Error('Missing back destination '+s.id);}
for(const f of flows)for(const id of f.ids)if(!ids.has(id))throw Error('Missing journey screen '+id);
fs.writeFileSync(path.join(root,'data.js'),'window.DESIGN='+JSON.stringify({screens,flows})+';\n');
let md='# Full user workflows\n\nAll screen IDs resolve to screens.json. Both styles use the same contracts. Branches, guards and return destinations below take precedence over the representative linear journey.\n\n## Connected journeys\n\n';
for(const f of flows)md+='### '+f.name+'\n\n'+f.ids.map((id,i)=>(i+1)+'. **'+id+'** — '+screens.find(s=>s.id===id).title).join('\n')+'\n\n';
md+='## Screen contracts\n\n';
for(const s of screens){md+='### '+s.id+' — '+s.title+'\n\n**Workflow:** '+s.flow+' · **Layout:** '+s.layout+' · **Back:** '+(s.back||'Root')+'\n\n'+s.copy+'\n\n**Desktop:** '+s.desktop+'\n\n**Mobile:** '+s.mobile+'\n\n';if(s.fields.length)md+='**Fields and choices**\n\n'+s.fields.map(f=>'- '+f.label+' ('+f.type+')'+(f.options.length?': '+f.options.join(', '):'')+(f.value?' — initial example: '+f.value:'')).join('\n')+'\n\n';md+='**Actions and destinations**\n\n'+s.actions.map(a=>'- **'+a.label+'** — '+a.to+'. '+a.effect).join('\n')+'\n\n**Rules**\n\n'+s.rules.map(r=>'- '+r).join('\n')+'\n\n';}
fs.writeFileSync(path.join(root,'WORKFLOWS.md'),md);
console.log(JSON.stringify({screens:screens.length,journeys:flows.length,actions:screens.reduce((n,s)=>n+s.actions.length,0),validated:true}));
