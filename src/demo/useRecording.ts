import {useEffect,useRef,useState} from 'react';

// Browser permission UI remains under the user's control. Nothing is captured
// until they select a surface in the browser's native sharing dialog.
export function useRecording(onStart:()=>void,onFinish:()=>void){
 const [recording,setRecording]=useState(false),[error,setError]=useState('');
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null);
 const finish=useRef(onFinish);finish.current=onFinish;
 useEffect(()=>()=>{if(recorder.current?.state==='recording')recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop())},[]);
 const stop=()=>{if(recorder.current?.state==='recording')recorder.current.stop()};
 const start=async()=>{
  setError('');
  if(!navigator.mediaDevices?.getDisplayMedia||typeof MediaRecorder==='undefined'){setError('Recording is unavailable in this browser. Open this demo in Chrome or Edge and choose Record.');return}
  try{
   const media=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:false});stream.current=media;
   const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
   const r=new MediaRecorder(media,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:6_000_000});recorder.current=r;
   const chunks:Blob[]=[];
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   r.onstop=()=>{media.getTracks().forEach(t=>t.stop());setRecording(false);finish.current();if(!chunks.length)return;const url=URL.createObjectURL(new Blob(chunks,{type:r.mimeType}));const a=document.createElement('a');a.href=url;a.download='vibecheck-demo.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),60_000)};
   media.getVideoTracks()[0].onended=stop;
   r.start(1000);setRecording(true);onStart();
  }catch(e){stream.current?.getTracks().forEach(t=>t.stop());setError(e instanceof DOMException&&e.name==='NotAllowedError'?'Recording cancelled. Your demo is ready to play.':'Recording could not start. Try Chrome or Edge, or use your screen recorder.')}
 };
 return {recording,error,start,stop};
}
