import {Component, Suspense, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
import {OrbitControls, useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import type {AvatarParams, Garment} from '../../shared/types';
import './avatar-viewer.css';

export interface AvatarViewerProps {
  params: AvatarParams;
  garments: Garment[];
  onCapture?: (capture: () => string) => void;
  modelUrl?: string;
  autoRotate?: boolean;
  topTexture?: string;
  bottomTexture?: string;
  faceTexture?: string;
  textureScale?: number;
  textureRoughness?: number;
  topColor?: string;
  bottomColor?: string;
}

type View = 'front' | 'side' | 'back' | 'focus';

const safeColor = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
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

/**
 * Hook to asynchronously load and configure a texture with seamless wrapping or clamped projection
 */
function useAppliedTexture(url?: string, repeat = 3, clamp = false) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    let active = true;
    loader.load(url, (tex) => {
      if (!active) return;
      if (clamp) {
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(1, 1);
        tex.flipY = false;
      } else {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat, repeat);
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      setTexture(tex);
    });
    return () => { active = false; };
  }, [url, repeat, clamp]);
  return texture;
}

function LoadedModel({
  url,
  topTexture,
  bottomTexture,
  faceTexture,
  textureScale = 3,
  roughness = 0.72,
  topColor,
  bottomColor,
  shoeColor,
  params
}:{
  url: string;
  topTexture?: string;
  bottomTexture?: string;
  faceTexture?: string;
  textureScale?: number;
  roughness?: number;
  topColor?: string;
  bottomColor?: string;
  shoeColor?: string;
  params?: AvatarParams;
}) {
  const {scene} = useGLTF(url);

  // Directly position and scale scene to preserve SkinnedMesh bone hierarchy
  useEffect(() => {
    if (!scene) return;
    const isMale = url.toLowerCase().includes('male') || url.toLowerCase().includes('avaturn');
    const targetHeight = 2.45;
    const modelHeight = isMale ? 1.86 : 1.77;
    const scale = targetHeight / modelHeight;
    // Ground feet at y = -1.25 directly on top of the turntable
    scene.position.set(0, -1.25, 0);
    scene.scale.set(scale, scale, scale);
    scene.rotation.set(0, 0, 0);
  }, [scene, url]);

  const topTex = useAppliedTexture(topTexture, textureScale);
  const bottomTex = useAppliedTexture(bottomTexture, textureScale);
  const faceTex = useAppliedTexture(faceTexture, 1, true);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.userData.origMaterial) {
          mesh.userData.origMaterial = mesh.material;
        }
        const name = (mesh.name + ' ' + (Array.isArray(mesh.material) ? '' : mesh.material?.name || '')).toLowerCase();
        
        const isUpper = name.includes('top') || name.includes('shirt') || name.includes('jacket') || name.includes('upper') || name.includes('cloth');
        const isLower = name.includes('bottom') || name.includes('pant') || name.includes('jean') || name.includes('trouser') || name.includes('leg');
        const isCombinedLook = name.includes('look');

        // 1. Top / Shirt / Jacket / Upper Outfit
        if (isUpper || (isCombinedLook && (topTex || topColor || (!bottomTex && !bottomColor)))) {
          const chosenTex = topTex || (isCombinedLook ? bottomTex : null);
          const chosenCol = topColor || (isCombinedLook ? bottomColor : null);
          if (chosenTex) {
            const mat = (mesh.userData.origMaterial as THREE.MeshStandardMaterial).clone();
            mat.map = chosenTex;
            mat.color.set('#ffffff');
            mat.roughness = roughness;
            mat.needsUpdate = true;
            mesh.material = mat;
          } else if (chosenCol) {
            const mat = (mesh.userData.origMaterial as THREE.MeshStandardMaterial).clone();
            mat.color.setStyle(chosenCol);
            mat.roughness = roughness;
            mat.needsUpdate = true;
            mesh.material = mat;
          } else {
            mesh.material = mesh.userData.origMaterial;
          }
        }
        // 2. Bottom / Pants / Jeans / Trousers / Lower Outfit
        else if (isLower || (isCombinedLook && (bottomTex || bottomColor))) {
          if (bottomTex) {
            const mat = (mesh.userData.origMaterial as THREE.MeshStandardMaterial).clone();
            mat.map = bottomTex;
            mat.color.set('#ffffff');
            mat.roughness = roughness;
            mat.needsUpdate = true;
            mesh.material = mat;
          } else if (bottomColor) {
            const mat = (mesh.userData.origMaterial as THREE.MeshStandardMaterial).clone();
            mat.color.setStyle(bottomColor);
            mat.roughness = roughness;
            mat.needsUpdate = true;
            mesh.material = mat;
          } else {
            mesh.material = mesh.userData.origMaterial;
          }
        }
        // 3. Shoes / Footwear
        else if (name.includes('footwear') || name.includes('shoe')) {
          if (shoeColor) {
            const mat = (mesh.userData.origMaterial as THREE.MeshStandardMaterial).clone();
            mat.color.setStyle(shoeColor);
            mat.needsUpdate = true;
            mesh.material = mat;
          }
        }
        // 4. Hair
        else if (name.includes('hair') && params?.hairColor) {
          try {
            const mat = (mesh.userData.origMaterial as THREE.MeshStandardMaterial).clone();
            mat.color.setStyle(params.hairColor);
            mat.needsUpdate = true;
            mesh.material = mat;
          } catch {}
        }
        // 5. Face / Head
        else if (name.includes('head') || name.includes('face')) {
          if (faceTex) {
            const mat = (mesh.userData.origMaterial as THREE.MeshStandardMaterial).clone();
            mat.map = faceTex;
            mat.color.set('#ffffff');
            mat.roughness = 0.65;
            mat.needsUpdate = true;
            mesh.material = mat;
          } else {
            mesh.material = mesh.userData.origMaterial;
          }
        }
      }
    });
  }, [scene, topTex, bottomTex, faceTex, topColor, bottomColor, shoeColor, params?.hairColor, roughness]);

  return <primitive object={scene} />;
}

