import type { AiRequest, Analysis, CompareResult, HealthStatus, AvatarParams } from '../../shared/types';
import {getConfig,runCloudJob} from './cloud';
export class ApiError extends Error {code:string;constructor(message:string,code='UNKNOWN'){super(message);this.code=code}}
async function request<T>(path:string,body?:unknown):Promise<T>{
 if(body&&(await getConfig()).cloudEnabled)return runCloudJob<T>(path,body as Record<string,unknown>);
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),150000);
 try {const res=await fetch(`/api/${path}`,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:ctrl.signal});
 const data=await res.json().catch(()=>null);if(!res.ok)throw new ApiError(data?.error?.message||'The service is unavailable. Please try again.',data?.error?.code);if(!data)throw new ApiError('The server returned an unreadable response.');return data as T;
 }catch(e){if(e instanceof ApiError)throw e;if(e instanceof Error&&e.name==='AbortError')throw new ApiError('This is taking longer than expected. Please try again.','TIMEOUT');throw new ApiError('Could not reach vibecheck. Check that the app server is running.','NETWORK')}finally{clearTimeout(timer)}
}
export const api={health:()=>request<HealthStatus>('health'),analyze:(body:AiRequest)=>request<Analysis>('analyze',body),compare:(body:{imageA:string;imageB:string;mood?:string;referenceImages?:string[]})=>request<CompareResult>('compare',body),avatar:(body:{image?:string;bodyImage?:string;presentation:string;height?:number})=>request<{params:AvatarParams;summary:string}>('avatar',body),preview:(body:{image:string;kind:'hair'|'outfit';prompt:string;garmentImages?:string[]})=>request<{image:string;mimeType:string}>('generate-preview',body),alignFace:(body:{image:string;isMale:boolean})=>request<{success:boolean;faceTexture:string}>('face/align',body)};
