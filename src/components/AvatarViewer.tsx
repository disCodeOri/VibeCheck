import {Component, Suspense, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
import {ContactShadows, OrbitControls, useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import type {AvatarParams, Garment} from '../../shared/types';
import './avatar-viewer.css';

export interface AvatarViewerProps {
  params: AvatarParams;
  garments: Garment[];
  onCapture?: (capture: () => string) => void;
  modelUrl?: string;
  autoRotate?: boolean;
}

type View = 'front' | 'side' | 'back';

const safeColor = (value: string, fallback: string) => {
  try { return new THREE.Color(value).getStyle(); } catch { return fallback; }
};
const selected = (items: Garment[], category: Garment['category']) => [...items].reverse().find((g:Garment) => g.category === category);

function CaptureBridge({onCapture}:{onCapture?:AvatarViewerProps['onCapture']}) {
  const {gl, scene, camera} = useThree();
  useEffect(() => {
    if (!onCapture) return;
    const capture = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/png');
    };
    onCapture(capture);
  }, [camera, gl, onCapture, scene]);
  return null;
}

function LoadedModel({url}:{url:string}) {
  const {scene} = useGLTF(url);
  const fitted = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = size.y > .001 ? 5.05 / size.y : 1;
    return {copy, scale, position:new THREE.Vector3(-center.x*scale,-2.82-box.min.y*scale,-center.z*scale)};
  }, [scene]);
  return <primitive object={fitted.copy} position={fitted.position} scale={fitted.scale}/>;
}

class ModelBoundary extends Component<{children:ReactNode; fallback:ReactNode;onError:()=>void},{failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError(){ return {failed:true}; }
  componentDidCatch(_error: Error, _info: ErrorInfo){ this.props.onError(); }
  render(){ return this.state.failed ? this.props.fallback : this.props.children; }
}

function Material({color, roughness=.72, metalness=0}:{color:string;roughness?:number;metalness?:number}) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness}/>;
}

function Capsule({position, scale, rotation, color}:{position:[number,number,number];scale:[number,number,number];rotation?:[number,number,number];color:string}) {
  return <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow><capsuleGeometry args={[.24,.72,12,24]}/><Material color={color}/></mesh>;
}

