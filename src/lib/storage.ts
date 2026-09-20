import { openDB } from 'idb';
import { z } from 'zod';
import type { Profile, Garment, SavedLook, Analysis } from '../../shared/types';
export interface AppState { profile: Profile; garments: Garment[]; saved: SavedLook[] }
export const defaultAvatar = { height: 170, build: 0.45, shoulders: 0.45, skinTone: '#d8aa84', hairColor: '#3a2418', hairStyle: 'medium' as const, presentation: 'feminine' as const };
export const defaultState = (): AppState => ({profile:{name:'',mood:'Effortless',presentation:'feminine',style:'soft',avatar:{...defaultAvatar},consent:false,onboardingDone:false},garments:sampleGarments(),saved:[]});
const db = () => openDB('vibecheck-device',1,{upgrade(d){d.createObjectStore('app')}});
export async function readState():Promise<AppState>{
  const d=await db();
  const s = await d.get('app','state');
  if(!s) return defaultState();
  if(!s.profile.style) s.profile.style = s.profile.presentation === 'masculine' ? 'sharp' : 'soft';
  if(!s.profile.name) s.profile.name = s.profile.style === 'sharp' ? 'Arjun' : 'Maya';
  if(!s.garments || s.garments.length === 0) s.garments = sampleGarments(s.profile.style);
  // Earlier builds seeded every style from one sprite sheet, so a Soft wardrobe
  // could show menswear under womenswear labels. Re-seed only while the
  // wardrobe is still untouched samples; a real piece is never replaced.
  else if(s.garments.every((g:Garment)=>g.id.startsWith('sample-')&&!g.image.startsWith(garmentSheet(s.profile.style))))
    s.garments = sampleGarments(s.profile.style);
  return s;
}
export async function writeState(state:AppState){const d=await db();await d.put('app',state,'state')}
const image=z.string().max(12000000).refine(s=>/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s)||/^\/assets\/[a-zA-Z0-9._-]+(?:#\d)?$/.test(s)||/^\/visuals\/[a-zA-Z0-9._/-]+$/.test(s),'Invalid image');
const color=z.string().regex(/^#[0-9a-f]{6}$/i);
const avatar=z.object({height:z.number().min(145).max(205),build:z.number().min(0).max(1),shoulders:z.number().min(0).max(1),skinTone:color,hairColor:color,hairStyle:z.enum(['short','medium','long']),presentation:z.enum(['masculine','feminine','neutral'])});
const analysis=z.object({score:z.number().min(0).max(100),verdict:z.string().max(200),summary:z.string().max(3000),metrics:z.array(z.object({label:z.string(),score:z.number().min(0).max(100),detail:z.string()})).max(10),tips:z.array(z.string()).max(20),callouts:z.array(z.object({label:z.string(),detail:z.string(),x:z.number().min(0).max(100),y:z.number().min(0).max(100)})).optional(),hairstyles:z.array(z.object({name:z.string(),description:z.string()})).optional(),captions:z.array(z.string()).optional(),source:z.enum(['gemini','bedrock','example','manual'])});
const schema=z.object({version:z.literal(1),state:z.object({profile:z.object({name:z.string().max(80),mood:z.string().max(80),presentation:z.enum(['masculine','feminine','neutral']),style:z.enum(['soft','sharp']).optional(),avatar,photo:image.optional(),bodyPhoto:image.optional(),consent:z.boolean(),onboardingDone:z.boolean()}),garments:z.array(z.object({id:z.string(),name:z.string().max(120),category:z.enum(['tops','bottoms','layers','shoes','accessories']),color,image,createdAt:z.number(),notes:z.string().max(1000).optional()})).max(500),saved:z.array(z.object({id:z.string(),kind:z.enum(['story','loox','outfit']),title:z.string().max(200),image,secondaryImage:image.optional(),analysis,createdAt:z.number(),garmentIds:z.array(z.string()).optional(),avatar:avatar.optional()})).max(500)})});
export function validateBackup(value:unknown):AppState {return schema.parse(value).state}
export const uid=()=>crypto.randomUUID();
export const exampleAnalysis:Analysis={
  score:92,
  verdict:'POST IT.',
  summary:'Warm light. Effortlessly you.',
  metrics:[
    {label:'Mood',score:94,detail:'Your lighting and expression work well together.'},
    {label:'Framing',score:86,detail:'Try a closer crop to keep the focus on you.'},
    {label:'Clarity',score:91,detail:'Clean lines and natural warmth.'}
  ],
  tips:['Try a closer crop to keep the focus on you.','Keep the edit light. The natural colours work.'],
  captions:['Golden hour, good company.','A little less rush.','Right here, right now.'],
  source:'example'
};
export const exampleLoox:Analysis={
  score:93,
  verdict:'LOOKING SHARP.',
  summary:'Soft layers suit your look.',
  metrics:[
    {label:'Styling',score:93,detail:'Natural volume gives the style movement.'},
    {label:'Balance',score:90,detail:'A little shape at the sides brings focus up.'},
    {label:'Versatility',score:88,detail:'Easy to wear with a relaxed finish.'}
  ],
  tips:['Keeps your natural texture — works with what you have, not against it.','Frames your face — adds shape and movement.'],
  callouts:[
    {label:'Natural volume',detail:'Keep some height through the crown.',x:57,y:13},
    {label:'Face-framing',detail:'Soft tendrils frame the face gently.',x:30,y:35},
    {label:'Soft texture',detail:'Gentle wave complements natural shape.',x:65,y:48}
  ],
  hairstyles:[
    {name:'Original',description:'Natural and effortless.'},
    {name:'Soft layers',description:'Modern and flattering.'},
    {name:'Curtain bangs',description:'Fresh and versatile.'}
  ],
  source:'example'
};
/** Sprite sheet of sample garment photos for a style, 3 columns x 2 rows. */
export const garmentSheet = (style: 'soft' | 'sharp' = 'soft') => `/assets/garments-${style}.png`;

/**
 * Labelled example wardrobe. The two styles ship different garments, matching
 * the Soft and Sharp wardrobe targets, so the names always describe the photo
 * actually shown.
 */
export function sampleGarments(style:'soft'|'sharp'='soft'):Garment[]{
  const sheet=garmentSheet(style);
  const pieces:Array<[string,Garment['category'],string]>=style==='sharp'
    ? [['Linen shirt','tops','#e6dfcf'],['Navy overshirt','layers','#243448'],['Olive trousers','bottoms','#73735a'],['Brown loafers','shoes','#624332'],['Everyday watch','accessories','#8b6b49']]
    : [['Cream tank','tops','#f4efe6'],['Blue cardigan','layers','#8ba8d6'],['Wide-leg trousers','bottoms','#e5dfc8'],['White sneakers','shoes','#f5f5f0'],['Everyday tote','accessories','#d9cdb8']];
  return pieces.map(([name,category,color],i)=>({
    id:`sample-${i}`,name,category,color,
    image:`${sheet}#${i}`,
    createdAt:Date.now()-(5-i)*10000,
  }));
}
