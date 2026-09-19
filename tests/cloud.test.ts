import {describe,expect,it,vi} from 'vitest';
import type {APIGatewayProxyEventV2} from 'aws-lambda';
import {dispatchCloudRequest,ownsKey,trustedSubject,type CloudDependencies} from '../server/cloud';

function event(path:string,method='GET',body?:unknown,sub?:string):APIGatewayProxyEventV2{return {version:'2.0',routeKey:'',rawPath:path,rawQueryString:'',headers:{authorization:'Bearer ignored'},requestContext:{accountId:'',apiId:'',domainName:'',domainPrefix:'',http:{method,path,protocol:'HTTP/1.1',sourceIp:'127.0.0.1',userAgent:'test'},requestId:'',routeKey:'',stage:'$default',time:'',timeEpoch:0,...(sub?{authorizer:{jwt:{claims:{sub},scopes:[]}}}:{})},isBase64Encoded:false,body:body===undefined?undefined:JSON.stringify(body)};}
function deps(send=vi.fn()):CloudDependencies{return {s3:{send} as never,db:{send} as never,bucket:'private',table:'state',config:{region:'us-east-1',userPoolId:'pool',clientId:'client',provider:'bedrock',cloudEnabled:true},uuid:()=> '12345678-1234-1234-1234-123456789abc',now:()=>0,sign:vi.fn(async()=> 'https://signed.example/upload')};}

describe('cloud tenancy and upload contracts',()=>{
  it('trusts only API Gateway JWT claims, never an authorization header',()=>{
    expect(trustedSubject(event('/api/cloud/state'))).toBeUndefined();
    expect(trustedSubject(event('/api/cloud/state','GET',undefined,'user-1'))).toBe('user-1');
  });
  it('uses exact encoded user prefixes',()=>{
    expect(ownsKey('alice','users/alice/images/x.jpg')).toBe(true);
    expect(ownsKey('alice','users/alice2/images/x.jpg')).toBe(false);
    expect(ownsKey('alice','users/bob/images/x.jpg')).toBe(false);
  });
  it('rejects oversized images before signing',async()=>{
    const d=deps();const result=await dispatchCloudRequest(event('/api/cloud/upload','POST',{kind:'image',contentType:'image/jpeg',bytes:6*1024*1024+1},'alice'),d);
    expect(result?.statusCode).toBe(400);expect(d.sign).not.toHaveBeenCalled();
  });
  it('returns an immutable owned key and signed upload URL',async()=>{
    const d=deps();const result=await dispatchCloudRequest(event('/api/cloud/upload','POST',{kind:'snapshot',contentType:'application/json',bytes:120},'alice'),d);
    expect(result?.statusCode).toBe(200);expect(JSON.parse(result?.body??'{}')).toEqual({key:'users/alice/snapshots/12345678-1234-1234-1234-123456789abc.json',uploadUrl:'https://signed.example/upload'});
    const options=(d.sign as unknown as {mock:{calls:unknown[][]}}).mock.calls[0][2] as {expiresIn:number;signableHeaders:Set<string>};
    expect(options.expiresIn).toBe(300);expect(options.signableHeaders.has('content-type')).toBe(true);
  });
  it('rejects attempts to sign another user’s downloads',async()=>{
    const d=deps();const result=await dispatchCloudRequest(event('/api/cloud/download','POST',{keys:['users/bob/images/x.jpg']},'alice'),d);
    expect(result?.statusCode).toBe(400);expect(d.sign).not.toHaveBeenCalled();
  });
  it('keeps public config free of credentials',async()=>{
    const result=await dispatchCloudRequest(event('/api/config'),deps());
    expect(JSON.parse(result?.body??'{}')).toEqual({region:'us-east-1',userPoolId:'pool',clientId:'client',provider:'bedrock',cloudEnabled:true});
  });
  it('consumes the daily allowance before creating a job',async()=>{
    const send=vi.fn(async()=>({}));const d=deps(send);
    const result=await dispatchCloudRequest(event('/api/jobs','POST',{path:'/analyze',body:{kind:'loox',image:'users/alice/images/x.jpg'}},'alice'),d);
    expect(result?.statusCode).toBe(202);expect(send).toHaveBeenCalledTimes(2);
    const usage=(send as unknown as {mock:{calls:unknown[][]}}).mock.calls[0][0] as {input:Record<string,unknown>};
    expect(usage.input).toMatchObject({Key:{pk:'USER#alice',sk:'USAGE#1970-01-01'},ConditionExpression:'attribute_not_exists(#c) OR #c < :limit'});
    expect((usage.input.ExpressionAttributeValues as Record<string,number>)[':limit']).toBe(30);
  });
  it('returns 429 and does not insert work after the daily cap',async()=>{
    const capped=Object.assign(new Error('cap'),{name:'ConditionalCheckFailedException'});const send=vi.fn(async()=>{throw capped});const d=deps(send);
    const result=await dispatchCloudRequest(event('/api/jobs','POST',{path:'/avatar',body:{presentation:'neutral',image:'users/alice/images/x.jpg'}},'alice'),d);
    expect(result?.statusCode).toBe(429);expect(JSON.parse(result?.body??'{}').error.code).toBe('DAILY_LIMIT');expect(send).toHaveBeenCalledTimes(1);
  });
});