/**
 * Minimalist modern 3D loading silhouette
 */
function TurntableLoading() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.8, 12]} />
        <meshStandardMaterial color="#bed2ee" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.26, 16, 12]} />
        <meshStandardMaterial color="#cde0fa" transparent opacity={0.5} wireframe />
      </mesh>
    </group>
  );
}

class ModelBoundary extends Component<{children:ReactNode; fallback:ReactNode; onError:()=>void},{failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError(){ return {failed:true}; }
  componentDidCatch(_error: Error, _info: ErrorInfo){ this.props.onError(); }
  render(){ return this.state.failed ? this.props.fallback : this.props.children; }
}

function Scene({
  params,
  garments,
  modelUrl = '/models/humanoid.glb',
  onCapture,
  view,
  onModelError,
  autoRotate=false,
  topTexture,
  bottomTexture,
  faceTexture,
  textureScale=3,
  textureRoughness=0.72
}:{
  params:AvatarParams;
  garments:Garment[];
  modelUrl?:string;
  onCapture?:AvatarViewerProps['onCapture'];
  view:View;
  onModelError:()=>void;
  autoRotate?:boolean;
  topTexture?:string;
  bottomTexture?:string;
  faceTexture?:string;
  textureScale?:number;
  textureRoughness?:number;
}) {
  const controls = useRef<any>(null);
  const {camera} = useThree();
  useEffect(() => {
    const positions:Record<View,[number,number,number]>={
      front:[0, 0.0, 3.6],
      side:[3.6, 0.0, 0],
      back:[0, 0.0, -3.6],
      focus:[0, 0.55, 1.8]
    };
    camera.position.set(...positions[view]);
    camera.lookAt(0, view==='focus'? 0.55 : 0.0, 0);
    controls.current?.target.set(0, view==='focus'? 0.55 : 0.0, 0);
    controls.current?.update();
  },[camera,view]);

  const top = safeColor(selected(garments,'tops')?.color ?? selected(garments,'layers')?.color, '#304d7c');
  const bottom = safeColor(selected(garments,'bottoms')?.color, '#1f2a3c');
  const shoe = safeColor(selected(garments,'shoes')?.color, '#2b1e16');

  const resolvedUrl = modelUrl || '/models/humanoid.glb';

  return <>
    <color attach="background" args={['#f4f8fe']}/>
    <hemisphereLight args={['#ffffff','#bfd1eb',1.45]}/>
    <ambientLight intensity={.75}/>
    <directionalLight position={[4,7,5]} intensity={2.2} castShadow shadow-mapSize={[1024,1024]}/>
    <directionalLight position={[-4,3,-3]} intensity={.75} color="#b8d2ff"/>
    <directionalLight position={[0,1.5,4]} intensity={1.1} color="#ffffff"/>
    
    <group position={[0, 0, 0]}>
      <ModelBoundary key={resolvedUrl} fallback={<TurntableLoading/>} onError={onModelError}>
        <Suspense fallback={<TurntableLoading/>}>
          <LoadedModel 
            url={resolvedUrl} 
            topTexture={topTexture} 
            bottomTexture={bottomTexture} 
            faceTexture={faceTexture}
            textureScale={textureScale} 
            roughness={textureRoughness}
            topColor={top}
            bottomColor={bottom}
            shoeColor={shoe}
            params={params}
          />
        </Suspense>
      </ModelBoundary>
    </group>

    {/* Clean turntable platform right under feet at -1.25 */}
    <mesh position={[0, -1.29, 0]} receiveShadow>
      <cylinderGeometry args={[0.85, 0.95, 0.08, 48]}/>
      <meshStandardMaterial color="#e4edf8" roughness={.6}/>
    </mesh>
    <mesh position={[0, -1.35, 0]} receiveShadow>
      <cylinderGeometry args={[1.0, 1.06, 0.04, 48]}/>
      <meshStandardMaterial color="#d1e0f4" roughness={.7}/>
    </mesh>
    <OrbitControls 
      ref={controls} 
      makeDefault 
      autoRotate={autoRotate} 
      autoRotateSpeed={2} 
      enablePan={false} 
      minDistance={1.8} 
      maxDistance={7.0} 
      minPolarAngle={Math.PI*.22} 
      maxPolarAngle={Math.PI*.76} 
      target={[0, -0.05, 0]}
    />
    <CaptureBridge onCapture={onCapture}/>
  </>;
}

