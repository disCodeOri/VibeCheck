import serverlessExpress from '@codegenie/serverless-express';
import {S3Client} from '@aws-sdk/client-s3';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import type {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context, DynamoDBStreamEvent} from 'aws-lambda';
import {createApp, analyzeSchema, compareSchema, avatarSchema, previewSchema, normalizeImage, type AiService, type NormalizedImage} from './app.js';
import {BedrockService} from './bedrock.js';
import {claimJob, dispatchCloudRequest, failJob, finishJob, hydrateCloudBody, loadJob, type CloudDependencies, type JobPath, type WorkerJob} from './cloud.js';

const region=process.env.AWS_REGION||'us-east-1';
const ai:AiService=new BedrockService({region,model:process.env.BEDROCK_MODEL||'us.amazon.nova-lite-v1:0',imageModel:process.env.BEDROCK_IMAGE_MODEL||'amazon.nova-canvas-v1:0',useRekognition:true});
const cloud:CloudDependencies={
  // Browser supplies the bytes later; do not sign an SDK checksum for an empty body.
  s3:new S3Client({region,requestChecksumCalculation:'WHEN_REQUIRED'}),db:DynamoDBDocumentClient.from(new DynamoDBClient({region})),
  bucket:process.env.DATA_BUCKET||'',table:process.env.TABLE_NAME||'',
  config:{region,userPoolId:process.env.USER_POOL_ID||'',clientId:process.env.USER_POOL_CLIENT_ID||'',provider:'bedrock',cloudEnabled:true},
};
const app=createApp(ai,{configured:true,provider:'bedrock',model:process.env.BEDROCK_MODEL||'us.amazon.nova-lite-v1:0',imageModel:process.env.BEDROCK_IMAGE_MODEL||'amazon.nova-canvas-v1:0'});
const expressHandler=serverlessExpress({app});

const normal=async(value:string|undefined):Promise<NormalizedImage|undefined>=>value?normalizeImage(value):undefined;
const normalMany=async(value:string[]|undefined)=>value?Promise.all(value.map(v=>normalizeImage(v))):undefined;

export async function executeJob(job:WorkerJob,deps=cloud,service=ai){
  const body=await hydrateCloudBody(job.sub,job.body,deps);
  switch(job.path){
    case '/analyze': {const parsed=analyzeSchema.parse(body);return service.analyze({...parsed,image:await normalizeImage(parsed.image),referenceImages:await normalMany(parsed.referenceImages)});}
    case '/compare': {const parsed=compareSchema.parse(body);return service.compare({...parsed,imageA:await normalizeImage(parsed.imageA),imageB:await normalizeImage(parsed.imageB),referenceImages:await normalMany(parsed.referenceImages)});}
    case '/avatar': {const parsed=avatarSchema.parse(body);const result=await service.avatar({...parsed,image:await normal(parsed.image),bodyImage:await normal(parsed.bodyImage)});if(parsed.height!==undefined)result.params.height=parsed.height;result.params.build=Math.min(1,Math.max(0,result.params.build));result.params.shoulders=Math.min(1,Math.max(0,result.params.shoulders));return result;}
    case '/generate-preview': {const parsed=previewSchema.parse(body);return service.generatePreview({...parsed,image:await normalizeImage(parsed.image),garmentImages:await normalMany(parsed.garmentImages)});}
  }
}

async function runWorker(job:WorkerJob){
  if(!await claimJob(job,cloud))return;
  try {await finishJob(job,await executeJob(job),cloud);}
  catch(error){
    // Log server-side (the client is still told nothing beyond AI_ERROR) so a
    // failing job is diagnosable instead of a silent dead end in CloudWatch.
    console.error(`[worker] job ${job.id} (${job.path}) failed:`,(error as Error)?.message??error);
    await failJob(job,cloud);
  }
}

function isHttp(event:unknown):event is APIGatewayProxyEventV2{return !!event&&typeof event==='object'&&(event as {version?:string}).version==='2.0'&&'requestContext' in event;}
function isStream(event:unknown):event is DynamoDBStreamEvent{return !!event&&typeof event==='object'&&Array.isArray((event as {Records?:unknown}).Records);}

export async function handler(event:APIGatewayProxyEventV2|DynamoDBStreamEvent,context:Context):Promise<APIGatewayProxyStructuredResultV2|void>{
  if(isStream(event)){
    for(const record of event.Records){
      if(record.eventName!=='INSERT')continue;
      const pk=record.dynamodb?.Keys?.pk?.S; const sk=record.dynamodb?.Keys?.sk?.S;
      if(!pk||!sk?.startsWith('JOB#'))continue;
      const job=await loadJob(pk,sk,cloud);if(job)await runWorker(job);
    }
    return;
  }
  if(!isHttp(event))return;
  const direct=await dispatchCloudRequest(event,cloud);if(direct)return direct;
  const aiPaths=new Set(['/api/analyze','/api/compare','/api/avatar','/api/generate-preview']);
  if(event.requestContext.http.method==='POST'&&aiPaths.has(event.rawPath)){
    return {statusCode:409,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({error:{code:'USE_JOBS',message:'Cloud AI requests must be submitted through /api/jobs.'}})};
  }
  // v5 returns a Promise; the package's Lambda Handler type still includes a callback.
  return await expressHandler(event,context,()=>{}) as APIGatewayProxyStructuredResultV2;
}
