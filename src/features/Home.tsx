import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Images} from 'lucide-react';
import {Button} from '../components/ui';

export default function Home(){
  const [mode,setMode]=useState('Story');
  const nav=useNavigate();
  const url=mode==='Story'?'/story':mode==='loox'?'/loox':'/chicfit';
  return <div className="home">
    <div className="home-intro">
      <h1>Good taste.<br/>All you<span>.</span></h1>
      <p className="home-subtitle">Look good. Feel right. Be you.</p>
    </div>
    <div className="hero-tabs" role="group" aria-label="Choose a style check">
      {['Story','loox','ChicFit'].map(m=><button key={m} aria-pressed={mode===m} className={mode===m?'selected':''} onClick={()=>setMode(m)}>{m}</button>)}
    </div>
    <section className="hero-visual" aria-label="Your vibe, your way">
      <img className="reference-hero" src="/assets/hero-v2.png" alt="A man in a cream linen shirt, with bold Your Vibe lettering behind him"/>
      <div className="hero-sticker">LOOKING<br/>SHARP.</div>
      <span className="sample-label">SAMPLE LOOK</span>
    </section>
    <section className="home-actions">
      <Button onClick={()=>nav(url)}>{mode==='Story'?'Check my story':mode==='loox'?'Explore my look':'Open my wardrobe'}<ArrowRight size={17}/></Button>
      <Button secondary onClick={()=>nav(mode==='Story'?'/story?compare=1':`${url}?demo=1`)}>{mode==='Story'?<><Images size={16}/>Compare two photos</>:<>Explore an example <ArrowRight size={16}/></>}</Button>
    </section>
    <div className="feature-shortcuts">
      <Link to="/loox"><div className="shortcut-photo"><img src="/assets/portrait-v2.png" alt=""/></div><div><h3>loox</h3><p>New look.<br/>Same good energy.</p></div><ArrowUpRight size={16}/></Link>
      <Link to="/chicfit"><div className="shortcut-photo garment-shortcut"/><div><h3>ChicFit</h3><p>Your wardrobe.<br/>More possibilities.</p></div><ArrowUpRight size={16}/></Link>
    </div>
    <Link className="home-example" to={`${url}?demo=1`}>Explore a sample {mode==='Story'?'check':mode==='loox'?'look':'wardrobe'} <ArrowUpRight size={13}/></Link>
  </div>;
}