function webglAvailable() {
  try { const c=document.createElement('canvas'); return !!(window.WebGL2RenderingContext&&c.getContext('webgl2')) || !!(window.WebGLRenderingContext&&c.getContext('webgl')); } catch { return false; }
}

export default function AvatarViewer({
  params,
  garments,
  onCapture,
  modelUrl = '/models/humanoid.glb',
  autoRotate=false,
  topTexture,
  bottomTexture,
  faceTexture,
  textureScale=3,
  textureRoughness=0.72
}:AvatarViewerProps) {
  const [view,setView]=useState<View>('front');
  const [reset,setReset]=useState(0);
  const [modelFailed,setModelFailed]=useState(false);
  const [supported]=useState(()=>typeof window!=='undefined'&&webglAvailable());
  useEffect(()=>setModelFailed(false),[modelUrl]);

  if(!supported) return <section className="avatar-viewer avatar-viewer--fallback" aria-label="Avatar preview unavailable"><div className="avatar-fallback-figure"><span/><i/><b/></div><strong>3D preview isn’t available here</strong><p>Your avatar settings and outfit are safe. Open VibeCheck in a browser with WebGL to rotate the full 3D humanoid.</p></section>;

  return <section className="avatar-viewer" aria-label="Interactive 3D avatar preview">
    <div className="avatar-stage">
      <Canvas key={reset} shadows dpr={[1,2]} camera={{position:[0, -0.05, 3.6],fov:40,near:.1,far:50}} gl={{antialias:true,alpha:false,preserveDrawingBuffer:true}}>
        <Scene 
          autoRotate={autoRotate} 
          params={params} 
          garments={garments} 
          modelUrl={modelUrl} 
          onCapture={onCapture} 
          view={view} 
          onModelError={()=>setModelFailed(true)} 
          topTexture={topTexture} 
          bottomTexture={bottomTexture} 
          faceTexture={faceTexture}
          textureScale={textureScale} 
        />
      </Canvas>
      {modelFailed&&<div className="avatar-model-error" role="status">Model file could not be rendered — check network or file format.</div>}
      <div className="avatar-drag-cue" aria-hidden="true"><span>↔</span> Drag to rotate 360°</div>
    </div>
    <div className="avatar-view-controls" role="group" aria-label="Avatar viewing angle">
      {(['front','side','back','focus'] as View[]).map(v=><button type="button" key={v} className={view===v?'active':''} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='focus'?'Close-Up':v[0].toUpperCase()+v.slice(1)}</button>)}
      <button type="button" onClick={()=>{setView('front');setReset(n=>n+1)}} aria-label="Reset avatar view">Reset</button>
    </div>
  </section>;
}
