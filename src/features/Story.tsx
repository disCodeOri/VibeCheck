import {useState, useEffect} from 'react';
import {useSearchParams, useLocation, useNavigate} from 'react-router-dom';
import {ArrowRight, Bookmark, Crop, Copy, Download, Images, Sparkles, RefreshCw, FileText, Check} from 'lucide-react';
import {Button, ScoreTicket, ErrorPanel, Busy, Modal, PhotoPicker, EncouragementBadge} from '../components/ui';
import {useStore} from '../lib/context';
import {api} from '../lib/api';
import {imageData, cropImage, download} from '../lib/images';
import {exampleAnalysis, uid} from '../lib/storage';
import type {Analysis, CompareResult, SavedLook} from '../../shared/types';

export default function Story() {
  const [query] = useSearchParams();
  const location = useLocation();
  const nav = useNavigate();
  const {state, update, notify} = useStore();
  const style = state.profile.style || 'soft';

  const saved = (location.state as {saved?: SavedLook})?.saved;
  const prefillImage = (location.state as {prefillImage?: string})?.prefillImage;

  const defaultPhoto =
    style === 'sharp' ? '/assets/portrait-v2.png' : '/assets/female-portrait.png';

  const [compare, setCompare] = useState(query.has('compare'));
  const [image, setImage] = useState(saved?.image || prefillImage || defaultPhoto);
  const [imageB, setImageB] = useState('');
  const [refs, setRefs] = useState<string[]>([]);
  const [format, setFormat] = useState<'Story' | 'Post'>('Story');
  const [mood, setMood] = useState(state.profile.mood || 'Effortless');
  const [result, setResult] = useState<Analysis | null>(saved?.analysis || (prefillImage ? null : exampleAnalysis));
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [crop, setCrop] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [moodMenuOpen, setMoodMenuOpen] = useState(false);

  useEffect(() => {
    if (query.has('compare')) {
      setCompare(true);
      if (!imageB && image === defaultPhoto) {
        // Sample crop for photo B comparison
        void cropImage(image, 1.15, 45, 4 / 5)
          .then(cropped => {
            setImageB(cropped);
            setComparison({
              winner: 'b',
              summary: 'A closer frame puts the focus on you.',
              styleMatch: 89,
              a: {
                ...exampleAnalysis,
                score: 84,
                metrics: [
                  {label: 'Warmth', score: 72, detail: 'Original lighting'},
                  {label: 'Framing', score: 68, detail: 'Wider field'}
                ]
              },
              b: {
                ...exampleAnalysis,
                score: 92,
                metrics: [
                  {label: 'Warmth', score: 94, detail: 'Warmer highlights'},
                  {label: 'Framing', score: 93, detail: 'Balanced subject frame'}
                ]
              },
              source: 'example'
            });
          })
          .catch(() => {});
      }
    }
  }, [query, image, imageB]);

  const changeImage = (src: string) => {
    setImage(src);
    setResult(null);
    setComparison(null);
    setError('');
  };

  const runAnalysis = async () => {
    setBusy(true);
    setError('');
    try {
      const referenceImages = await Promise.all(refs.map(imageData));
      if (compare) {
        if (!imageB) {
          setError('Please select or crop a second photo for comparison.');
          setBusy(false);
          return;
        }
        const res = await api.compare({
          imageA: await imageData(image),
          imageB: await imageData(imageB),
          mood,
          referenceImages
        });
        setComparison(res);
      } else {
        const res = await api.analyze({
          kind: 'story',
          image: await imageData(image),
          mood,
          format: format.toLowerCase() as 'story' | 'post',
          referenceImages
        });
        setResult(res);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveCheck = (photoToSave = image, analysisToSave = result) => {
    if (!analysisToSave) return;
    update(s => ({
      ...s,
      saved: [
        {
          id: uid(),
          kind: 'story',
          title: analysisToSave.verdict,
          image: photoToSave,
          analysis: analysisToSave,
          createdAt: Date.now()
        },
        ...s.saved
      ]
    }));
    notify('Saved to your looks.');
  };

  // 3 sample style match images from configured photography assets
  const styleMatchThumbs =
    style === 'sharp'
      ? ['/assets/male-portrait.png', '/assets/male-outfit.png', '/assets/portrait-v2.png']
      : ['/assets/female-portrait.png', '/assets/female-outfit.png', '/assets/demo-female-portrait.png'];

  return (
    <div className="story-page-container">
      {/* Page Heading matching 02-story-result.png & 03-compare.png */}
      <header className="view-header with-action">
        <div>
          <h1>{compare ? 'Same you. Clearer choice.' : 'Your moment. Checked.'}</h1>
          <p>
            {compare
              ? 'Compare the shot, the mood and your style.'
              : 'A little perspective before you post.'}
          </p>
        </div>

        <div className="view-header-actions">
          <div className="style-switcher" role="group" aria-label="Format selector">
            <button
              type="button"
              className={format === 'Story' ? 'active' : ''}
              onClick={() => {
                setFormat('Story');
                setResult(null);
              }}
            >
              Story
            </button>
            <button
              type="button"
              className={format === 'Post' ? 'active' : ''}
              onClick={() => {
                setFormat('Post');
                setResult(null);
              }}
            >
              Post
            </button>
          </div>

          <PhotoPicker onPick={changeImage}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
              <RefreshCw size={15} /> Change photo
            </span>
          </PhotoPicker>
        </div>
      </header>

      {busy ? (
        <Busy label={compare ? 'Finding the stronger story…' : 'Checking the light, framing, and feeling…'} />
      ) : compare ? (
        /* TWO-PHOTO COMPARE VIEW (03-compare.png) */
        <div className="story-workbench">
          {/* Left Column: Equal Side-by-Side Panes & Style Comparison */}
          <div>
            <div className="compare-panes-grid">
              {/* Photo A */}
              <div className={`compare-pane-card ${comparison?.winner === 'a' ? 'recommended' : ''}`}>
                <div className="pane-badge-top">
                  <span className="pane-label-pill">A · Original</span>
                  {comparison?.winner === 'a' && (
                    <span className="recommended-pill">
                      <Check size={13} /> Recommended
                    </span>
                  )}
                </div>
                <img src={image} alt="Original photo" />
                <div className="pane-caption">Original photo</div>
              </div>

              {/* Photo B */}
              <div className={`compare-pane-card ${comparison?.winner === 'b' ? 'recommended' : ''}`}>
                <div className="pane-badge-top">
                  <span className="pane-label-pill">B · Closer crop</span>
                  {comparison?.winner === 'b' && (
                    <span className="recommended-pill">
                      <Check size={13} /> Recommended
                    </span>
                  )}
                </div>
                {imageB ? (
                  <img src={imageB} alt="Closer crop" />
                ) : (
                  <div style={{aspectRatio: '4 / 5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4FA'}}>
                    <PhotoPicker onPick={setImageB}>Add Photo B</PhotoPicker>
                  </div>
                )}
                <div className="pane-caption">Selected crop</div>
              </div>
            </div>

            {/* Compare with your style bar */}
            <div
              style={{
                marginTop: '20px',
                padding: '18px 22px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-surface)'
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                <div>
                  <h4 style={{fontSize: '15px', fontWeight: 800}}>Compare with your style</h4>
                  <p style={{fontSize: '12px', color: 'var(--muted)'}}>See how this fits with your recent posts.</p>
                </div>
                <div style={{display: 'flex', gap: '6px'}}>
                  {['Warm tones', 'Relaxed', 'Natural light'].map(t => (
                    <span
                      key={t}
                      style={{
                        padding: '4px 10px',
                        background: '#EDF4FE',
                        color: 'var(--action)',
                        borderRadius: 'var(--radius-tag)',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{display: 'flex', gap: '12px'}}>
                {styleMatchThumbs.map((s, i) => (
                  <img
                    key={i}
                    src={s}
                    alt="Reference post"
                    style={{width: '32%', height: '80px', objectFit: 'cover', borderRadius: '10px'}}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Comparative Evaluation & Actions */}
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
              <h2 style={{fontSize: '32px', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--ink)'}}>
                {comparison ? (comparison.winner === 'tie' ? 'Two good choices.' : 'This one’s your vibe.') : 'Find your stronger shot.'}
              </h2>
              <p style={{fontSize: '15px', color: 'var(--muted)', marginTop: '4px', marginBottom: '20px'}}>
                {comparison?.summary || 'Add both photos, then compare their light and framing.'}
              </p>

              {/* Style match metric */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  background: '#F0F7FE',
                  borderRadius: '16px',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <div style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)'}}>Style match</div>
                  <div style={{fontFamily: 'var(--font-barlow)', fontSize: '52px', fontWeight: 800, lineHeight: 0.9, color: 'var(--ink)'}}>
                    {comparison?.styleMatch != null ? `${comparison.styleMatch}%` : '—'}
                  </div>
                </div>
                <div style={{fontSize: '13px', color: 'var(--muted)', borderLeft: '1px solid var(--line)', paddingLeft: '16px'}}>
                  {comparison?.source === 'example' ? 'Sample comparison' : 'Your photo comparison'}
                </div>
              </div>

              {/* Metric comparative rows */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px'}}>
                {comparison && comparison.a.metrics.slice(0, 3).map((metric, i) => (
                  <div className="compare-live-metric" key={metric.label}>
                    <strong>{metric.label}</strong>
                    {[comparison.a, comparison.b].map((item, side) => (
                      <div className="compare-live-row" key={side}>
                        <small>{side ? 'B' : 'A'}</small>
                        <div className="metric-bar-track"><div className="metric-bar-fill" style={{width: `${item.metrics[i]?.score || 0}%`, opacity: side ? 1 : .45}} /></div>
                        <small>{item.metrics[i]?.score ?? '—'}</small>
                      </div>
                    ))}
                  </div>
                ))}
                <div hidden>
                <div style={{display: 'grid', gridTemplateColumns: '70px 1fr 30px', alignItems: 'center', gap: '10px', fontSize: '13px'}}>
                  <span style={{fontWeight: 700}}>Warmth</span>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <small style={{width: '12px'}}>A</small>
                      <div className="metric-bar-track" style={{flex: 1}}>
                        <div className="metric-bar-fill" style={{width: '72%', opacity: 0.6}} />
                      </div>
                      <small>72</small>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <small style={{width: '12px'}}>B</small>
                      <div className="metric-bar-track" style={{flex: 1}}>
                        <div className="metric-bar-fill" style={{width: '94%'}} />
                      </div>
                      <small>94</small>
                    </div>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '70px 1fr 30px', alignItems: 'center', gap: '10px', fontSize: '13px'}}>
                  <span style={{fontWeight: 700}}>Framing</span>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <small style={{width: '12px'}}>A</small>
                      <div className="metric-bar-track" style={{flex: 1}}>
                        <div className="metric-bar-fill" style={{width: '68%', opacity: 0.6}} />
                      </div>
                      <small>68</small>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <small style={{width: '12px'}}>B</small>
                      <div className="metric-bar-track" style={{flex: 1}}>
                        <div className="metric-bar-fill" style={{width: '93%'}} />
                      </div>
                      <small>93</small>
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* Tweak Tip */}
              <div className="tweak-card" style={{marginBottom: '24px'}}>
                <Sparkles size={20} />
                <div>
                  <div className="tweak-title">Framing insight</div>
                  <div className="tweak-desc">The tighter crop keeps attention on you.</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Button
                  className="block"
                  onClick={() => {
                    if (!comparison) { void runAnalysis(); return; }
                    saveCheck(comparison.winner === 'a' ? image : imageB, comparison.winner === 'a' ? comparison.a : comparison.b);
                  }}
                >
                  {comparison ? `Use photo ${comparison.winner === 'a' ? 'A' : 'B'} →` : 'Compare these photos →'}
                </Button>

                <Button
                  secondary
                  className="block"
                  onClick={() => {
                    setCompare(false);
                  }}
                >
                  Back to single check
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SINGLE PHOTO RESULT WORKBENCH (02-story-result.png) */
        <div className="story-workbench">
          {/* Left Column: Photo Frame & Metadata Bar */}
          <div>
            <div className="story-photo-frame">
              <img src={image} alt="Story photo check" />

              <EncouragementBadge
                style={style}
                text={style === 'sharp' ? 'OWN THE MOMENT.' : 'This is your moment. ♡'}
              />
            </div>

            {/* Photo Metadata Bar */}
            <div className="photo-meta-bar">
              <div className="photo-meta-info">
                <FileText size={16} />
                <span className="photo-meta-filename">golden-hour.jpg</span>
                <span>1.8 MB · 1440 × 1799</span>
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: '8px', position: 'relative'}}>
                <span style={{fontSize: '12px', color: 'var(--muted)'}}>Mood</span>
                <span className="photo-meta-tag">{mood}</span>
                <button
                  type="button"
                  className="btn secondary"
                  style={{minHeight: '32px', padding: '4px 12px', fontSize: '11px'}}
                  onClick={() => setMoodMenuOpen(!moodMenuOpen)}
                >
                  Change mood ▾
                </button>

                {moodMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '8px',
                      boxShadow: 'var(--shadow-overlay)',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {['Effortless', 'Playful', 'Bold', 'Romantic', 'Professional'].map(m => (
                      <button
                        type="button"
                        key={m}
                        style={{
                          textAlign: 'left',
                          padding: '6px 14px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: mood === m ? 'var(--selected-fill)' : 'none',
                          color: mood === m ? 'var(--action)' : 'var(--ink)'
                        }}
                        onClick={() => {
                          setMood(m);
                          setMoodMenuOpen(false);
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Notched Score Ticket & Actions & Style Match */}
          <div>
            {result ? (
              <>
                <ScoreTicket
                  analysis={result}
                  onTweakAction={() => setCrop(true)}
                />

                {/* Main Actions */}
                <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                  <Button
                    style={{flex: 1}}
                    onClick={() => setCrop(true)}
                  >
                    <Crop size={16} /> Try this crop →
                  </Button>
                </div>

                <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                  <Button
                    secondary
                    style={{flex: 1}}
                    onClick={() => nav('/story?compare=1')}
                  >
                    <Images size={16} /> Compare photos
                  </Button>

                  <Button
                    secondary
                    style={{flex: 1}}
                    onClick={() => setCaptions(true)}
                  >
                    <Sparkles size={16} /> Finishing touches
                  </Button>
                </div>

                {/* Style Match Card */}
                <div className="style-match-card">
                  <div>
                    <div style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)'}}>
                      Your style match
                    </div>
                    <div className="style-match-score">89%</div>
                    <div className="style-match-meta">Matches your recent posts</div>
                  </div>

                  <div className="style-match-thumbs">
                    {styleMatchThumbs.map((s, i) => (
                      <img key={i} src={s} alt="Reference sample" />
                    ))}
                  </div>
                </div>

                <div style={{marginTop: '14px', textAlign: 'right'}}>
                  <button
                    type="button"
                    style={{fontSize: '13px', fontWeight: 700, color: 'var(--action)', display: 'inline-flex', alignItems: 'center', gap: '6px'}}
                    onClick={() => saveCheck()}
                  >
                    <Bookmark size={15} /> Save this check to your space
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '32px',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-surface)'
                }}
              >
                <h2 style={{fontSize: '24px', fontWeight: 800}}>Ready to check?</h2>
                <p style={{fontSize: '14px', color: 'var(--muted)', margin: '8px 0 20px'}}>
                  We'll evaluate composition, light, and how it aligns with your {mood.toLowerCase()} vibe.
                </p>
                <Button className="block" onClick={() => void runAnalysis()}>
                  Check this photo <ArrowRight size={17} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <ErrorPanel error={error} onRetry={() => void runAnalysis()} />}

      {/* Crop Modal (S07) */}
      {crop && (
        <CropDialog
          image={image}
          format={format}
          onClose={() => setCrop(false)}
          onUse={src => {
            changeImage(src);
            setCrop(false);
            notify('Crop applied. Run a fresh check when you’re ready.');
          }}
        />
      )}

      {/* Finishing Touches / Captions Modal (S08) */}
      {captions && (
        <Modal title="Finishing touches" onClose={() => setCaptions(false)}>
          <p style={{fontSize: '13px', color: 'var(--muted)', marginBottom: '16px'}}>
            A starting point. Give it your own voice.
          </p>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {(result?.captions || ['Golden hour, good company.', 'A little less rush.', 'Right here, right now.']).map(
              (c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: '#F5F8FC',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Copy caption ${i + 1}`}
                    onClick={() => {
                      void navigator.clipboard.writeText(c);
                      notify('Caption copied to clipboard.');
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function CropDialog({
  image,
  format,
  onClose,
  onUse
}: {
  image: string;
  format: string;
  onClose: () => void;
  onUse: (s: string) => void;
}) {
  const [zoom, setZoom] = useState(1.15);
  const [offset, setOffset] = useState(45);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const {notify} = useStore();

  const generate = async (use: boolean) => {
    setBusy(true);
    try {
      const data = await cropImage(await imageData(image), zoom, offset, format === 'Story' ? 9 / 16 : 4 / 5);
      setPreview(data);
      if (use) onUse(data);
    } catch {
      notify('Could not crop that image. Try another photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Find your frame" onClose={onClose}>
      <div
        style={{
          width: 'min(280px, 100%)',
          margin: '0 auto 20px',
          overflow: 'hidden',
          borderRadius: '14px',
          aspectRatio: format === 'Story' ? '9 / 16' : '4 / 5',
          background: '#EAF0FA'
        }}
      >
        <img
          src={preview || image}
          alt="Crop preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `center ${offset}%`,
            transform: preview ? 'none' : `scale(${zoom})`
          }}
        />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px'}}>
        <label style={{fontSize: '13px', fontWeight: 700}}>
          Zoom: {zoom.toFixed(2)}x
          <input
            type="range"
            min="1"
            max="2"
            step="0.05"
            value={zoom}
            onChange={e => {
              setZoom(+e.target.value);
              setPreview('');
            }}
          />
        </label>

        <label style={{fontSize: '13px', fontWeight: 700}}>
          Vertical framing: {offset}%
          <input
            type="range"
            min="0"
            max="100"
            value={offset}
            onChange={e => {
              setOffset(+e.target.value);
              setPreview('');
            }}
          />
        </label>
      </div>

      <div style={{display: 'flex', gap: '12px'}}>
        <Button loading={busy} style={{flex: 1}} onClick={() => void generate(true)}>
          Use this crop
        </Button>
        <Button
          secondary
          onClick={async () => {
            try {
              download(
                await cropImage(await imageData(image), zoom, offset, format === 'Story' ? 9 / 16 : 4 / 5),
                'vibecheck-crop.jpg'
              );
            } catch {
              notify('Could not export the crop.');
            }
          }}
        >
          <Download size={16} /> Download
        </Button>
      </div>
    </Modal>
  );
}
