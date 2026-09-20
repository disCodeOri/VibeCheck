import {useEffect, useRef, useState} from 'react';
import {Download, Upload, Trash2, Check, UserRound, Smartphone, ArrowUpRight, Database, ShieldCheck, Palette} from 'lucide-react';
import {PageHeading, Button, Pills, Modal, ErrorPanel} from '../components/ui';
import {useStore} from '../lib/context';
import {api} from '../lib/api';
import {defaultState, sampleGarments, validateBackup} from '../lib/storage';
import {download} from '../lib/images';
import CloudAccount from '../components/CloudAccount';
import PhotoPrivacy from '../components/PhotoPrivacy';
import {getConfig, type CloudConfig} from '../lib/cloud';

type InstallPrompt = Event & {prompt: () => Promise<void>; userChoice: Promise<{outcome: string}>};

export default function Profile() {
  const {state, update, notify} = useStore();
  const [name, setName] = useState(state.profile.name);
  const [config, setConfig] = useState<CloudConfig | null>(null);
  const [status, setStatus] = useState('Checking connection…');
  const [reset, setReset] = useState(false);
  const [incoming, setIncoming] = useState<ReturnType<typeof validateBackup> | null>(null);
  const [error, setError] = useState('');
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const upload = useRef<HTMLInputElement>(null);

  const style = state.profile.style || 'soft';

  useEffect(() => {
    void getConfig().then(setConfig).catch(() => {});
    api
      .health()
      .then(r =>
        setStatus(
          `${r.provider === 'bedrock' ? 'Amazon Bedrock' : 'Google AI Studio'} · ${
            r.configured ? 'configured' : 'setup required'
          }`
        )
      )
      .catch(() => setStatus('AI service is offline'));

    const h = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const saveName = () => {
    update(s => ({...s, profile: {...s.profile, name: name.trim().slice(0, 80)}}));
    notify('Profile updated.');
  };

  const setStyle = (s: 'soft' | 'sharp') => {
    update(prev => {
      // The two styles ship different example wardrobes. Only swap them while
      // the wardrobe is still untouched samples — never discard real pieces.
      const untouched = prev.garments.length > 0 && prev.garments.every(g => g.id.startsWith('sample-'));
      return {
        ...prev,
        garments: untouched ? sampleGarments(s) : prev.garments,
        profile: {
          ...prev.profile,
          style: s,
          name: prev.profile.name === 'Maya' && s === 'sharp' ? 'Arjun' : prev.profile.name === 'Arjun' && s === 'soft' ? 'Maya' : prev.profile.name
        }
      };
    });
    notify(`Switched to ${s === 'soft' ? 'Soft' : 'Sharp'} style.`);
  };

  const backup = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({version: 1, exportedAt: new Date().toISOString(), state})], {
        type: 'application/json'
      })
    );
    download(url, 'vibecheck-backup.json');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    setError('');
    try {
      if (file.size > 100 * 1024 * 1024)
        throw new Error('This backup is too large. Maximum size is 100 MB.');
      setIncoming(validateBackup(JSON.parse(await file.text())));
    } catch {
      setError('That file isn’t a valid vibecheck backup. Your current data hasn’t changed.');
    }
    if (upload.current) upload.current.value = '';
  };

  return (
    <div className="profile-page-container">
      <PageHeading
        title="Your space. Your rules."
        subtitle="A few preferences to make vibecheck feel like you."
      />

      <div className="profile-view-grid">
        {/* Left Column: Profile & Style Appearance */}
        <div>
          {/* Visual Style Settings (Soft vs Sharp) */}
          <section className="settings-card">
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--selected-fill)',
                  color: 'var(--action)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Palette size={20} />
              </div>
              <div>
                <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>Visual Appearance</h3>
                <p style={{fontSize: '12px', color: 'var(--muted)', margin: 0}}>
                  Choose between the two confirmed design styles.
                </p>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px'}}>
              <div
                onClick={() => setStyle('soft')}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `2px solid ${style === 'soft' ? 'var(--action)' : 'var(--line)'}`,
                  background: style === 'soft' ? 'var(--selected-fill)' : 'var(--surface)',
                  cursor: 'pointer'
                }}
              >
                <strong style={{display: 'block', fontSize: '15px', color: 'var(--ink)'}}>
                  Soft {style === 'soft' && '✓'}
                </strong>
                <p style={{fontSize: '11px', color: 'var(--muted)', marginTop: '4px', lineHeight: '1.4'}}>
                  Organic curves, soft layered clouds, and cursive notes (Female target).
                </p>
              </div>

              <div
                onClick={() => setStyle('sharp')}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `2px solid ${style === 'sharp' ? 'var(--action)' : 'var(--line)'}`,
                  background: style === 'sharp' ? 'var(--selected-fill)' : 'var(--surface)',
                  cursor: 'pointer'
                }}
              >
                <strong style={{display: 'block', fontSize: '15px', color: 'var(--ink)'}}>
                  Sharp {style === 'sharp' && '✓'}
                </strong>
                <p style={{fontSize: '11px', color: 'var(--muted)', marginTop: '4px', lineHeight: '1.4'}}>
                  Layered angular plates, cobalt accents, and typeset notes (Male target).
                </p>
              </div>
            </div>
          </section>

          {/* User Information */}
          <section className="settings-card">
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--selected-fill)',
                  color: 'var(--action)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserRound size={20} />
              </div>
              <div>
                <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>A little about you</h3>
                <p style={{fontSize: '12px', color: 'var(--muted)', margin: 0}}>
                  Your preferences stay on this device.
                </p>
              </div>
            </div>

            <div style={{margin: '16px 0'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px'}}>
                Your name
              </label>
              <div style={{display: 'flex', gap: '10px'}}>
                <input
                  maxLength={80}
                  value={name}
                  placeholder="What should we call you?"
                  onChange={e => setName(e.target.value)}
                  style={{flex: 1, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '10px'}}
                />
                <Button onClick={saveName}>
                  <Check size={16} /> Save
                </Button>
              </div>
            </div>

            <div style={{marginTop: '20px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px'}}>
                Your usual vibe
              </label>
              <Pills
                items={['Effortless', 'Playful', 'Bold', 'Professional', 'Romantic']}
                value={state.profile.mood}
                onChange={mood => update(s => ({...s, profile: {...s.profile, mood}}))}
              />
            </div>

            <div style={{marginTop: '16px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px'}}>
                Style presentation
              </label>
              <Pills
                items={['Feminine', 'Masculine', 'Neutral']}
                value={
                  state.profile.presentation[0].toUpperCase() + state.profile.presentation.slice(1)
                }
                onChange={v => {
                  const p = v.toLowerCase() as typeof state.profile.presentation;
                  update(s => ({
                    ...s,
                    profile: {
                      ...s.profile,
                      presentation: p,
                      avatar: {...s.profile.avatar, presentation: p}
                    }
                  }));
                }}
              />
              <p style={{fontSize: '11px', color: 'var(--muted)', marginTop: '6px'}}>
                A preference for your 3D avatar. Wear whatever feels like you.
              </p>
            </div>
          </section>
        </div>

        {/* Right Column: Storage, Cloud & Device Data */}
        <div>
          {/* Privacy & AI Provider */}
          <section className="settings-card">
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--selected-fill)',
                  color: 'var(--action)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>Your photos, thoughtfully handled</h3>
                <p style={{fontSize: '12px', color: 'var(--muted)', margin: 0}}>
                  Local-first by default.
                </p>
              </div>
            </div>

            <p style={{fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6'}}>
              Wardrobe photos, saved looks, and your profile are stored in this browser on this device.
              {config?.cloudEnabled
                ? ' You can also save and restore a private cloud backup below.'
                : ' Export a backup to move them to another device.'}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: '#F0F6FE',
                borderRadius: '10px',
                margin: '16px 0',
                fontSize: '12px',
                color: 'var(--ink)'
              }}
            >
              <span style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--action)'}} />
              {status}
            </div>
          </section>

          <PhotoPrivacy />
          <CloudAccount />

          {/* Backup & Reset */}
          <section className="settings-card">
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--selected-fill)',
                  color: 'var(--action)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Database size={20} />
              </div>
              <div>
                <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>Keep your good stuff</h3>
                <p style={{fontSize: '12px', color: 'var(--muted)', margin: 0}}>
                  Export backups or reset device data.
                </p>
              </div>
            </div>

            <p style={{fontSize: '13px', color: 'var(--muted)', marginBottom: '16px'}}>
              Export a backup before clearing your browser or moving to a new device.
            </p>

            <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
              <Button secondary style={{flex: 1}} onClick={backup}>
                <Download size={16} /> Export backup
              </Button>

              <Button secondary style={{flex: 1}} onClick={() => upload.current?.click()}>
                <Upload size={16} /> Import backup
              </Button>
            </div>

            <input
              ref={upload}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={e => void importBackup(e.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => setReset(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--error)',
                fontSize: '13px',
                fontWeight: 700,
                marginTop: '8px'
              }}
            >
              <Trash2 size={16} /> Clear this device
            </button>
          </section>
        </div>
      </div>

      {error && <ErrorPanel error={error} />}

      {/* Clear Confirmation Modal */}
      {reset && (
        <Modal title="Clear this device?" onClose={() => setReset(false)}>
          <p style={{fontSize: '14px', color: 'var(--muted)', marginBottom: '20px'}}>
            This removes your wardrobe, photos, profile, and saved looks from this browser. Export a backup
            first if you want to keep them.
          </p>
          <div style={{display: 'flex', gap: '12px'}}>
            <Button secondary style={{flex: 1}} onClick={() => setReset(false)}>
              Keep my data
            </Button>
            <Button
              style={{flex: 1}}
              onClick={() => {
                update(() => defaultState());
                setName('');
                setReset(false);
                notify('Your device data has been cleared.');
              }}
            >
              Clear all data
            </Button>
          </div>
        </Modal>
      )}

      {/* Restore Confirmation Modal */}
      {incoming && (
        <Modal title="Restore this backup?" onClose={() => setIncoming(null)}>
          <p style={{fontSize: '14px', color: 'var(--muted)', marginBottom: '20px'}}>
            This replaces the data on this device with {incoming.garments.length} wardrobe items and{' '}
            {incoming.saved.length} saved looks from your backup.
          </p>
          <div style={{display: 'flex', gap: '12px'}}>
            <Button secondary style={{flex: 1}} onClick={() => setIncoming(null)}>
              Cancel
            </Button>
            <Button
              style={{flex: 1}}
              onClick={() => {
                update(() => incoming);
                setName(incoming.profile.name);
                setIncoming(null);
                notify('Your backup has been restored.');
              }}
            >
              Restore backup
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
