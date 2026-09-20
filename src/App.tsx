import {Component,Suspense,lazy,useEffect,type ReactNode} from 'react';
import {NavLink,Route,Routes,Link,useLocation} from 'react-router-dom';
import {House,Heart,UserRound,ArrowLeft,WifiOff} from 'lucide-react';
import {useStore} from './lib/context';
import Home from './features/Home';
import Story from './features/Story';
import Loox from './features/Loox';
import Saved from './features/Saved';
import Profile from './features/Profile';
const ChicFit=lazy(()=>import('./features/ChicFit'));
const FitCheck3D=lazy(()=>import('./features/FitCheck3D'));
const Demo=lazy(()=>import('./demo/Demo'));
class Boundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true}}render(){return this.state.error?<div className="empty-state"><h2>Let’s get you back.</h2><p>Something unexpected happened. Your saved looks are still on this device.</p><button className="btn" onClick={()=>location.reload()}>Reload vibecheck</button></div>:this.props.children}}
export default function App(){
  const {state,ready}=useStore();
  const loc=useLocation();
  useEffect(()=>{window.scrollTo(0,0)},[loc.pathname]);
  if(loc.pathname==='/demo')return <Boundary><Suspense fallback={<div className="busy">Opening the walkthrough…</div>}><Demo/></Suspense></Boundary>;
  const home=loc.pathname==='/';
  const label=({'/story':'Story Check','/loox':'loox','/chicfit':'ChicFit','/fit3d':'3D Fit Check','/saved':'Saved looks','/profile':'Your space'} as Record<string,string>)[loc.pathname]||'vibecheck';
  return <div className="app-shell reference-shell">
    <div className="app-main">
      <header className="topbar">
        {home?<Link className="brand" to="/" aria-label="vibecheck home"><img src="/brand/logo.svg" alt="vibecheck."/></Link>:<><Link className="route-back" to="/" aria-label="Back home"><ArrowLeft size={20}/></Link><Link to="/" className="route-brand"><img src="/brand/icon.svg" alt=""/><span>{label}</span></Link></>}
        <Link to="/profile" className="user-initial" aria-label="Profile">{state.profile.name?.slice(0,1).toUpperCase()||<UserRound size={17}/>}</Link>
      </header>
      <main id="main-content" key={loc.pathname} className={`screen-${loc.pathname.split('/')[1]||'home'}`}>
        {!ready?<div className="busy">Opening your space…</div>:<Boundary><Suspense fallback={<div className="busy">Opening your wardrobe…</div>}><Routes>
          <Route path="/" element={<Home/>}/><Route path="/story" element={<Story/>}/><Route path="/loox" element={<Loox/>}/><Route path="/chicfit" element={<ChicFit/>}/><Route path="/fit3d" element={<FitCheck3D/>}/><Route path="/saved" element={<Saved/>}/><Route path="/profile" element={<Profile/>}/>
          <Route path="*" element={<div className="empty-state"><h1>That page wandered off.</h1><Link className="btn" to="/">Back home</Link></div>}/>
        </Routes></Suspense></Boundary>}
      </main>
    </div>
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavLink to="/" end><House size={20}/><span>Home</span></NavLink>
      <NavLink to="/saved"><Heart size={20}/><span>Saved{state.saved.length?` · ${state.saved.length}`:''}</span></NavLink>
      <NavLink to="/profile"><UserRound size={20}/><span>Me</span></NavLink>
    </nav>
    {!navigator.onLine&&<div className="offline"><WifiOff size={16}/>Offline · your saved looks are available</div>}
  </div>;
}
