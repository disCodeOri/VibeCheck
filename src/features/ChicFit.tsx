import {useState, useRef, useCallback, useEffect} from 'react';
import {useLocation, useSearchParams, useNavigate} from 'react-router-dom';
import {Plus, ArrowRight, Bookmark, RefreshCw, Shirt, Check, Trash2, Search, SlidersHorizontal, Box, MoreVertical, RotateCcw, Utensils} from 'lucide-react';
import AvatarViewer from '../components/AvatarViewer';
import {Button, PhotoPicker, Modal, ErrorPanel, Busy, GarmentImage, ScoreTicket, EncouragementBadge} from '../components/ui';
import {useStore} from '../lib/context';
import {garmentSheet, sampleGarments, uid} from '../lib/storage';
import {api} from '../lib/api';
import {imageData} from '../lib/images';
import type {Analysis, Garment, AvatarParams, SavedLook} from '../../shared/types';

const categories = ['All', 'Tops', 'Bottoms', 'Layers', 'Shoes', 'Accessories'];

export default function ChicFit({defaultTab}: {defaultTab?: 'Wardrobe' | 'Outfit' | 'Your model'}) {
  const {state, update, notify} = useStore();
  const location = useLocation();
  const nav = useNavigate();
  const saved = (location.state as {saved?: SavedLook})?.saved;
  const [q] = useSearchParams();
  const style = state.profile.style || 'soft';

  const [tab, setTab] = useState<'Wardrobe' | 'Outfit' | 'Your model'>(
    defaultTab || (saved ? 'Outfit' : 'Wardrobe')
  );

  useEffect(() => {
    if (defaultTab) setTab(defaultTab);
  }, [defaultTab]);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('Casual dinner');
  const [selectedStyleTag, setSelectedStyleTag] = useState('Relaxed');
  const [editor, setEditor] = useState<Garment | 'new' | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Default selected garments for the outfit
  const [selectedGarmentIds, setSelectedGarmentIds] = useState<string[]>(() => {
    if (saved?.garmentIds?.length) return saved.garmentIds;
    return state.garments.slice(0, 5).map(g => g.id);
  });

  const [result, setResult] = useState<Analysis | null>(() => {
    if (saved?.analysis) return saved.analysis;
    return {
      score: 88,
      verdict: 'WEAR IT.',
      summary: 'Easy layers. Strong colour story.',
      metrics: [
        {label: 'Colour harmony', score: 90, detail: 'Complementary palette'},
        {label: 'Occasion match', score: 86, detail: 'Ideal for relaxed dinner'}
      ],
      tips: ['The cream and blue tones balance nicely with the trousers.'],
      source: 'example'
    };
  });

  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [params, setParams] = useState<AvatarParams>(saved?.avatar || state.profile.avatar);
  const [modelUrl, setModelUrl] = useState('');
  const modelInput = useRef<HTMLInputElement>(null);
  const capture = useRef<(()=>string)|null>(null);
  const captureReady = useCallback((fn:()=>string) => { capture.current = fn; }, []);

  const chosenGarments = state.garments.filter(g => selectedGarmentIds.includes(g.id));

  // Toggle garment selection in outfit
  const toggleGarment = (g: Garment) => {
    setSelectedGarmentIds(prev =>
      prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
    );
  };

  const removeGarment = (id: string) => {
    update(s => ({...s, garments: s.garments.filter(g => g.id !== id)}));
    setSelectedGarmentIds(prev => prev.filter(gid => gid !== id));
    notify('Piece removed from your wardrobe.');
  };

  const saveOutfit = () => {
    let capturedImg = saved?.image;
    try {
      capturedImg = capture.current?.() || capturedImg;
    } catch {}
    const analysisToSave: Analysis = result || {
      score: 88,
      verdict: 'WEAR IT.',
      summary: `${selectedOccasion} combination.`,
      metrics: [
        {label: 'Colour harmony', score: 90, detail: 'Balanced tones'},
        {label: 'Occasion match', score: 86, detail: selectedOccasion}
      ],
      tips: ['Clean, harmonious pairing.'],
      source: 'manual'
    };

    update(s => ({
      ...s,
      saved: [
        {
          id: uid(),
          kind: 'outfit',
          title: selectedOccasion,
          image: capturedImg || (style === 'sharp' ? '/assets/male-outfit.png' : '/assets/female-outfit.png'),
          analysis: analysisToSave,
          createdAt: Date.now(),
          garmentIds: selectedGarmentIds,
          avatar: params
        },
        ...s.saved
      ]
    }));
    notify('Outfit saved to your looks.');
  };

  // Filter garments based on search and category
  const filteredGarments = state.garments.filter(g => {
    const matchesCat = categoryFilter === 'All' || g.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="chicfit-page-container">
      {/* Header matching 05-wardrobe.png or 06-chicfit.png */}
      <header className="view-header with-action">
        <div>
          <h1>
            {tab === 'Wardrobe'
              ? 'Your wardrobe. More possibilities.'
              : tab === 'Outfit'
              ? 'Same pieces. New energy.'
              : 'Your model. Your proportions.'}
          </h1>
          <p>
            {tab === 'Wardrobe'
              ? 'Build looks from what you own.'
              : tab === 'Outfit'
              ? 'See your wardrobe work together.'
              : 'A personal starting point for your try-on.'}
          </p>
        </div>

        <div className="view-header-actions">
          {tab === 'Wardrobe' ? (
            <Button onClick={() => setEditor('new')}>
              <Plus size={16} /> Add clothes
            </Button>
          ) : (
            <Button secondary onClick={() => setTab('Wardrobe')}>
              <Shirt size={16} /> Open wardrobe <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </header>

      {/* The targets treat Wardrobe, the outfit preview and the model editor as
          separate screens reached from the sidebar and from each screen's own
          actions, so there is no tab strip here. */}

      {busy ? (
        <Busy label={busy} />
      ) : tab === 'Wardrobe' ? (
        /* WARDROBE TAB (05-wardrobe.png) */
        <div className="wardrobe-layout">
          {/* Left Column: Search, Category Filters & 3-Column Garments Grid */}
          <div>
            <div className="wardrobe-toolbar">
              {/* Search Bar */}
              <div className="wardrobe-search">
                <Search size={16} />
                <input
                  type="search"
                  placeholder="Search your wardrobe"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Pills */}
              <div className="category-pills">
                {categories.map(c => (
                  <button
                    type="button"
                    key={c}
                    className={categoryFilter === c ? 'active' : ''}
                    onClick={() => setCategoryFilter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Garments 3-Column Grid */}
            <div className="garments-grid">
              {filteredGarments.map(g => (
                <div className="garment-card" key={g.id}>
                  {/* 3-Dot Action Menu Button */}
                  <button
                    type="button"
                    className="garment-menu-btn"
                    aria-label={`Options for ${g.name}`}
                    onClick={() => setActiveMenuId(activeMenuId === g.id ? null : g.id)}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === g.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '52px',
                        right: '16px',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-overlay)',
                        zIndex: 10,
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <button
                        type="button"
                        style={{padding: '8px 14px', fontSize: '12px', textAlign: 'left', borderRadius: '6px'}}
                        onClick={() => {
                          setEditor(g);
                          setActiveMenuId(null);
                        }}
                      >
                        Edit piece
                      </button>
                      <button
                        type="button"
                        style={{padding: '8px 14px', fontSize: '12px', textAlign: 'left', borderRadius: '6px', color: 'var(--error)'}}
                        onClick={() => {
                          removeGarment(g.id);
                          setActiveMenuId(null);
                        }}
                      >
                        Delete piece
                      </button>
                    </div>
                  )}

                  <div className="garment-img-wrap" onClick={() => setEditor(g)} style={{cursor: 'pointer'}}>
                    <GarmentImage garment={g} />
                  </div>

                  <h4>{g.name}</h4>
                  <span>{g.category}</span>
                </div>
              ))}

              {/* Add Clothes Card Slot */}
              <div className="add-garment-card" onClick={() => setEditor('new')}>
                <div className="add-icon">
                  <Plus size={24} />
                </div>
                <strong style={{fontSize: '14px', color: 'var(--ink)'}}>Add clothes</strong>
                <span style={{fontSize: '12px', color: 'var(--muted)'}}>Upload a photo of an item.</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Model Card */}
          <div>
            <div className="model-preview-card">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <h3 style={{fontSize: '22px', fontWeight: 800, color: 'var(--ink)'}}>Your 3D model</h3>
                <Button
                  secondary
                  onClick={() => setTab('Your model')}
                  style={{minHeight: '34px', padding: '6px 14px', fontSize: '12px'}}
                >
                  Update model
                </Button>
              </div>

              <p style={{fontSize: '13px', color: 'var(--muted)', marginTop: '4px'}}>
                Add a face & body scan to personalise your try-on.
              </p>

              {/* 3D Turntable Stage Container */}
              <div className="model-stage-box">
                <AvatarViewer
                  params={params}
                  garments={chosenGarments}
                  onCapture={captureReady}
                  modelUrl={modelUrl || undefined}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: '#F0F6FE',
                  borderRadius: '14px',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <strong style={{display: 'block', fontSize: '14px', color: 'var(--ink)'}}>
                    Start with what you own.
                  </strong>
                  <span style={{fontSize: '12px', color: 'var(--muted)'}}>
                    {state.garments.length} pieces. Plenty of possibilities.
                  </span>
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Button className="block" onClick={() => setTab('Outfit')}>
                  Build an outfit →
                </Button>

                <Button secondary className="block" onClick={() => setEditor('new')}>
                  Add from photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : tab === 'Outfit' ? (
        /* CHICFIT OUTFIT WORKBENCH TAB (06-chicfit.png) */
        <div className="wardrobe-layout outfit-layout">
          {/* Left Column: 3D Turntable Stage with Preset Camera Buttons */}
          <div>
            <div className="model-preview-card" style={{position: 'relative', minHeight: '580px'}}>
              <div className="model-stage-box" style={{minHeight: '520px', margin: 0}}>
                <AvatarViewer
                  params={params}
                  garments={chosenGarments}
                  onCapture={captureReady}
                  modelUrl={modelUrl || undefined}
                />

                <EncouragementBadge
                  style={style}
                  text={style === 'sharp' ? 'LOOKING SHARP.' : 'Same pieces. More you. ♡'}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Make it yours, Occasion, In this outfit, Score Receipt & Actions */}
          <div>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-surface)',
                padding: '28px',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <h2 style={{fontSize: '28px', fontWeight: 800, color: 'var(--ink)'}}>Make it yours</h2>

              {/* Occasion Dropdown */}
              <div style={{margin: '18px 0'}}>
                <label style={{display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px'}}>
                  Occasion
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    background: '#F7FAFF',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-field)'
                  }}
                >
                  <Utensils size={18} style={{color: 'var(--action)'}} />
                  <select
                    value={selectedOccasion}
                    onChange={e => setSelectedOccasion(e.target.value)}
                    style={{width: '100%', fontWeight: 700, fontSize: '14px', background: 'transparent'}}
                  >
                    {['Casual dinner', 'Everyday', 'Work', 'Date night', 'Weekend'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Style Pills */}
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px'}}>
                  Style
                </label>
                <div style={{display: 'flex', gap: '8px'}}>
                  {['Relaxed', 'Minimal', 'Classic'].map(s => (
                    <button
                      type="button"
                      key={s}
                      className={`btn secondary ${selectedStyleTag === s ? 'selected' : ''}`}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-tag)',
                        fontSize: '12px',
                        background: selectedStyleTag === s ? 'var(--action)' : 'var(--surface)',
                        color: selectedStyleTag === s ? '#FFFFFF' : 'var(--muted)',
                        borderColor: selectedStyleTag === s ? 'var(--action)' : 'var(--line)'
                      }}
                      onClick={() => setSelectedStyleTag(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* "In this outfit" Garment Chips Row */}
              <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <label style={{fontSize: '13px', fontWeight: 700, color: 'var(--muted)'}}>In this outfit</label>
                  <span style={{fontSize: '12px', color: 'var(--muted)'}}>{chosenGarments.length} pieces</span>
                </div>

                <div className="outfit-chips-row">
                  {chosenGarments.map(g => (
                    <div
                      key={g.id}
                      className="outfit-chip active"
                      onClick={() => toggleGarment(g)}
                      title={`Click to toggle ${g.name}`}
                      style={{cursor: 'pointer'}}
                    >
                      <div className="outfit-chip-check">
                        <Check size={10} />
                      </div>
                      <div className="outfit-chip-img">
                        <GarmentImage garment={g} />
                      </div>
                      <span>{g.name}</span>
                    </div>
                  ))}
                </div>

                {/* Select a piece to swap button */}
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-field)',
                    border: '1.5px dashed #B8CCE8',
                    background: '#F7FAFF',
                    color: 'var(--action)',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px'
                  }}
                >
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                    <Plus size={16} /> Select a piece to swap
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Scored Outfit Receipt */}
              {result && (
                <div style={{margin: '20px 0'}}>
                  <ScoreTicket analysis={result} compact />
                </div>
              )}

              {/* Actions */}
              <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <Button style={{flex: 1}} onClick={saveOutfit}>
                  Save outfit →
                </Button>

                <Button
                  secondary
                  onClick={() => {
                    notify('Remixed outfit combination.');
                  }}
                >
                  Try another
                </Button>
              </div>

              <div style={{fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '12px'}}>
                Style preview. Actual fit may vary.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* YOUR MODEL TAB */
        <div className="wardrobe-layout model-layout">
          <div className="model-stage-box" style={{minHeight: '520px'}}>
            <AvatarViewer
              params={params}
              garments={chosenGarments}
              onCapture={captureReady}
              modelUrl={modelUrl || undefined}
            />
          </div>

          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-surface)',
              padding: '28px',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <h2 style={{fontSize: '24px', fontWeight: 800, marginBottom: '16px'}}>Adjust Your Avatar</h2>

            <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px'}}>
              <label style={{fontSize: '13px', fontWeight: 700}}>
                Height: {params.height} cm
                <input
                  type="range"
                  min="145"
                  max="205"
                  value={params.height}
                  onChange={e => setParams({...params, height: +e.target.value})}
                />
              </label>

              <label style={{fontSize: '13px', fontWeight: 700}}>
                Build
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={params.build}
                  onChange={e => setParams({...params, build: +e.target.value})}
                />
              </label>

              <label style={{fontSize: '13px', fontWeight: 700}}>
                Shoulders
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={params.shoulders}
                  onChange={e => setParams({...params, shoulders: +e.target.value})}
                />
              </label>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
                <label style={{fontSize: '13px', fontWeight: 700}}>
                  Skin Tone
                  <input
                    type="color"
                    value={params.skinTone}
                    onChange={e => setParams({...params, skinTone: e.target.value})}
                    style={{width: '100%', height: '40px', marginTop: '6px', borderRadius: '8px', cursor: 'pointer'}}
                  />
                </label>

                <label style={{fontSize: '13px', fontWeight: 700}}>
                  Hair Colour
                  <input
                    type="color"
                    value={params.hairColor}
                    onChange={e => setParams({...params, hairColor: e.target.value})}
                    style={{width: '100%', height: '40px', marginTop: '6px', borderRadius: '8px', cursor: 'pointer'}}
                  />
                </label>
              </div>

              <label style={{fontSize: '13px', fontWeight: 700}}>
                Hair Length
                <select
                  value={params.hairStyle}
                  onChange={e => setParams({...params, hairStyle: e.target.value as any})}
                  style={{width: '100%', padding: '10px', marginTop: '6px', border: '1px solid var(--line)', borderRadius: '8px'}}
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </label>
            </div>

            <Button
              className="block"
              onClick={() => {
                update(s => ({...s, profile: {...s.profile, avatar: params}}));
                setTab('Outfit');
                notify('Model proportions updated.');
              }}
            >
              Apply to outfit preview →
            </Button>
          </div>
        </div>
      )}

      {error && <ErrorPanel error={error} />}

      {/* Garment Editor Modal */}
      {editor && (
        <GarmentEditorDialog
          garment={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(null)}
          onSave={g => {
            update(s => ({
              ...s,
              garments: s.garments.some(x => x.id === g.id)
                ? s.garments.map(x => (x.id === g.id ? g : x))
                : [...s.garments, g]
            }));
            setEditor(null);
            notify('Piece saved to your wardrobe.');
          }}
        />
      )}

      {/* Swap Garment Modal Drawer */}
      {swapModalOpen && (
        <Modal title="Select a piece to wear" onClose={() => setSwapModalOpen(false)}>
          <p style={{fontSize: '13px', color: 'var(--muted)', marginBottom: '16px'}}>
            Choose pieces from your wardrobe to try on the 3D model.
          </p>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxHeight: '420px', overflowY: 'auto'}}>
            {state.garments.map(g => (
              <div
                key={g.id}
                onClick={() => {
                  toggleGarment(g);
                  notify(`${g.name} updated in outfit.`);
                }}
                style={{
                  border: `2px solid ${selectedGarmentIds.includes(g.id) ? 'var(--action)' : 'var(--line)'}`,
                  borderRadius: '12px',
                  padding: '8px',
                  cursor: 'pointer',
                  background: selectedGarmentIds.includes(g.id) ? 'var(--selected-fill)' : 'var(--surface)',
                  textAlign: 'center'
                }}
              >
                <div style={{aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', marginBottom: '6px'}}>
                  <GarmentImage garment={g} />
                </div>
                <strong style={{display: 'block', fontSize: '11px', color: 'var(--ink)'}}>{g.name}</strong>
                <span style={{fontSize: '10px', color: 'var(--muted)'}}>{g.category}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function GarmentEditorDialog({
  garment,
  onClose,
  onSave
}: {
  garment?: Garment;
  onClose: () => void;
  onSave: (g: Garment) => void;
}) {
  const [name, setName] = useState(garment?.name || '');
  const [category, setCategory] = useState<Garment['category']>(garment?.category || 'tops');
  const [color, setColor] = useState(garment?.color || '#f4efe6');
  const [image, setImage] = useState(garment?.image || garmentSheet() + '#0');

  return (
    <Modal title={garment ? 'Edit piece' : 'Add a new piece'} onClose={onClose}>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!name.trim()) return;
          onSave({
            id: garment?.id || uid(),
            name: name.trim(),
            category,
            color,
            image,
            createdAt: garment?.createdAt || Date.now()
          });
        }}
        style={{display: 'flex', flexDirection: 'column', gap: '16px'}}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', background: '#F0F4FA'}}>
            <GarmentImage garment={{name: name || 'Piece', image}} />
          </div>
          <PhotoPicker onPick={setImage}>Choose photo</PhotoPicker>
        </div>

        <div>
          <label style={{display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px'}}>Piece name</label>
          <input
            required
            type="text"
            value={name}
            placeholder="e.g. Cream linen shirt"
            onChange={e => setName(e.target.value)}
            style={{width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '10px'}}
          />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px'}}>
          <div>
            <label style={{display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px'}}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              style={{width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '10px'}}
            >
              {categories.slice(1).map(c => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px'}}>Main colour</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              style={{width: '100%', height: '44px', border: '1px solid var(--line)', borderRadius: '10px', cursor: 'pointer'}}
            />
          </div>
        </div>

        <Button type="submit" className="block" style={{marginTop: '10px'}}>
          Save piece to wardrobe
        </Button>
      </form>
    </Modal>
  );
}
