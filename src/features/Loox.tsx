import {useState, useRef} from 'react';
import {useSearchParams, useLocation} from 'react-router-dom';
import {ArrowRight, Bookmark, Check, Download, RefreshCw, Scissors, Sparkles, Waves, Eye, EyeOff} from 'lucide-react';
import {Button, Busy, ErrorPanel, Modal, PhotoPicker, PhotoCallouts, EncouragementBadge} from '../components/ui';
import {api} from '../lib/api';
import {useStore} from '../lib/context';
import {exampleLoox, uid} from '../lib/storage';
import {imageData, download} from '../lib/images';
import type {Analysis, SavedLook} from '../../shared/types';

export default function Loox() {
  const [q] = useSearchParams();
  const location = useLocation();
  const {state, update, notify} = useStore();
  const style = state.profile.style || 'soft';

  const saved = (location.state as {saved?: SavedLook})?.saved;
  const prefillImage = (location.state as {prefillImage?: string})?.prefillImage;

  const defaultPortrait =
    style === 'sharp' ? '/assets/portrait-v2.png' : '/assets/female-portrait.png';

  const [photo, setPhoto] = useState(saved?.image || prefillImage || defaultPortrait);
  const [result, setResult] = useState<Analysis | null>(saved?.analysis || (prefillImage ? null : exampleLoox));
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(1); // Default to 'Soft layers'
  const [showHighlights, setShowHighlights] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(saved?.secondaryImage || '');
  const [previewBusy, setPreviewBusy] = useState(false);
  const revision = useRef(0);

  const choosePhoto = (s: string) => {
    revision.current++;
    setPhoto(s);
    setResult(null);
    setPreview('');
    setError('');
  };

  const runAnalysis = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.analyze({
        kind: 'loox',
        image: await imageData(photo),
        mood: 'Everyday'
      });
      setResult(res);
      setPreview('');
      setSelectedStyleIndex(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const generatePreview = async () => {
    if (!result?.hairstyles?.[selectedStyleIndex]) return;
    const currentRev = revision.current;
    setPreviewBusy(true);
    setError('');
    try {
      const chosenStyle = result.hairstyles[selectedStyleIndex];
      const data = await api.preview({
        image: await imageData(photo),
        kind: 'hair',
        prompt: `Show the hairstyle ${chosenStyle.name}: ${chosenStyle.description}. Preserve this person's face, identity, skin tone, pose, expression, clothing and background. Only change the hairstyle. Natural realistic hair.`
      });
      if (currentRev === revision.current) {
        setPreview(data.image);
      }
    } catch (e) {
      if (currentRev === revision.current) setError((e as Error).message);
    } finally {
      setPreviewBusy(false);
    }
  };

  const saveLook = () => {
    if (!result) return;
    const title = result.hairstyles?.[selectedStyleIndex]?.name || 'My look';
    update(s => ({
      ...s,
      saved: [
        {
          id: uid(),
          kind: 'loox',
          title,
          image: photo,
          secondaryImage: preview || undefined,
          analysis: result,
          createdAt: Date.now()
        },
        ...s.saved
      ]
    }));
    notify('Look saved. Come back to it anytime.');
  };

  // Pre-configured hairstyles matching 04-loox.png
  const hairstyles = result?.hairstyles || [
    {name: 'Original', description: 'Natural and effortless.'},
    {name: 'Soft layers', description: 'Modern and flattering.'},
    {name: 'Curtain bangs', description: 'Fresh and versatile.'}
  ];

  return (
    <div className="loox-page-container">
      {/* Top Header matching 04-loox.png */}
      <header className="view-header with-action">
        <div>
          <h1>Your look. Your energy.</h1>
          <p>Small details. Still you.</p>
        </div>

        <PhotoPicker onPick={choosePhoto}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
            <RefreshCw size={15} /> Change portrait
          </span>
        </PhotoPicker>
      </header>

      {busy ? (
        <Busy label="Taking a closer look at your style details…" />
      ) : (
        <div className="loox-workbench">
          {/* Left Column: Portrait with Callouts & Highlights Toggle */}
          <div>
            <div className="loox-photo-container">
              <img src={photo} alt="Portrait analysis" />

              {/* Callout Pins */}
              <PhotoCallouts
                callouts={
                  result?.callouts || [
                    {label: 'Natural volume', detail: 'Keeps some height through the crown.', x: 57, y: 13},
                    {label: 'Face-framing', detail: 'Soft tendrils frame the face.', x: 30, y: 35},
                    {label: 'Soft texture', detail: 'Gentle wave complements natural curl.', x: 65, y: 48}
                  ]
                }
                show={showHighlights && !!result}
              />

              <EncouragementBadge
                style={style}
                text={style === 'sharp' ? 'LOOKING SHARP.' : 'You’ve got this ♡'}
              />
            </div>

            {/* Below Photo Toggle Bar */}
            <div
              style={{
                marginTop: '14px',
                padding: '12px 18px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-field)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <label className="switch-field">
                <input
                  type="checkbox"
                  checked={showHighlights}
                  onChange={e => setShowHighlights(e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true" />
                Show highlights
              </label>

              <span style={{fontSize: '15px', color: 'var(--muted)'}}>
                See what makes this look work for you.
              </span>
            </div>
          </div>

          {/* Right Column: Hairstyle Selector, Match Banner & Why It Works */}
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
              <h2 style={{fontSize: 'var(--fs-section)', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--ink)'}}>Find your next look</h2>

              {/* 3 Hairstyle Cards */}
              <div className="hair-options-grid">
                {hairstyles.slice(0, 3).map((h, i) => (
                  <div
                    key={h.name}
                    className={`hair-card ${selectedStyleIndex === i ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedStyleIndex(i);
                      setPreview('');
                    }}
                  >
                    <img
                      className="hair-card-img"
                      src={photo}
                      alt={h.name}
                    />
                    {selectedStyleIndex === i && (
                      <span className="hair-check-badge">
                        <Check size={14} />
                      </span>
                    )}
                    <h4>{h.name}</h4>
                    <p>{h.description}</p>
                  </div>
                ))}
              </div>

              {/* Style Match Banner */}
              <div className="style-match-banner">
                <div className="banner-val">{result ? `${result.score}%` : '—'}</div>
                <div className="banner-text">
                  <strong>Style match</strong>
                  <span>{result ? (result.source === 'example' ? 'Sample styling inspiration' : result.summary) : 'Check this portrait to see your recommendations.'}</span>
                </div>
              </div>

              {/* Why It Works Card */}
              <div className="why-it-works-card">
                <h3>Why it works</h3>
                <div className="why-it-works-grid">
                <div className="why-item">
                  <div className="why-icon">
                    <Waves size={18} />
                  </div>
                  <div className="why-content">
                    <h4>Keeps your natural texture</h4>
                    <p>Works with what you have, not against it.</p>
                  </div>
                </div>

                <div className="why-item">
                  <div className="why-icon">
                    <Scissors size={18} />
                  </div>
                  <div className="why-content">
                    <h4>Frames your face</h4>
                    <p>Adds shape and natural movement.</p>
                  </div>
                </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Button className="block" onClick={result ? saveLook : () => void runAnalysis()}>
                  {result ? 'Save this look →' : 'Check this portrait →'}
                </Button>

                <div style={{display: 'flex', gap: '10px'}}>
                  <Button
                    secondary
                    style={{flex: 1}}
                    loading={previewBusy}
                    onClick={() => void generatePreview()}
                  >
                    <Sparkles size={16} /> AI Preview
                  </Button>

                  <Button
                    secondary
                    style={{flex: 1}}
                    onClick={() => {
                      setSelectedStyleIndex((selectedStyleIndex + 1) % hairstyles.length);
                      notify('Switched to next recommendation.');
                    }}
                  >
                    Try another style
                  </Button>
                </div>
              </div>
            </div>

            {/* Generated AI Preview Section */}
            {preview && (
              <div
                style={{
                  marginTop: '24px',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-surface)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px'}}>
                  <h3 style={{fontSize: '18px', fontWeight: 800}}>Hairstyle Preview</h3>
                  <Button
                    secondary
                    onClick={() => download(preview, 'vibecheck-hair-preview.png')}
                    style={{minHeight: '34px', padding: '6px 14px', fontSize: '12px'}}
                  >
                    <Download size={14} /> Download
                  </Button>
                </div>

                <img
                  src={preview}
                  alt="Generated hairstyle preview"
                  style={{width: '100%', borderRadius: '14px', marginBottom: '16px'}}
                />

                <Button className="block" onClick={saveLook}>
                  <Bookmark size={16} /> Save this preview
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <ErrorPanel error={error} onRetry={() => void runAnalysis()} />}
    </div>
  );
}
