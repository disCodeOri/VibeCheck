import {randomUUID} from 'node:crypto';
import {GetObjectCommand, HeadObjectCommand, PutObjectCommand, type S3Client} from '@aws-sdk/client-s3';
import {GetCommand, PutCommand, UpdateCommand, type DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import type {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2} from 'aws-lambda';

export const IMAGE_LIMIT = 6 * 1024 * 1024;
export const SNAPSHOT_LIMIT = 100 * 1024 * 1024;
export const URL_TTL_SECONDS = 300;
export const IMAGE_TYPES = ['image/jpeg','image/png','image/webp'] as const;
export const SNAPSHOT_TYPE = 'application/json' as const;
export type UploadKind = 'image'|'snapshot';
export type JobPath = '/analyze'|'/compare'|'/avatar'|'/generate-preview';
export interface CloudConfig {region:string;userPoolId:string;clientId:string;provider:'bedrock';cloudEnabled:true}
export interface CloudDependencies {
  s3:S3Client;
  db:DynamoDBDocumentClient;
  bucket:string;
  table:string;
  config:CloudConfig;
  sign?:(client:S3Client, command:GetObjectCommand|PutObjectCommand, options:{expiresIn:number;unhoistableHeaders:Set<string>;signableHeaders:Set<string>})=>Promise<string>;
  now?:()=>number;
  uuid?:()=>string;
}
export interface WorkerJob {sub:string;id:string;path:JobPath;body:Record<string,unknown>}

class CloudError extends Error { constructor(public status:number,public code:string,message:string){super(message)} }
const json=(statusCode:number,body:unknown):APIGatewayProxyStructuredResultV2=>({statusCode,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(body)});
const errorResult=(error:unknown)=>error instanceof CloudError?json(error.status,{error:{code:error.code,message:error.message}}):json(500,{error:{code:'CLOUD_ERROR',message:'The cloud service could not complete the request.'}});

export function trustedSubject(event:APIGatewayProxyEventV2):string|undefined {
  const context=event.requestContext as typeof event.requestContext&{authorizer?:{jwt?:{claims?:Record<string,string|number|boolean|string[]>}}};
  const value=context.authorizer?.jwt?.claims?.sub;
  return typeof value==='string'&&value.length>0&&value.length<=128?value:undefined;
}
export function userPrefix(sub:string){return `users/${encodeURIComponent(sub)}/`;}
export function ownsKey(sub:string,key:string){return key.startsWith(userPrefix(sub))&&!key.includes('..')&&!key.includes('\\');}
const stateKey=(sub:string)=>({pk:`USER#${sub}`,sk:'STATE'});
const jobKey=(sub:string,id:string)=>({pk:`USER#${sub}`,sk:`JOB#${id}`});
const parseBody=(event:APIGatewayProxyEventV2):Record<string,unknown>=>{
  try { const parsed=JSON.parse(event.body??'{}'); if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error(); return parsed; }
  catch {throw new CloudError(400,'INVALID_REQUEST','The request payload is invalid.');}
};
const assertKeys=(body:Record<string,unknown>,allowed:string[])=>{if(Object.keys(body).some(k=>!allowed.includes(k)))throw new CloudError(400,'INVALID_REQUEST','The request payload is invalid.');};
const sign=(deps:CloudDependencies,command:GetObjectCommand|PutObjectCommand)=>(deps.sign??getSignedUrl)(deps.s3,command,{expiresIn:URL_TTL_SECONDS,unhoistableHeaders:new Set(['content-type']),signableHeaders:new Set(['content-type'])});

async function state(sub:string,deps:CloudDependencies){
  const row=(await deps.db.send(new GetCommand({TableName:deps.table,Key:stateKey(sub),ConsistentRead:true}))).Item;
  const result:{version:number;key?:string;updatedAt?:string;downloadUrl?:string}={version:Number(row?.version??0)};
  if(typeof row?.key==='string'&&ownsKey(sub,row.key)){
    result.key=row.key; result.updatedAt=typeof row.updatedAt==='string'?row.updatedAt:undefined;
    result.downloadUrl=await sign(deps,new GetObjectCommand({Bucket:deps.bucket,Key:row.key}));
  }
  return result;
}

async function createUpload(sub:string,body:Record<string,unknown>,deps:CloudDependencies){
  assertKeys(body,['kind','contentType','bytes']);
  const kind=body.kind; const contentType=body.contentType; const bytes=body.bytes;
  if(kind!=='image'&&kind!=='snapshot')throw new CloudError(400,'INVALID_REQUEST','Upload kind must be image or snapshot.');
  const allowed=kind==='image'?(IMAGE_TYPES as readonly string[]):[SNAPSHOT_TYPE];
  const limit=kind==='image'?IMAGE_LIMIT:SNAPSHOT_LIMIT;
  if(!allowed.includes(String(contentType))||!Number.isInteger(bytes)||Number(bytes)<=0||Number(bytes)>limit)throw new CloudError(400,'INVALID_REQUEST',`Invalid ${kind} content type or size.`);
  const ext=kind==='snapshot'?'json':contentType==='image/jpeg'?'jpg':contentType==='image/png'?'png':'webp';
  const key=`${userPrefix(sub)}${kind}s/${deps.uuid?.()??randomUUID()}.${ext}`;
  const uploadUrl=await sign(deps,new PutObjectCommand({Bucket:deps.bucket,Key:key,ContentType:String(contentType),ContentLength:Number(bytes)}));
  return {key,uploadUrl};
}

async function commit(sub:string,body:Record<string,unknown>,deps:CloudDependencies){
  assertKeys(body,['key','expectedVersion']);
  const key=body.key; const expected=body.expectedVersion;
  if(typeof key!=='string'||!ownsKey(sub,key)||!key.startsWith(`${userPrefix(sub)}snapshots/`)||!key.endsWith('.json')||!Number.isInteger(expected)||Number(expected)<0)throw new CloudError(400,'INVALID_REQUEST','Snapshot key or version is invalid.');
  let head;
  try {head=await deps.s3.send(new HeadObjectCommand({Bucket:deps.bucket,Key:key}));} catch {throw new CloudError(400,'INVALID_SNAPSHOT','The uploaded snapshot was not found.');}
  if(head.ContentType!==SNAPSHOT_TYPE||!head.ContentLength||head.ContentLength>SNAPSHOT_LIMIT)throw new CloudError(400,'INVALID_SNAPSHOT','The uploaded object is not a valid owned snapshot.');
  const now=new Date(deps.now?.()??Date.now()).toISOString();
  try {
    const out=await deps.db.send(new UpdateCommand({TableName:deps.table,Key:stateKey(sub),UpdateExpression:'SET #v = :next, #k = :key, updatedAt = :now',ConditionExpression:Number(expected)===0?'attribute_not_exists(#v) OR #v = :expected':'#v = :expected',ExpressionAttributeNames:{'#v':'version','#k':'key'},ExpressionAttributeValues:{':next':Number(expected)+1,':expected':Number(expected),':key':key,':now':now},ReturnValues:'ALL_NEW'}));
    return {version:Number(out.Attributes?.version??Number(expected)+1),key,updatedAt:now};
  } catch(error){if((error as {name?:string}).name==='ConditionalCheckFailedException')throw new CloudError(409,'VERSION_CONFLICT','Cloud state changed. Refresh before trying again.');throw error;}
}

async function downloads(sub:string,body:Record<string,unknown>,deps:CloudDependencies){
  assertKeys(body,['keys']);
  if(!Array.isArray(body.keys)||body.keys.length>100||body.keys.some(k=>typeof k!=='string'||!ownsKey(sub,k)))throw new CloudError(400,'INVALID_REQUEST','Keys must be an array of up to 100 owned object keys.');
  const unique=[...new Set(body.keys as string[])];
  const pairs=await Promise.all(unique.map(async key=>[key,await sign(deps,new GetObjectCommand({Bucket:deps.bucket,Key:key}))] as const));
  return {urls:Object.fromEntries(pairs)};
}

async function createJob(sub:string,body:Record<string,unknown>,deps:CloudDependencies){
  assertKeys(body,['path','body']);
  if(!JOB_PATHS.includes(body.path as JobPath)||!body.body||typeof body.body!=='object'||Array.isArray(body.body))throw new CloudError(400,'INVALID_REQUEST','Job path or body is invalid.');
  const serialized=JSON.stringify(body.body); if(Buffer.byteLength(serialized)>350_000)throw new CloudError(413,'REQUEST_TOO_LARGE','Job metadata is too large.');
  const id=deps.uuid?.()??randomUUID(); const now=deps.now?.()??Date.now();
  const day=new Date(now).toISOString().slice(0,10);
  try {
    await deps.db.send(new UpdateCommand({TableName:deps.table,Key:{pk:`USER#${sub}`,sk:`USAGE#${day}`},UpdateExpression:'SET #c = if_not_exists(#c, :zero) + :one, #ttl = :ttl',ConditionExpression:'attribute_not_exists(#c) OR #c < :limit',ExpressionAttributeNames:{'#c':'count','#ttl':'ttl'},ExpressionAttributeValues:{':zero':0,':one':1,':limit':30,':ttl':Math.floor(now/1000)+172800}}));
  } catch(error){if((error as {name?:string}).name==='ConditionalCheckFailedException')throw new CloudError(429,'DAILY_LIMIT','Daily AI job limit reached. Try again tomorrow.');throw error;}
  await deps.db.send(new PutCommand({TableName:deps.table,Item:{...jobKey(sub,id),entity:'job',id,sub,path:body.path,body:body.body,status:'pending',createdAt:new Date(now).toISOString(),ttl:Math.floor(now/1000)+86400},ConditionExpression:'attribute_not_exists(pk)'}));
  return {id};
}
async function readJob(sub:string,id:string,deps:CloudDependencies){
  if(!/^[0-9a-f-]{16,64}$/i.test(id))throw new CloudError(400,'INVALID_REQUEST','Job id is invalid.');
  const item=(await deps.db.send(new GetCommand({TableName:deps.table,Key:jobKey(sub,id),ConsistentRead:true}))).Item;
  if(!item)throw new CloudError(404,'NOT_FOUND','Job not found.');
  const out:{status:string;result?:unknown;error?:unknown}={status:String(item.status)};
  if(item.status==='complete'){
    out.result=item.result;
    if(typeof item.resultKey==='string'&&ownsKey(sub,item.resultKey)){
      const stored=await deps.s3.send(new GetObjectCommand({Bucket:deps.bucket,Key:item.resultKey}));
      const bytes=await stored.Body?.transformToByteArray();
      if(!bytes)throw new CloudError(500,'CLOUD_ERROR','The completed job result is unavailable.');
      out.result=JSON.parse(Buffer.from(bytes).toString('utf8'));
    }
  }
  if(item.status==='failed')out.error=item.error??{code:'AI_ERROR',message:'The AI service could not complete the request.'};
  return out;
}

export async function dispatchCloudRequest(event:APIGatewayProxyEventV2,deps:CloudDependencies):Promise<APIGatewayProxyStructuredResultV2|undefined>{
  const path=event.rawPath; const method=event.requestContext.http.method;
  if(method==='GET'&&path==='/api/config')return json(200,deps.config);
  if(!path.startsWith('/api/cloud/')&&path!=='/api/jobs'&&!path.startsWith('/api/jobs/'))return undefined;
  const sub=trustedSubject(event); if(!sub)return json(401,{error:{code:'UNAUTHORIZED',message:'Sign in is required.'}});
  try {
    if(method==='GET'&&path==='/api/cloud/state')return json(200,await state(sub,deps));
    if(method==='POST'&&path==='/api/cloud/upload')return json(200,await createUpload(sub,parseBody(event),deps));
    if(method==='POST'&&path==='/api/cloud/commit')return json(200,await commit(sub,parseBody(event),deps));
    if(method==='POST'&&path==='/api/cloud/download')return json(200,await downloads(sub,parseBody(event),deps));
    if(method==='POST'&&path==='/api/jobs')return json(202,await createJob(sub,parseBody(event),deps));
    if(method==='GET'&&path.startsWith('/api/jobs/'))return json(200,await readJob(sub,decodeURIComponent(path.slice('/api/jobs/'.length)),deps));
    return json(404,{error:{code:'NOT_FOUND',message:'Route not found.'}});
  } catch(error){return errorResult(error);}
}

/**
 * A worker killed by a Lambda timeout or OOM never reaches its catch block, so
 * the job would stay 'running' forever and the client would poll until it gave
 * up. A claim records when it was taken and a claim older than STALE_CLAIM_MS
 * (comfortably past the function timeout) may be taken over by a later attempt.
 */
export const STALE_CLAIM_MS = 360_000;
export async function claimJob(job:WorkerJob,deps:CloudDependencies){
  const now=deps.now?.()??Date.now();
  try {await deps.db.send(new UpdateCommand({
    TableName:deps.table,Key:jobKey(job.sub,job.id),
    UpdateExpression:'SET #s=:running, claimedAt=:now',
    ConditionExpression:'#s=:pending OR (#s=:running AND claimedAt < :stale)',
    ExpressionAttributeNames:{'#s':'status'},
    ExpressionAttributeValues:{':running':'running',':pending':'pending',':now':now,':stale':now-STALE_CLAIM_MS},
  }));return true;}
  catch(error){if((error as {name?:string}).name==='ConditionalCheckFailedException')return false;throw error;}
}
export async function finishJob(job:WorkerJob,result:unknown,deps:CloudDependencies){
  const encoded=Buffer.from(JSON.stringify(result));
  if(encoded.length>300_000){
    const resultKey=`${userPrefix(job.sub)}job-results/${job.id}.json`;
    await deps.s3.send(new PutObjectCommand({Bucket:deps.bucket,Key:resultKey,Body:encoded,ContentType:SNAPSHOT_TYPE,ServerSideEncryption:'AES256',Tagging:'purpose=job-result',Metadata:{owner:job.sub,kind:'job-result'}}));
    await deps.db.send(new UpdateCommand({TableName:deps.table,Key:jobKey(job.sub,job.id),UpdateExpression:'SET #s=:complete,resultKey=:key REMOVE #b',ExpressionAttributeNames:{'#s':'status','#b':'body'},ExpressionAttributeValues:{':complete':'complete',':key':resultKey}}));return;
  }
  await deps.db.send(new UpdateCommand({TableName:deps.table,Key:jobKey(job.sub,job.id),UpdateExpression:'SET #s=:complete,#r=:result REMOVE #b',ExpressionAttributeNames:{'#s':'status','#r':'result','#b':'body'},ExpressionAttributeValues:{':complete':'complete',':result':result}}));
}
export async function failJob(job:WorkerJob,deps:CloudDependencies){await deps.db.send(new UpdateCommand({TableName:deps.table,Key:jobKey(job.sub,job.id),UpdateExpression:'SET #s=:failed,#e=:error REMOVE #b',ExpressionAttributeNames:{'#s':'status','#e':'error','#b':'body'},ExpressionAttributeValues:{':failed':'failed',':error':{code:'AI_ERROR',message:'The AI service could not complete the request.'}}}));}
export const JOB_PATHS:JobPath[]=['/analyze','/compare','/avatar','/generate-preview'];
export async function loadJob(pk:string,sk:string,deps:CloudDependencies):Promise<WorkerJob|undefined>{
  const item=(await deps.db.send(new GetCommand({TableName:deps.table,Key:{pk,sk},ConsistentRead:true}))).Item;
  if(!item||item.entity!=='job'||typeof item.sub!=='string'||typeof item.id!=='string'||typeof item.path!=='string'||!item.body||typeof item.body!=='object')return undefined;
  // Re-check the path on read. Trusting the stored value would let an unknown
  // path fall through executeJob's switch and complete a job with no result,
  // which the client cannot distinguish from a job still in flight.
  if(!JOB_PATHS.includes(item.path as JobPath))return undefined;
  return {sub:item.sub,id:item.id,path:item.path as JobPath,body:item.body as Record<string,unknown>};
}

async function objectDataUrl(sub:string,key:string,deps:CloudDependencies){
  if(!ownsKey(sub,key)||!key.startsWith(`${userPrefix(sub)}images/`))throw new CloudError(400,'INVALID_IMAGE','An image key is not owned by this user.');
  let out;
  try {out=await deps.s3.send(new GetObjectCommand({Bucket:deps.bucket,Key:key}));} catch {throw new CloudError(400,'INVALID_IMAGE','An uploaded image was not found.');}
  if(!out.ContentType||(IMAGE_TYPES as readonly string[]).includes(out.ContentType)===false||!out.ContentLength||out.ContentLength>IMAGE_LIMIT)throw new CloudError(400,'INVALID_IMAGE','An uploaded object is not a valid owned image.');
  const bytes=await out.Body?.transformToByteArray();
  if(!bytes?.length||bytes.length>IMAGE_LIMIT)throw new CloudError(400,'INVALID_IMAGE','An uploaded image is empty or too large.');
  return `data:${out.ContentType};base64,${Buffer.from(bytes).toString('base64')}`;
}

/** Replaces only the documented top-level image references; nested arbitrary keys are never fetched. */
export async function hydrateCloudBody(sub:string,body:Record<string,unknown>,deps:CloudDependencies){
  const result={...body};
  const singles=['image','imageA','imageB','bodyImage'] as const;
  const arrays=['referenceImages','garmentImages'] as const;
  for(const field of singles){const value=result[field];if(typeof value==='string')result[field]=await objectDataUrl(sub,value,deps);}
  for(const field of arrays){const value=result[field];if(value!==undefined){if(!Array.isArray(value)||value.some(v=>typeof v!=='string'))throw new CloudError(400,'INVALID_IMAGE','Image references are invalid.');result[field]=await Promise.all(value.map(v=>objectDataUrl(sub,v as string,deps)));}}
  return result;
}
