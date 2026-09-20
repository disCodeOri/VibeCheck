import {useEffect,useState} from 'react';
export default function PhotoPrivacy(){
 const [enabled,setEnabled]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/privacy').then(r=>r.ok?r.json():Promise.reject()).then(r=>setEnabled(r.processingEnabled)).catch(()=>{})},[]);
 if(enabled===null)return null;
 return <div className="photo-privacy"><h3>Photo processing</h3><p>Pause new AI checks on this local server. Your wardrobe and saved looks still work.</p><button className="btn secondary" disabled={busy} aria-pressed={enabled} onClick={async()=>{setBusy(true);setError('');try{const r=await fetch('/api/privacy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({processingEnabled:!enabled})});if(!r.ok)throw Error();setEnabled((await r.json()).processingEnabled)}catch{setError('Could not update. Please try again.')}finally{setBusy(false)}}}>{busy?'Updating…':enabled?'Pause photo processing':'Enable photo processing'}</button><p className="small muted">Enforced locally with Cedar · resets when the server restarts.</p>{error&&<p role="alert">{error}</p>}</div>
}
