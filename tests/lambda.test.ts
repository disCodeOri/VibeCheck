import {it,expect} from 'vitest';
import type {APIGatewayProxyEventV2,Context} from 'aws-lambda';
import {handler} from '../server/lambda';
it('returns public health through the real promise-based Lambda adapter without AWS calls',async()=>{
 const event={version:'2.0',routeKey:'GET /api/health',rawPath:'/api/health',rawQueryString:'',headers:{host:'example.execute-api.us-east-1.amazonaws.com'},requestContext:{accountId:'test',apiId:'test',domainName:'example.execute-api.us-east-1.amazonaws.com',domainPrefix:'test',http:{method:'GET',path:'/api/health',protocol:'HTTP/1.1',sourceIp:'127.0.0.1',userAgent:'test'},requestId:'test',routeKey:'GET /api/health',stage:'$default',time:'',timeEpoch:0},isBase64Encoded:false} as APIGatewayProxyEventV2;
 const response=await handler(event,{} as Context);expect(response?.statusCode).toBe(200);expect(JSON.parse(response?.body||'{}')).toMatchObject({provider:'bedrock',configured:true});
},5000);
