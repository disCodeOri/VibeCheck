import {imageData} from './images';
import {validateBackup,type AppState} from './storage';

export interface CloudConfig {cloudEnabled:boolean;provider:'gemini'|'bedrock';region?:string;userPoolId?:string;clientId?:string}
interface Session {email:string;idToken:string;refreshToken:string;expiresAt:number;clientId:string}
export interface CloudState {version:number;updatedAt?:string;downloadUrl?:string}
const SESSION_KEY='vibecheck-session';
let configPromise:Promise<CloudConfig>|undefined;
export function getConfig():Promise<CloudConfig>{
 return configPromise??=(async()=>{try{const r=await fetch('/api/config',{cache:'no-store'});if(!r.ok)throw new Error();return await r.json() as CloudConfig}catch{configPromise=undefined;throw new Error('Could not connect to the app server. Please try again.')}})();
}
export function readSession():Session|null {try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null') as Session|null}catch{return null}}
function storeSession(session:Session){sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));window.dispatchEvent(new Event('vibecheck-auth'))}
export function signOut(){sessionStorage.removeItem(SESSION_KEY);window.dispatchEvent(new Event('vibecheck-auth'))}
async function cognito(){const config=await getConfig();if(!config.cloudEnabled||!config.region||!config.clientId)throw new Error('Cloud accounts are available after the AWS deployment.');const sdk=await import('@aws-sdk/client-cognito-identity-provider');return {config,sdk,client:new sdk.CognitoIdentityProviderClient({region:config.region})}}
export async function signUp(email:string,password:string){const {config,sdk,client}=await cognito();await client.send(new sdk.SignUpCommand({ClientId:config.clientId,Username:email,Password:password,UserAttributes:[{Name:'email',Value:email}]}))}
export async function confirmAccount(email:string,code:string){const {config,sdk,client}=await cognito();await client.send(new sdk.ConfirmSignUpCommand({ClientId:config.clientId,Username:email,ConfirmationCode:code}))}
export async function signIn(email:string,password:string){
 const {config,sdk,client}=await cognito();const response=await client.send(new sdk.InitiateAuthCommand({ClientId:config.clientId,AuthFlow:'USER_PASSWORD_AUTH',AuthParameters:{USERNAME:email,PASSWORD:password}}));
 const auth=response.AuthenticationResult;if(!auth?.IdToken||!auth.RefreshToken)throw new Error('This account needs another sign-in step. Use a self-created email account.');
 storeSession({email,idToken:auth.IdToken,refreshToken:auth.RefreshToken,expiresAt:Date.now()+(auth.ExpiresIn||3600)*1000,clientId:config.clientId!});
}
export async function resetPassword(email:string,code?:string,password?:string){const {config,sdk,client}=await cognito();if(code&&password)await client.send(new sdk.ConfirmForgotPasswordCommand({ClientId:config.clientId,Username:email,ConfirmationCode:code,Password:password}));else await client.send(new sdk.ForgotPasswordCommand({ClientId:config.clientId,Username:email}))}
let refreshing:Promise<string>|undefined;
async function token():Promise<string>{
 const session=readSession();const config=await getConfig();if(!session||session.clientId!==config.clientId)throw new Error('Sign in from Your space before using cloud AI or backups.');
 if(session.expiresAt>Date.now()+60000)return session.idToken;
 return refreshing??=(async()=>{try{const {config,sdk,client}=await cognito();const r=await client.send(new sdk.InitiateAuthCommand({ClientId:config.clientId,AuthFlow:'REFRESH_TOKEN_AUTH',AuthParameters:{REFRESH_TOKEN:session.refreshToken}}));if(!r.AuthenticationResult?.IdToken)throw new Error();const next={...session,idToken:r.AuthenticationResult.IdToken,expiresAt:Date.now()+(r.AuthenticationResult.ExpiresIn||3600)*1000};storeSession(next);return next.idToken}catch{signOut();throw new Error('Your session has expired. Sign in again from Your space.')}finally{refreshing=undefined}})();
}
export async function cloudRequest<T>(path:string,body?:unknown):Promise<T>{
 const auth=await token();const r=await fetch(`/api/${path}`,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${auth}`,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000),cache:'no-store'});
 const data=await r.json().catch(()=>null);if(!r.ok)throw new Error(data?.error?.message||'Cloud request failed. Please try again.');return data as T;
}
export async function uploadBlob(blob:Blob,kind:'image'|'snapshot'):Promise<string>{
 const result=await cloudRequest<{key:string;uploadUrl:string}>('cloud/upload',{kind,contentType:blob.type,bytes:blob.size});
 const put=await fetch(result.uploadUrl,{method:'PUT',headers:{'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(120000)});if(!put.ok)throw new Error('The photo or backup could not be uploaded. Try again.');return result.key;
}
async function uploadImage(src:string){const encoded=await imageData(src);return uploadBlob(await (await fetch(encoded)).blob(),'image')}
export async function prepareCloudImages(body:Record<string,unknown>,upload=uploadImage){
 const result={...body};
 for(const field of ['image','imageA','imageB','bodyImage'])if(typeof result[field]==='string')result[field]=await upload(result[field] as string);
 for(const field of ['referenceImages','garmentImages'])if(Array.isArray(result[field]))result[field]=await Promise.all((result[field] as string[]).map(upload));
 return result;
}
export async function runCloudJob<T>(path:string,body:Record<string,unknown>):Promise<T>{
 // Check the session before uploading any photo. Never automatically retry job creation.
 await token();const prepared=await prepareCloudImages(body);const {id}=await cloudRequest<{id:string}>('jobs',{path:`/${path}`,body:prepared});
 const end=Date.now()+240000;
 while(Date.now()<end){await new Promise(r=>setTimeout(r,1800));const job=await cloudRequest<{status:string;result?:T;error?:{message:string}}>(`jobs/${id}`);if(job.status==='complete'&&job.result!==undefined)return job.result;if(job.status==='failed')throw new Error(job.error?.message||'The AI check could not finish.');}
 throw new Error('Your AI request is still taking longer than expected. It may finish in the background; wait before submitting another request.');
}
export const getCloudState=()=>cloudRequest<CloudState>('cloud/state');
// Only actual image slots are transformed; user-written captions and notes stay text.
export async function mapStateImages(state:AppState,map:(image:string)=>Promise<string>):Promise<AppState>{
 return {...state,profile:{...state.profile,photo:state.profile.photo?await map(state.profile.photo):undefined,bodyPhoto:state.profile.bodyPhoto?await map(state.profile.bodyPhoto):undefined},garments:await Promise.all(state.garments.map(async g=>({...g,image:await map(g.image)}))),saved:await Promise.all(state.saved.map(async s=>({...s,image:await map(s.image),secondaryImage:s.secondaryImage?await map(s.secondaryImage):undefined})))};
}
export async function backupCloud(state:AppState,expectedVersion:number){
 const cache=new Map<string,Promise<string>>();const mapped=await mapStateImages(state,src=>{let item=cache.get(src);if(!item){item=uploadImage(src).then(key=>`s3://${key}`);cache.set(src,item)}return item});
 const snapshot=new Blob([JSON.stringify({version:1,state:mapped})],{type:'application/json'});const key=await uploadBlob(snapshot,'snapshot');return cloudRequest<CloudState>('cloud/commit',{key,expectedVersion});
}
function blobData(blob:Blob):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.onerror=()=>reject(new Error('A backup photo could not be opened.'));reader.readAsDataURL(blob)})}
export async function restoreCloud():Promise<AppState>{
 const current=await getCloudState();if(!current.downloadUrl)throw new Error('There is no cloud backup yet.');
 const r=await fetch(current.downloadUrl,{signal:AbortSignal.timeout(120000)});if(!r.ok)throw new Error('Could not download the backup.');const backup=await r.json();
 // Validate structure and bounds before following any remote photo references.
 const keys:string[]=[];
 const scrub=(value:unknown):unknown=>{if(typeof value==='string'&&value.startsWith('s3://')){keys.push(value.slice(5));return '/assets/portrait.png'}if(Array.isArray(value))return value.map(scrub);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,scrub(v)]));return value};
 validateBackup(scrub(backup));const urls:Record<string,string>={};const unique=[...new Set(keys)];
 for(let i=0;i<unique.length;i+=100)Object.assign(urls,(await cloudRequest<{urls:Record<string,string>}>('cloud/download',{keys:unique.slice(i,i+100)})).urls);
 const cache=new Map<string,Promise<string>>();const restored=await mapStateImages(backup.state,src=>{if(!src.startsWith('s3://'))return Promise.resolve(src);let item=cache.get(src);if(!item){item=(async()=>{const url=urls[src.slice(5)];if(!url)throw new Error('A cloud photo is unavailable.');const photo=await fetch(url,{signal:AbortSignal.timeout(120000)});if(!photo.ok)throw new Error('A backup photo could not be downloaded.');const blob=await photo.blob();if(blob.size>6*1024*1024||!['image/png','image/jpeg','image/webp'].includes(blob.type))throw new Error('A backup photo is invalid.');return blobData(blob)})();cache.set(src,item)}return item});
 return validateBackup({version:1,state:restored});
}