function ParametricAvatar({params, garments}:{params:AvatarParams;garments:Garment[]}) {
  const height = THREE.MathUtils.clamp(params.height ?? 170, 145, 205) / 170;
  const build = THREE.MathUtils.lerp(.82, 1.2, THREE.MathUtils.clamp(params.build ?? .5, 0, 1));
  const shoulder = THREE.MathUtils.lerp(.86, 1.18, THREE.MathUtils.clamp(params.shoulders ?? .5, 0, 1));
  const feminine = params.presentation === 'feminine';
  const skin = safeColor(params.skinTone, '#b97854');
  const hair = safeColor(params.hairColor, '#251b18');
  const top = safeColor(selected(garments,'tops')?.color ?? '#e9edf4', '#e9edf4');
  const layer = selected(garments,'layers');
  const layerColor = safeColor(layer?.color ?? '#1d3151', '#1d3151');
  const bottom = safeColor(selected(garments,'bottoms')?.color ?? '#26354a', '#26354a');
  const shoe = safeColor(selected(garments,'shoes')?.color ?? '#402f28', '#402f28');
  const accessory = selected(garments,'accessories');
  const torsoPoints = useMemo(() => [
    new THREE.Vector2(.39*build, -1.02), new THREE.Vector2(.45*build, -.72),
    new THREE.Vector2((feminine?.42:.46)*build, -.24), new THREE.Vector2(.55*shoulder, .42),
    new THREE.Vector2(.47*shoulder, .64), new THREE.Vector2(.22, .72)
  ], [build, feminine, shoulder]);
  const jacketPoints = useMemo(() => torsoPoints.map((p,i)=>new THREE.Vector2(p.x+(i<5?.035:0),p.y)),[torsoPoints]);
  const legX = .25 * build;
  const armX = .65 * shoulder;
  const eye = '#152035';
  return <group scale={[1,height,1]} position={[0,2.82*(height-1),0]}>
    {/* legs and fitted trousers */}
    <Capsule position={[-legX,-1.58,0]} scale={[.72*build,1.18,.78]} color={bottom}/>
    <Capsule position={[legX,-1.58,0]} scale={[.72*build,1.18,.78]} color={bottom}/>
    <mesh position={[0,-.88,0]} scale={[.86*build,.42,.58]} castShadow><sphereGeometry args={[.56,32,22]}/><Material color={bottom}/></mesh>
    {/* shoes with a real toe and heel silhouette */}
    {[-1,1].map(side=><group key={side} position={[side*legX,-2.64,.12]}>
      <mesh scale={[.31*build,.18,.58]} castShadow><sphereGeometry args={[1,28,16]}/><Material color={shoe} roughness={.5}/></mesh>
      <mesh position={[0,-.13,-.09]} scale={[.3,.08,.43]} castShadow><boxGeometry/><Material color="#111b2a"/></mesh>
    </group>)}
    {/* anatomical torso under clothing */}
    <mesh position={[0,.06,0]} castShadow><latheGeometry args={[torsoPoints,40]}/><Material color={top}/></mesh>
    {/* collar, placket and buttons */}
    <mesh position={[-.13,.69,.31]} rotation={[.22,0,-.38]}><boxGeometry args={[.25,.25,.035]}/><Material color={top}/></mesh>
    <mesh position={[.13,.69,.31]} rotation={[.22,0,.38]}><boxGeometry args={[.25,.25,.035]}/><Material color={top}/></mesh>
    <mesh position={[0,.15,.46]} scale={[.025,.55,.02]}><boxGeometry/><Material color="#d3d3d3"/></mesh>
    {[.46,.2,-.06,-.32].map(y=><mesh key={y} position={[0,y,.49]}><sphereGeometry args={[.025,12,8]}/><Material color="#526074"/></mesh>)}
    {/* arms: tapered upper and forearm forms, with sculpted hands */}
    {[-1,1].map(side=><group key={side}>
      <Capsule position={[side*armX,.12,0]} rotation={[0,0,side*.11]} scale={[.76*build,.86,.78]} color={layer?layerColor:top}/>
      <Capsule position={[side*(armX+.07),-.73,.02]} rotation={[0,0,-side*.03]} scale={[.65*build,.72,.69]} color={layer?layerColor:top}/>
      <mesh position={[side*(armX+.08),-1.35,.02]} scale={[.18*build,.31,.13]} castShadow><sphereGeometry args={[1,24,18]}/><Material color={skin}/></mesh>
      {[[-.07,-.22],[0,-.25],[.07,-.22]].map(([dx,dy],i)=><mesh key={i} position={[side*(armX+.08+dx*.45),-1.35+dy*.16,.14]} rotation={[.25,0,0]} scale={[.025,.13,.025]}><capsuleGeometry args={[1,1,6,10]}/><Material color={skin}/></mesh>)}
    </group>)}
    {layer&&<mesh position={[0,.06,-.012]} castShadow><latheGeometry args={[jacketPoints,40]}/><meshStandardMaterial color={layerColor} roughness={.76} side={THREE.DoubleSide}/></mesh>}
    {layer&&<><mesh position={[0,.08,.51]} scale={[.018,.62,.02]}><boxGeometry/><Material color="#d4dbe6"/></mesh><mesh position={[-.23,-.34,.48]} rotation={[0,0,.08]}><boxGeometry args={[.27,.18,.025]}/><Material color={layerColor}/></mesh></>}
    {/* neck, head, ears, nose and understated editorial face */}
    <mesh position={[0,.93,0]} scale={[.2,.34,.2]} castShadow><capsuleGeometry args={[1,.2,10,20]}/><Material color={skin}/></mesh>
    <mesh position={[0,1.43,0]} scale={[.46,.57,.43]} castShadow><sphereGeometry args={[1,40,32]}/><Material color={skin}/></mesh>
    {[-1,1].map(side=><mesh key={side} position={[side*.45,1.44,0]} scale={[.08,.14,.055]}><sphereGeometry args={[1,18,12]}/><Material color={skin}/></mesh>)}
    <mesh position={[0,1.39,.42]} rotation={[.18,0,0]} scale={[.065,.14,.085]}><sphereGeometry args={[1,18,12]}/><Material color={skin}/></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*.17,1.55,.405]} scale={[.075,.034,.025]}><sphereGeometry args={[1,18,10]}/><Material color="#fbfbfa"/></mesh>
      <mesh position={[side*.17,1.55,.43]} scale={[.027,.027,.018]}><sphereGeometry args={[1,16,10]}/><Material color={eye}/></mesh>
      <mesh position={[side*.17,1.67,.404]} rotation={[0,0,side*.1]}><boxGeometry args={[.17,.023,.024]}/><Material color={hair}/></mesh>
    </group>)}
    <mesh position={[0,1.23,.425]} scale={[.13,.025,.025]}><sphereGeometry args={[1,20,10]}/><Material color="#9a4f50" roughness={.5}/></mesh>
    {/* hair volume varies materially by selected style */}
    <mesh position={[0,1.76,-.03]} scale={[.49,.31,.45]} castShadow><sphereGeometry args={[1,36,24,0,Math.PI*2,0,Math.PI*.69]}/><Material color={hair}/></mesh>
    {params.hairStyle!=='short'&&[-1,1].map(side=><mesh key={side} position={[side*.39,1.5,-.08]} scale={[.13,params.hairStyle==='long'?.6:.34,.18]} castShadow><capsuleGeometry args={[1,1,10,18]}/><Material color={hair}/></mesh>)}
    {params.hairStyle==='long'&&<mesh position={[0,1.28,-.31]} scale={[.36,.65,.14]} castShadow><capsuleGeometry args={[1,1,10,20]}/><Material color={hair}/></mesh>}
    {accessory&&<group><mesh position={[-armX-.1,-.7,.01]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.16,.035,10,24]}/><Material color={safeColor(accessory.color,'#c39a52')} metalness={.45}/></mesh><mesh position={[-armX-.1,-.7,.18]} scale={[.09,.07,.035]}><boxGeometry/><Material color="#13223a" metalness={.25}/></mesh></group>}
  </group>;
}

