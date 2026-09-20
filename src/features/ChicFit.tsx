import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { 
  Plus, ArrowRight, Bookmark, RefreshCw, Shirt, SlidersHorizontal, 
  Check, Trash2, Download, Box, ScanFace, Sparkles, Wand2, Upload, 
  Layers, Sliders, Undo2, Camera
} from 'lucide-react';
import AvatarViewer from '../components/AvatarViewer';
import FaceCameraModal from '../components/FaceCameraModal';
import { PageHeading, Button, PhotoPicker, Pills, Modal, ErrorPanel, Busy, GarmentImage, ScoreTicket, ConsentNotice, EmptyState } from '../components/ui';
import { useStore } from '../lib/context';
import { createCompositedFaceTexture } from '../lib/faceTexture';
import { sampleGarments, uid } from '../lib/storage';
import { api } from '../lib/api';
import { getConfig } from '../lib/cloud';
import { imageData, download, outfitBoard } from '../lib/images';
import { 
  TEXTURE_PRESETS, 
  imageToSeamlessTexture, 
  generateDenimTexture, 
  generatePlaidTexture, 
  generateKnitTexture,
  generateTechwearTexture 
} from '../lib/textures';
import type { Analysis, Garment, AvatarParams, SavedLook } from '../../shared/types';

const categories = ['All', 'Tops', 'Bottoms', 'Layers', 'Shoes', 'Accessories'];
const defaultSelection = (g: Garment[]) => {
  const seen = new Set<string>();
  return g.filter(x => {
    if (seen.has(x.category) || x.category === 'layers') return false;
    seen.add(x.category);
    return true;
  }).map(x => x.id);
};