function Scene({params,garments,modelUrl,onCapture,view,onModelError,autoRotate=false}:{params:AvatarParams;garments:Garment[];modelUrl?:string;onCapture?:AvatarViewerProps['onCapture'];view:View;onModelError:()=>void;autoRotate?:boolean}) {
  const controls = useRef<any>(null);
  const {camera} = useThree();
  useEffect(() => {
    const positions:Record<View,[number,number,number]>={front:[0,.6,11.6],side:[11.6,.6,0],back:[0,.6,-11.6]};
    camera.position.set(...positions[view]); camera.lookAt(0,.6,0); controls.current?.target.set(0,.6,0); controls.current?.update();
  },[camera,view]);
  const fallback=<ParametricAvatar params={params} garments={garments}/>;
  return <>
    <color attach="background" args={['#f4f8fe']}/><hemisphereLight args={['#ffffff','#bfd1eb',1.45]}/><ambientLight intensity={.65}/><directionalLight position={[4,7,5]} intensity={2.1} castShadow shadow-mapSize={[1024,1024]}/><directionalLight position={[-4,3,-3]} intensity={.65} color="#b8d2ff"/>
    <group position={[0,.48,0]}>{modelUrl?<ModelBoundary key={modelUrl} fallback={fallback} onError={onModelError}><Suspense fallback={fallback}><LoadedModel url={modelUrl}/></Suspense></ModelBoundary>:fallback}</group>
    <mesh position={[0,-2.36,0]} receiveShadow><cylinderGeometry args={[1.42,1.55,.16,64]}/><meshStandardMaterial color="#e8eff9" roughness={.88}/></mesh>
    <ContactShadows position={[0,-2.27,0]} opacity={.3} scale={5.2} blur={2.8} far={5}/>
    <OrbitControls ref={controls} makeDefault autoRotate={autoRotate} autoRotateSpeed={2} enablePan={false} minDistance={6.4} maxDistance={14} minPolarAngle={Math.PI*.22} maxPolarAngle={Math.PI*.76} target={[0,.6,0]}/><CaptureBridge onCapture={onCapture}/>
  </>;
}

function webglAvailable() {
  try { const c=document.createElement('canvas'); return !!(window.WebGL2RenderingContext&&c.getContext('webgl2')) || !!(window.WebGLRenderingContext&&c.getContext('webgl')); } catch { return false; }
}

export default function AvatarViewer({params,garments,onCapture,modelUrl,autoRotate=false}:AvatarViewerProps) {
  const [view,setView]=useState<View>('front');
  const [reset,setReset]=useState(0);
  const [modelFailed,setModelFailed]=useState(false);
  const [supported]=useState(()=>typeof window!=='undefined'&&webglAvailable());
  useEffect(()=>setModelFailed(false),[modelUrl]);
  if(!supported) return <section className="avatar-viewer avatar-viewer--fallback" aria-label="Avatar preview unavailable"><div className="avatar-fallback-figure"><span/><i/><b/></div><strong>3D preview isn’t available here</strong><p>Your avatar settings and outfit are safe. Open VibeCheck in a browser with WebGL to rotate the full model.</p></section>;
  return <section className="avatar-viewer" aria-label="Interactive 3D avatar preview">
    <div className="avatar-stage"><Canvas key={reset} shadows dpr={[1,2]} camera={{position:[0,.6,11.6],fov:34,near:.1,far:100}} gl={{antialias:true,alpha:false,preserveDrawingBuffer:true}}><Scene autoRotate={autoRotate} params={params} garments={garments} modelUrl={modelUrl} onCapture={onCapture} view={view} onModelError={()=>setModelFailed(true)}/></Canvas>{modelFailed&&<div className="avatar-model-error" role="status">Model import failed — showing your VibeCheck avatar.</div>}<div className="avatar-drag-cue" aria-hidden="true"><span>↔</span> Drag to rotate</div></div>
    <div className="avatar-view-controls" role="group" aria-label="Avatar viewing angle">{(['front','side','back'] as View[]).map(v=><button type="button" key={v} className={view===v?'active':''} aria-pressed={view===v} onClick={()=>setView(v)}>{v[0].toUpperCase()+v.slice(1)}</button>)}<button type="button" onClick={()=>{setView('front');setReset(n=>n+1)}} aria-label="Reset avatar view">Reset</button></div>
  </section>;
}