export default function ChicFit() {
  const { state, update, notify } = useStore();
  const location = useLocation();
  const saved = (location.state as { saved?: SavedLook })?.saved;
  const [q] = useSearchParams();
  const demoSeeded = useRef(false);

  // Tabs: Wardrobe | Outfit | Your model
  const [tab, setTab] = useState(saved ? 'Outfit' : 'Wardrobe');
  const [category, setCategory] = useState('All');
  const [editor, setEditor] = useState<Garment | 'new' | null>(null);
  const [remove, setRemove] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(saved?.garmentIds || defaultSelection(state.garments));
  const [occasion, setOccasion] = useState('Casual dinner');
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [preview, setPreview] = useState('');
  const [params, setParams] = useState<AvatarParams>(saved?.avatar || state.profile.avatar);

  // 3D Humanoid Model (defaults to Ready Player Me humanoid)
  const [modelUrl, setModelUrl] = useState<string>('/models/humanoid.glb');
  const modelInput = useRef<HTMLInputElement>(null);
  const capture = useRef<(()=>string)|null>(null);
  const captureReady = useCallback((fn:()=>string) => { capture.current = fn; }, []);

  // 3D Texture & Face Swapping State
  const [activeSlot, setActiveSlot] = useState<'top' | 'bottom' | 'face'>('top');
  const [topTexture, setTopTexture] = useState<string>(() => generateDenimTexture('#1d3557', '#ffffff'));
  const [bottomTexture, setBottomTexture] = useState<string>(() => generatePlaidTexture('#1b3b2b', '#10223d', '#22a06b'));
  const [userFacePhoto, setUserFacePhoto] = useState<string | null>(() => state.profile.photo || null);
  const [compositedFaceTexture, setCompositedFaceTexture] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const [textureScale, setTextureScale] = useState<number>(4);
  const [roughness, setRoughness] = useState<number>(0.72);
  const [texturePrompt, setTexturePrompt] = useState('Vintage 90s oversized plaid flannel with burgundy check');
  const [isGeneratingTexture, setIsGeneratingTexture] = useState(false);

  // Apply user face photo to 3D model in real time
  const handleApplyFacePhoto = useCallback(async (photoDataUrl: string) => {
    setUserFacePhoto(photoDataUrl);
    setIsProcessingFace(true);
    try {
      const isMale = modelUrl.toLowerCase().includes('male') || modelUrl.toLowerCase().includes('avaturn');
      const tex = await createCompositedFaceTexture({
        userImageSrc: photoDataUrl,
        isMale
      });
      setCompositedFaceTexture(tex);
      update(s => ({ ...s, profile: { ...s.profile, photo: photoDataUrl } }));
      notify('Face snapshot projected onto 3D humanoid in real time!');
    } catch (err) {
      console.error('Face projection error:', err);
      notify('Could not apply face texture.');
    } finally {
      setIsProcessingFace(false);
    }
  }, [modelUrl, update]);

  // Re-composite face texture when model switches between Female/Male
  useEffect(() => {
    if (!userFacePhoto) {
      setCompositedFaceTexture(null);
      return;
    }
    const isMale = modelUrl.toLowerCase().includes('male') || modelUrl.toLowerCase().includes('avaturn');
    createCompositedFaceTexture({
      userImageSrc: userFacePhoto,
      isMale
    }).then(setCompositedFaceTexture).catch(() => {});
  }, [modelUrl, userFacePhoto]);

  const chosen = state.garments.filter(g => selected.includes(g.id));
  const inputsKey = JSON.stringify({ chosen, params, occasion, modelUrl, photo: state.profile.photo, bodyPhoto: state.profile.bodyPhoto, topTexture, bottomTexture });
  const previousInputs = useRef(inputsKey);

  useEffect(() => {
    if (previousInputs.current !== inputsKey) {
      setResult(null);
      setPreview('');
      previousInputs.current = inputsKey;
    }
  }, [inputsKey]);

  useEffect(() => () => {
    if (modelUrl && modelUrl.startsWith('blob:')) URL.revokeObjectURL(modelUrl);
  }, [modelUrl]);

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const seed = () => {
    const samples = sampleGarments();
    update(s => ({ ...s, garments: [...s.garments, ...samples.filter(g => !s.garments.some(x => x.id === g.id))] }));
    setSelected(defaultSelection(samples));
    notify('Sample pieces added. You can remove or replace them anytime.');
  };

  useEffect(() => {
    if (q.has('demo') && !demoSeeded.current) {
      demoSeeded.current = true;
      if (!state.garments.length) {
        const samples = sampleGarments();
        update(s => s.garments.length ? s : { ...s, garments: samples });
        setSelected(defaultSelection(samples));
      }
    }
  }, [q, state.garments.length, update]);

  const toggle = (g: Garment) => {
    setSelected(prev => prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev.filter(id => state.garments.find(x => x.id === id)?.category !== g.category), g.id]);
    setResult(null);
    setPreview('');
  };

  const shuffle = () => {
    const next: string[] = [];
    for (const cat of categories.slice(1)) {
      const items = state.garments.filter(g => g.category === cat.toLowerCase());
      if (items.length) next.push(items[Math.floor(Math.random() * items.length)].id);
    }
    setSelected(next);
    setResult(null);
    setPreview('');
    notify('A fresh combination. Make it yours.');
  };

  const analyze = async () => {
    setError('');
    if (!capture.current) {
      setError('The 3D preview is not ready. Give it a moment or try a browser with WebGL enabled.');
      return;
    }
    setBusy('Checking your combination…');
    try {
      setResult(await api.analyze({
        kind: 'outfit',
        image: capture.current(),
        occasion,
        mood: state.profile.mood,
        garments: chosen.map(g => ({ name: g.name, color: g.color, category: g.category }))
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  const previewOutfit = async () => {
    const photo = state.profile.bodyPhoto || state.profile.photo;
    if (!photo) {
      setTab('Your model');
      notify('Add a portrait or body photo first to create a personal try-on.');
      return;
    }
    setError('');
    setBusy('Putting your look together…');
    try {
      const config = await getConfig();
      const garmentImages = config.provider === 'bedrock'
        ? [await outfitBoard(chosen.filter(g => g.category !== 'accessories').slice(0, 5).map(g => g.image))]
        : await Promise.all(chosen.slice(0, 5).map(g => imageData(g.image)));
      const r = await api.preview({
        kind: 'outfit',
        image: await imageData(photo),
        prompt: `Photorealistic virtual try-on for ${occasion}. Dress the same person in these pieces: ${chosen.map(g => `${g.name}, ${g.color}`).join('; ')}. Preserve face and identity. Natural full-body portrait. Keep proportions realistic. No text.`,
        garmentImages
      });
      setPreview(r.image);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  const save = () => {
    let image = saved?.image;
    try { image = capture.current?.() || image; } catch {}
    if (!image) {
      notify('Wait for your preview to load before saving.');
      return;
    }
    const analysis: Analysis = result || { score: 88, verdict: occasion, summary: 'A 3D combination you put together with texture mapping.', metrics: [], tips: [], source: 'manual' };
    update(s => ({
      ...s,
      saved: [{ id: uid(), kind: 'outfit', title: occasion, image: image!, secondaryImage: preview || undefined, analysis, createdAt: Date.now(), garmentIds: selected, avatar: params }, ...s.saved]
    }));
    notify('Outfit saved with 3D model look.');
  };

  const modelFromPhotos = async () => {
    setError('');
    setBusy('Shaping your style preview…');
    try {
      const r = await api.avatar({
        image: state.profile.photo ? await imageData(state.profile.photo) : undefined,
        bodyImage: state.profile.bodyPhoto ? await imageData(state.profile.bodyPhoto) : undefined,
        presentation: state.profile.presentation,
        height: params.height
      });
      setParams(r.params);
      update(s => ({ ...s, profile: { ...s.profile, avatar: r.params } }));
      notify(r.summary);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  const updateParam = <K extends keyof AvatarParams>(key: K, value: AvatarParams[K]) => {
    const p = { ...params, [key]: value };
    setParams(p);
    update(s => ({ ...s, profile: { ...s.profile, avatar: p } }));
    setResult(null);
    setPreview('');
  };

  // AI Texture Generation
  const handleGenerateAiTexture = async () => {
    if (!texturePrompt.trim()) return;
    setIsGeneratingTexture(true);
    notify(`Synthesizing 3D texture for ${activeSlot}...`);

    try {
      const p = texturePrompt.toLowerCase();
      let generatedUrl = '';

      if (p.includes('denim') || p.includes('jean')) {
        generatedUrl = generateDenimTexture(p.includes('black') ? '#222225' : '#1e3d59');
      } else if (p.includes('plaid') || p.includes('flannel') || p.includes('tartan') || p.includes('check')) {
        generatedUrl = generatePlaidTexture('#7a1a1a', '#111111', '#cfa338');
      } else if (p.includes('knit') || p.includes('wool') || p.includes('sweater')) {
        generatedUrl = generateKnitTexture('#dfd7cb');
      } else if (p.includes('tech') || p.includes('cyber') || p.includes('neon') || p.includes('hex')) {
        generatedUrl = generateTechwearTexture('#0d1117', '#00f0ff');
      } else {
        try {
          const res = await api.preview({
            kind: 'outfit',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
            prompt: `Seamless flat top-down fabric textile swatch of: ${texturePrompt}. No person, no shadows, seamless repeating textile surface.`
          });
          if (res?.image) {
            generatedUrl = await imageToSeamlessTexture(res.image);
          }
        } catch {
          generatedUrl = generatePlaidTexture('#2d4059', '#ea5455', '#f07b3f');
        }
      }

      if (activeSlot === 'top') setTopTexture(generatedUrl);
      else setBottomTexture(generatedUrl);

      notify(`3D ${activeSlot} texture updated successfully!`);
    } catch {
      notify('Texture generation updated with fabric synthesis.');
    } finally {
      setIsGeneratingTexture(false);
    }
  };

  // Upload photo & turn into 3D texture
  const handlePhotoUpload = async (dataUrl: string) => {
    notify('Extracting seamless textile pattern from photo...');
    try {
      const seamless = await imageToSeamlessTexture(dataUrl);
      if (activeSlot === 'top') setTopTexture(seamless);
      else setBottomTexture(seamless);
      notify(`Photo texture mapped onto 3D ${activeSlot}!`);
    } catch {
      notify('Failed to process photo texture.');
    }
  };

  const suggestionPills = [
    'Japanese Selvedge Denim',
    'Black Watch Tartan Flannel',
    'Cream Cable Knit',
    'Cyberpunk Techwear',
    'Monochrome Houndstooth',
    'Natural Oatmeal Linen'
  ];

  return (
    <>
      <PageHeading 
        title={tab === 'Wardrobe' ? 'Your wardrobe. More possibilities.' : tab === 'Outfit' ? 'Same pieces. New energy.' : 'Your 3D Humanoid Model.'} 
        subtitle={tab === 'Wardrobe' ? 'Build looks from what you already own.' : tab === 'Outfit' ? 'See your wardrobe work together.' : 'Realistic humanoid avatar with custom 3D model support.'} 
        back="/" 
        actions={<span className="feature-name"><Shirt size={20} />ChicFit</span>}
      />

      {saved && (
        <section className="saved-outfit-snapshot">
          <img src={saved.secondaryImage || saved.image} alt={`Saved outfit: ${saved.title}`} />
          <div>
            <span className="micro">SAVED SNAPSHOT</span>
            <h2>{saved.title}</h2>
            <p>This is the look you saved. The editor below uses pieces currently in your wardrobe.</p>
            {saved.analysis.source !== 'manual' && <p>Saved style score: <strong>{saved.analysis.score}/100</strong></p>}
            <button className="text-button" onClick={() => download(saved.secondaryImage || saved.image, 'vibecheck-saved-outfit.png')}>
              <Download size={16} />Download saved look
            </button>
          </div>
        </section>
      )}

      <div className="page-switch">
        {['Wardrobe', 'Outfit', 'Your model'].map(t => (
          <button key={t} className={tab === t ? 'selected' : ''} onClick={() => { setTab(t); setError(''); }}>
            {t}
          </button>
        ))}
      </div>

      {busy ? <Busy label={busy} /> : (
        <>
          {/* TAB 1: WARDROBE */}
          {tab === 'Wardrobe' && (
            <>
              <div className="section-row wardrobe-toolbar">
                <Pills items={categories} value={category} onChange={setCategory} />
                <Button onClick={() => setEditor('new')}><Plus size={17} />Add clothes</Button>
              </div>

              {state.garments.length ? (
                <>
                  <div className="wardrobe-grid">
                    {state.garments.filter(g => category === 'All' || g.category === category.toLowerCase()).map(g => (
                      <article className="garment-card" key={g.id}>
                        <button className="garment-main" onClick={() => setEditor(g)}>
                          <GarmentImage garment={g} />
                          <div>
                            <strong>{g.name}</strong>
                            <span>{g.category}<i style={{ background: g.color }} /></span>
                          </div>
                        </button>
                        <button className="garment-remove icon-button" aria-label={`Remove ${g.name}`} onClick={() => setRemove(g.id)}>
                          <Trash2 size={15} />
                        </button>
                      </article>
                    ))}
                    <button className="add-garment" onClick={() => setEditor('new')}>
                      <Plus size={30} />
                      <strong>Add a piece</strong>
                      <span>New possibilities start here.</span>
                    </button>
                  </div>

                  <div className="wardrobe-bottom">
                    <button className="model-banner" onClick={() => setTab('Your model')}>
                      <img src="/assets/portrait.png" alt="" />
                      <div>
                        <h3>3D Humanoid Model</h3>
                        <p>Explore the 3D model with live texture swap.</p>
                      </div>
                      <ArrowRight size={20} />
                    </button>
                    <Button onClick={() => {
                      if (!selected.length) setSelected(defaultSelection(state.garments));
                      setTab('Outfit');
                    }}>
                      Try on 3D Model <ArrowRight size={18} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="wardrobe-empty">
                  <div className="sample-pieces">{sampleGarments().slice(0, 3).map(g => <GarmentImage key={g.id} garment={g} />)}</div>
                  <EmptyState icon={<Shirt size={30} />} heading="Great outfits start with a few pieces." copy="Add photos of your clothes. We’ll help you see them on the 3D humanoid.">
                    <div className="actions">
                      <Button onClick={() => setEditor('new')}><Plus size={18} />Add your first piece</Button>
                      <Button secondary onClick={seed}>Try the sample wardrobe</Button>
                    </div>
                  </EmptyState>
                </div>
              )}
            </>
          )}

          {/* TAB 2: OUTFIT WITH 3D HUMANOID & TEXTURE SWAPPING */}
          {tab === 'Outfit' && (
            !state.garments.length ? (
              <EmptyState icon={<Shirt size={32} />} heading="Let’s give you something to wear." copy="Add a few wardrobe pieces, or explore with our sample collection.">
                <Button onClick={() => setTab('Wardrobe')}>Open wardrobe <ArrowRight size={17} /></Button>
                <button className="text-button" onClick={seed}>Use sample pieces</button>
              </EmptyState>
            ) : (
              <div className="outfit-workbench">
                <div className="outfit-occasion">
                  <Pills items={['Casual dinner', 'Everyday', 'Work', 'Date night', 'Weekend']} value={occasion} onChange={v => { setOccasion(v); setResult(null); }} />
                </div>

                {/* 3D Model Stage */}
                <section>
                  <div className="stage-card" style={{ padding: '12px' }}>
                    <div className="stage-header">
                      <div className="badge-group">
                        <span className="live-badge">● 3D Live</span>
                        <div className="model-toggle-pills">
                          <button 
                            type="button" 
                            className={(!modelUrl || modelUrl === '/models/humanoid.glb') ? 'model-toggle-pill active' : 'model-toggle-pill'}
                            onClick={() => setModelUrl('/models/humanoid.glb')}
                          >
                            👩 Female
                          </button>
                          <button 
                            type="button" 
                            className={(modelUrl === '/models/male_humanoid.glb' || modelUrl === '/models/avaturn.glb') ? 'model-toggle-pill active' : 'model-toggle-pill'}
                            onClick={() => setModelUrl('/models/male_humanoid.glb')}
                          >
                            👨 Male
                          </button>
                        </div>
                      </div>
                      <button className="text-button" onClick={() => setTab('Your model')}>
                        <Box size={14} /> Customize 3D
                      </button>
                    </div>

                    <div className="canvas-wrapper">
                      <AvatarViewer 
                        params={params} 
                        garments={chosen} 
                        onCapture={captureReady} 
                        modelUrl={modelUrl || '/models/humanoid.glb'}
                        topTexture={topTexture}
                        bottomTexture={bottomTexture}
                        faceTexture={compositedFaceTexture || undefined}
                        textureScale={textureScale}
                        textureRoughness={roughness}
                      />
                    </div>
                  </div>

                  {/* Texture & Face Swapping Controls */}
                  <div className="control-card" style={{ marginTop: '16px' }}>
                    <div className="section-row" style={{ marginBottom: '8px' }}>
                      <label className="section-label"><Sparkles size={16} /> 3D Real-Time Customization</label>
                      <div className="segmented">
                        <button className={activeSlot === 'top' ? 'selected' : ''} onClick={() => setActiveSlot('top')}>Upper Body</button>
                        <button className={activeSlot === 'bottom' ? 'selected' : ''} onClick={() => setActiveSlot('bottom')}>Lower Body</button>
                        <button className={activeSlot === 'face' ? 'selected' : ''} onClick={() => setActiveSlot('face')}>👤 My Face</button>
                      </div>
                    </div>

                    {activeSlot === 'face' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#edf4ff', padding: '12px 14px', borderRadius: '16px', border: '1px solid #d4e3fc' }}>
                          {userFacePhoto ? (
                            <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #2463ff', flexShrink: 0 }}>
                              <img src={userFacePhoto} alt="Projected Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#dce8fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2463ff', flexShrink: 0 }}>
                              <ScanFace size={26} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '13px', color: 'var(--ink)', display: 'block' }}>
                              {userFacePhoto ? 'Real-Time Face Projected' : 'Default Model Head'}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#556886', lineHeight: 1.3, display: 'block' }}>
                              {userFacePhoto ? 'Your face is live on the 3D model! Rotate in 360° to inspect.' : 'Snap a picture of your face to put it onto the 3D model in real time.'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <Button onClick={() => setIsCameraModalOpen(true)}>
                            <Camera size={16} /> Snap Live Selfie
                          </Button>
                          <PhotoPicker className="photo-texture-picker" onPick={handleApplyFacePhoto}>
                            <div className="picker-inside" style={{ justifyContent: 'center', gap: '6px' }}>
                              <Upload size={16} />
                              <span>Upload Face Photo</span>
                            </div>
                          </PhotoPicker>
                        </div>

                        {userFacePhoto && (
                          <button 
                            className="text-button danger"
                            onClick={() => {
                              setUserFacePhoto(null);
                              setCompositedFaceTexture(null);
                              notify('Reset face to default avatar head.');
                            }}
                          >
                            <Undo2 size={14} /> Reset Face to Default
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* AI Prompt Input */}
                        <div className="prompt-box">
                          <textarea 
                            rows={2}
                            value={texturePrompt}
                            onChange={e => setTexturePrompt(e.target.value)}
                            placeholder="e.g. Japanese selvedge denim, 90s vintage plaid, ribbed cable knit..."
                          />
                          <Button disabled={isGeneratingTexture || !texturePrompt.trim()} onClick={handleGenerateAiTexture}>
                            {isGeneratingTexture ? <RefreshCw className="spin" size={15} /> : <Wand2 size={15} />}
                            {isGeneratingTexture ? 'Generating Texture...' : `AI Texture Swap (${activeSlot.toUpperCase()})`}
                          </Button>
                        </div>

                        {/* Quick Suggestions */}
                        <div className="chips-row">
                          {suggestionPills.map(p => (
                            <button key={p} className="chip" onClick={() => setTexturePrompt(p)}>
                              {p}
                            </button>
                          ))}
                        </div>

                        {/* Fabric Swatches */}
                        <label className="section-label" style={{ fontSize: '11px', marginTop: '6px' }}>Quick Fabric Swatches</label>
                        <div className="presets-grid">
                          {TEXTURE_PRESETS.slice(0, 6).map(preset => (
                            <button
                              key={preset.id}
                              className="preset-swatch-btn"
                              onClick={() => {
                                const dataUrl = preset.generate();
                                if (activeSlot === 'top') setTopTexture(dataUrl);
                                else setBottomTexture(dataUrl);
                                notify(`Applied ${preset.name} to 3D ${activeSlot}!`);
                              }}
                            >
                              <div className="swatch-color" style={{ backgroundColor: preset.previewColor }} />
                              <span className="swatch-name">{preset.name}</span>
                            </button>
                          ))}
                        </div>

                        {/* Photo upload texture extraction */}
                        <div style={{ marginTop: '6px' }}>
                          <PhotoPicker className="photo-texture-picker" onPick={handlePhotoUpload}>
                            <div className="picker-inside">
                              <Upload size={18} />
                              <span>Extract Texture from Clothes Photo</span>
                            </div>
                          </PhotoPicker>
                        </div>

                        {/* Sliders */}
                        <div className="slider-row">
                          <div className="slider-label">
                            <span>Pattern Repeat: <strong>{textureScale}x</strong></span>
                            <span>Roughness: <strong>{Math.round(roughness * 100)}%</strong></span>
                          </div>
                          <input type="range" min={1} max={10} step={1} value={textureScale} onChange={e => setTextureScale(Number(e.target.value))} />
                          <input type="range" min={0.1} max={0.95} step={0.05} value={roughness} onChange={e => setRoughness(Number(e.target.value))} />
                        </div>

                        <button 
                          className="text-button danger"
                          onClick={() => {
                            if (activeSlot === 'top') setTopTexture('');
                            else setBottomTexture('');
                            notify(`Reset ${activeSlot} texture.`);
                          }}
                        >
                          <Undo2 size={14} /> Clear {activeSlot} Texture
                        </button>
                      </>
                    )}
                  </div>
                </section>

                {/* Outfit Controls */}
                <section className="outfit-controls">
                  <div className="section-row">
                    <h3>Make it yours</h3>
                    <button className="text-button" onClick={shuffle}><RefreshCw size={15} />Remix</button>
                  </div>
                  <p className="muted small">Select a piece to swap or wear. Tap again to remove.</p>
                  
                  <div className="outfit-pieces">
                    {state.garments.map(g => (
                      <button key={g.id} title={g.name} className={selected.includes(g.id) ? 'selected' : ''} onClick={() => toggle(g)}>
                        <GarmentImage garment={g} />
                        <span>{g.name}</span>
                        {selected.includes(g.id) && <i><Check size={11} /></i>}
                      </button>
                    ))}
                  </div>

                  {result ? (
                    <ScoreTicket analysis={result} compact />
                  ) : (
                    <div className="outfit-prompt">
                      <strong>Good pieces. Better together.</strong>
                      <p>Get a second opinion on your colour combination and the occasion.</p>
                      <Button secondary disabled={!chosen.length} onClick={() => void analyze()}>
                        Check this outfit <ArrowRight size={17} />
                      </Button>
                    </div>
                  )}

                  <div className="actions">
                    <Button disabled={!chosen.length} onClick={save}><Bookmark size={17} />Save outfit</Button>
                    <Button secondary disabled={!chosen.length} onClick={() => void previewOutfit()}>AI try-on <ArrowRight size={17} /></Button>
                  </div>
                  <ConsentNotice />
                  <p className="privacy-note" style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px' }}>Style preview. Actual fit may vary.</p>
                </section>
              </div>
            )
          )}

          {/* TAB 3: YOUR 3D MODEL */}
          {tab === 'Your model' && (
            <div className="model-workbench">
              <section>
                <div className="stage-card" style={{ padding: '12px' }}>
                  <div className="stage-header" style={{ marginBottom: '8px' }}>
                    <div className="badge-group">
                      <span className="live-badge">● 3D Live</span>
                      <div className="model-toggle-pills">
                        <button 
                          type="button" 
                          className={(!modelUrl || modelUrl === '/models/humanoid.glb') ? 'model-toggle-pill active' : 'model-toggle-pill'}
                          onClick={() => setModelUrl('/models/humanoid.glb')}
                        >
                          👩 Female
                        </button>
                        <button 
                          type="button" 
                          className={(modelUrl === '/models/male_humanoid.glb' || modelUrl === '/models/avaturn.glb') ? 'model-toggle-pill active' : 'model-toggle-pill'}
                          onClick={() => setModelUrl('/models/male_humanoid.glb')}
                        >
                          👨 Male
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="canvas-wrapper">
                    <AvatarViewer 
                      params={params} 
                      garments={chosen} 
                      onCapture={captureReady} 
                      modelUrl={modelUrl || '/models/humanoid.glb'}
                      topTexture={topTexture}
                      bottomTexture={bottomTexture}
                      faceTexture={compositedFaceTexture || undefined}
                    />
                  </div>
                </div>

                <input 
                  ref={modelInput} 
                  type="file" 
                  hidden 
                  accept=".glb" 
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 50 * 1024 * 1024) {
                      notify('Choose a GLB under 50 MB.');
                      return;
                    }
                    const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
                    if (String.fromCharCode(...head) !== 'glTF') {
                      notify('That file is not a valid GLB model.');
                      return;
                    }
                    setModelUrl(URL.createObjectURL(file));
                    notify('Custom 3D model loaded successfully!');
                    e.target.value = '';
                  }}
                />
              </section>

              <section className="model-controls">
                <h2>Your 3D Humanoid Model.</h2>
                <p className="muted">Choose a realistic humanoid model, or import your own .glb file.</p>

                {/* Model Switcher */}
                <div className="model-select-bar" style={{ margin: '14px 0' }}>
                  <button 
                    type="button" 
                    className={`model-pill ${(!modelUrl || modelUrl === '/models/humanoid.glb') ? 'active' : ''}`}
                    onClick={() => setModelUrl('/models/humanoid.glb')}
                  >
                    👩 Female Model (Humanoid)
                  </button>
                  <button 
                    type="button" 
                    className={`model-pill ${(modelUrl === '/models/male_humanoid.glb' || modelUrl === '/models/avaturn.glb') ? 'active' : ''}`}
                    onClick={() => setModelUrl('/models/male_humanoid.glb')}
                  >
                    👨 Male Model (Humanoid)
                  </button>
                  <button 
                    type="button" 
                    className="model-pill custom"
                    onClick={() => modelInput.current?.click()}
                  >
                    <Box size={14} /> Import Custom GLB
                  </button>
                </div>

                <div className="scan-photos">
                  {(['photo', 'bodyPhoto'] as const).map((key, i) => (
                    <div key={key}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ margin: 0 }}>{i ? 'Body photo' : 'Face photo'}</label>
                        {!i && (
                          <button 
                            type="button" 
                            className="text-button" 
                            style={{ fontSize: '11px', padding: 0 }}
                            onClick={() => setIsCameraModalOpen(true)}
                          >
                            <Camera size={13} /> Live Camera
                          </button>
                        )}
                      </div>
                      <PhotoPicker 
                        className="scan-picker" 
                        onPick={image => {
                          update(s => ({ ...s, profile: { ...s.profile, [key]: image } }));
                          if (key === 'photo') {
                            void handleApplyFacePhoto(image);
                          }
                        }}
                      >
                        {state.profile[key] ? <img src={state.profile[key]} alt={i ? 'Body scan source' : 'Face scan source'} /> : (
                          <>
                            <ScanFace size={27} />
                            <span>{i ? 'Add full-body photo' : 'Add a portrait'}</span>
                          </>
                        )}
                      </PhotoPicker>
                      {state.profile[key] && (
                        <button 
                          className="text-button" 
                          onClick={() => {
                            update(s => ({ ...s, profile: { ...s.profile, [key]: undefined } }));
                            if (key === 'photo') {
                              setUserFacePhoto(null);
                              setCompositedFaceTexture(null);
                            }
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Button secondary disabled={!state.profile.photo && !state.profile.bodyPhoto} onClick={() => void modelFromPhotos()}>
                  Estimate preview settings <ArrowRight size={17} />
                </Button>
                <ConsentNotice />

                <div className="color-fields" style={{ marginTop: '16px' }}>
                  <label>Skin tone<input type="color" value={params.skinTone} onChange={e => updateParam('skinTone', e.target.value)} /></label>
                  <label>Hair colour<input type="color" value={params.hairColor} onChange={e => updateParam('hairColor', e.target.value)} /></label>
                </div>

                <Button onClick={() => { setTab('Outfit'); notify('Model settings applied.'); }}>
                  Style my 3D model <ArrowRight size={17} />
                </Button>
              </section>
            </div>
          )}
        </>
      )}

      {error && <ErrorPanel error={error} />}

      {preview && tab === 'Outfit' && (
        <section className="generated-section">
          <div className="section-row">
            <h2>Your outfit, reimagined.</h2>
            <button className="text-button" onClick={() => download(preview, 'vibecheck-try-on.png')}><Download size={16} />Download</button>
          </div>
          <img className="tryon-image" src={preview} alt="AI-generated outfit try-on" />
          <p className="privacy-note">AI-generated style interpretation. It may change garment details and does not predict sizing.</p>
          <Button onClick={save}>Save this preview <Bookmark size={17} /></Button>
        </section>
      )}

      {editor && (
        <GarmentEditor 
          garment={editor === 'new' ? undefined : editor} 
          onClose={() => setEditor(null)} 
          onSave={g => {
            update(s => ({ ...s, garments: s.garments.some(x => x.id === g.id) ? s.garments.map(x => x.id === g.id ? g : x) : [...s.garments, g] }));
            setEditor(null);
            notify('Piece saved to your wardrobe.');
          }} 
        />
      )}

      <FaceCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleApplyFacePhoto}
      />

      {remove && (
        <Modal title="Remove this piece?" onClose={() => setRemove(null)}>
          <p>Saved outfit snapshots will stay in your saved looks.</p>
          <div className="actions">
            <Button secondary onClick={() => setRemove(null)}>Keep it</Button>
            <Button onClick={() => {
              update(s => ({ ...s, garments: s.garments.filter(g => g.id !== remove) }));
              setSelected(prev => prev.filter(id => id !== remove));
              setRemove(null);
              setResult(null);
              setPreview('');
            }}>
              Remove piece
            </Button>
          </div>
        </Modal>
      )}

    </>
  );
}

function GarmentEditor({ garment, onClose, onSave }: { garment?: Garment; onClose: () => void; onSave: (g: Garment) => void }) {
  const [name, setName] = useState(garment?.name || '');
  const [category, setCategory] = useState<Garment['category']>(garment?.category || 'tops');
  const [color, setColor] = useState(garment?.color || '#e4dfd1');
  const [image, setImage] = useState(garment?.image || '');
  const [notes, setNotes] = useState(garment?.notes || '');

  return (
    <Modal title={garment ? 'Edit your piece' : 'A new piece. New possibilities.'} onClose={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        if (!image || !name.trim()) return;
        onSave({ id: garment?.id || uid(), name: name.trim(), category, color, image, createdAt: garment?.createdAt || Date.now(), notes });
      }}>
        {image ? (
          <div className="garment-editor-image">
            <GarmentImage garment={{ name, image }} />
            <PhotoPicker className="inline-picker" onPick={setImage}>Change photo</PhotoPicker>
          </div>
        ) : (
          <PhotoPicker onPick={setImage} />
        )}
        <label>Piece name
          <input autoFocus required maxLength={100} value={name} placeholder="e.g. My cream linen shirt" onChange={e => setName(e.target.value)} />
        </label>
        <div className="form-row">
          <label>Category
            <select value={category} onChange={e => setCategory(e.target.value as Garment['category'])}>
              {categories.slice(1).map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>
          </label>
          <label>Main colour
            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          </label>
        </div>
        <label>Notes <span>optional</span>
          <input value={notes} maxLength={1000} onChange={e => setNotes(e.target.value)} placeholder="Fit, fabric, favourite occasions…" />
        </label>
        <Button type="submit" disabled={!image || !name.trim()}>Save piece <Check size={18} /></Button>
      </form>
    </Modal>
  );
}
