import {useRef, useState, useEffect, type ReactNode, type ButtonHTMLAttributes} from 'react';
import {ArrowLeft, ArrowRight, Upload, Camera, X, LoaderCircle, AlertCircle, Check, Bookmark, Sparkles, Lightbulb} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {readImage} from '../lib/images';
import {useStore} from '../lib/context';
import {getConfig, type CloudConfig} from '../lib/cloud';
import type {Analysis, Garment, Callout} from '../../shared/types';

export function Button({
  children,
  secondary = false,
  loading = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {secondary?: boolean; loading?: boolean}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`btn ${secondary ? 'secondary' : ''} ${className}`}
    >
      {loading ? <LoaderCircle className="spin" size={18} style={{animation: 'spin 1s linear infinite'}} /> : null}
      {children}
    </button>
  );
}

export function PageHeading({
  title,
  subtitle,
  back,
  actions
}: {
  title: string;
  subtitle?: string;
  back?: string;
  actions?: ReactNode;
}) {
  const nav = useNavigate();
  return (
    <header className="view-header" style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap'}}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: '16px'}}>
        {back && (
          <button className="icon-btn" aria-label="Go back" onClick={() => nav(back)} style={{marginTop: '4px'}}>
            <ArrowLeft size={19} />
          </button>
        )}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>{actions}</div>}
    </header>
  );
}

export function PhotoPicker({
  onPick,
  children,
  className = '',
  camera = false,
  asDropzone = false
}: {
  onPick: (s: string) => void;
  children?: ReactNode;
  className?: string;
  camera?: boolean;
  asDropzone?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const {notify} = useStore();
  const [busy, setBusy] = useState(false);

  const accept = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onPick(await readImage(file));
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={ref}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        capture={camera ? 'user' : undefined}
        onChange={e => void accept(e.target.files?.[0])}
      />
      {asDropzone ? (
        <div
          className={`intake-dropzone ${className}`}
          role="button"
          tabIndex={0}
          onClick={() => ref.current?.click()}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') ref.current?.click(); }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            void accept(e.dataTransfer.files[0]);
          }}
        >
          <div className="dropzone-icon">
            <Upload size={24} />
          </div>
          <div className="dropzone-label">Drop a photo here</div>
          <div className="dropzone-sub">JPG or PNG · up to 12 MB</div>
          <button type="button" className="dropzone-btn" disabled={busy}>
            {busy ? 'Opening…' : 'Choose photo'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={className ? className : 'btn secondary'}
          onClick={() => ref.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            void accept(e.dataTransfer.files[0]);
          }}
          disabled={busy}
        >
          {busy ? <LoaderCircle size={18} style={{animation: 'spin 1s linear infinite'}} /> : children || (camera ? 'Take photo' : 'Choose photo')}
        </button>
      )}
    </>
  );
}

export function ScoreTicket({
  analysis,
  compact = false,
  onTweakAction
}: {
  analysis: Analysis;
  compact?: boolean;
  onTweakAction?: () => void;
}) {
  const isExample = analysis.source === 'example';
  const score = Math.round(analysis.score);

  return (
    <section className={`score-ticket ${compact ? 'compact' : ''}`} aria-label="Style Score Ticket">
      <div className="ticket-header">
        <div className="ticket-score-plate">
          <span style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink)'}}>
            {compact ? 'Your fit' : 'Your vibe'}
          </span>
          <div style={{display: 'flex', alignItems: 'baseline'}}>
            <span className="score-val">{score}</span>
            <span className="score-max">/100</span>
          </div>
        </div>

        <div className="ticket-verdict-area">
          <h2>{analysis.verdict}</h2>
          <div className="verdict-title">{analysis.summary}</div>
          <div className="verdict-desc">
            {isExample ? 'Your lighting and expression work well together.' : 'Analysis processed for this look.'}
          </div>
        </div>
      </div>

      <div className="ticket-divider" />

      <div className="ticket-metrics">
        {analysis.metrics.map(m => (
          <div className="metric-row" key={m.label}>
            <span className="metric-label">{m.label}</span>
            <div className="metric-bar-track">
              <div className="metric-bar-fill" style={{width: `${Math.min(100, Math.max(0, m.score))}%`}} />
            </div>
            <span className="metric-val">{Math.round(m.score)}</span>
          </div>
        ))}
      </div>

      {analysis.tips && analysis.tips[0] && (
        <div className="tweak-card" onClick={onTweakAction} style={{cursor: onTweakAction ? 'pointer' : 'default'}}>
          <Lightbulb size={20} />
          <div>
            <div className="tweak-title">One small tweak</div>
            <div className="tweak-desc">{analysis.tips[0]}</div>
          </div>
        </div>
      )}
    </section>
  );
}

export function EncouragementBadge({
  style = 'soft',
  text,
  className = ''
}: {
  style?: 'soft' | 'sharp';
  text?: string;
  className?: string;
}) {
  if (style === 'sharp') {
    return (
      <div className={`encouragement-sharp ${className}`} aria-hidden="true">
        {text || 'LOOKING SHARP.'}
      </div>
    );
  }
  return (
    <div className={`encouragement-soft ${className}`} aria-hidden="true">
      {text || 'So you. So good. ♡'}
    </div>
  );
}

export function PhotoCallouts({
  callouts,
  show = true
}: {
  callouts?: Callout[];
  show?: boolean;
}) {
  if (!show || !callouts || callouts.length === 0) return null;

  return (
    <>
      {callouts.map((c, i) => {
        // The anchor dot stays on the feature; the label swings to whichever
        // side has room, so it never sits across the subject's face.
        const x = Math.max(6, Math.min(94, c.x));
        const y = Math.max(10, Math.min(90, c.y));
        // Anchors left of centre send their label further left, and vice
        // versa, so labels move away from the subject rather than across it.
        const toLeft = x < 50;
        return (
          <div
            key={i}
            className={`callout-pin ${toLeft ? 'to-left' : 'to-right'}`}
            style={{left: `${x}%`, top: `${y}%`}}
          >
            <span className="callout-dot" />
            <span className="callout-line" />
            <span className="callout-tag">{c.label}</span>
          </div>
        );
      })}
    </>
  );
}

export function Modal({title, children, onClose}: {title: string; children: ReactNode; onClose: () => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={e => {
        if (e.target === ref.current) onClose();
      }}
      style={{
        margin: 'auto',
        background: '#FFFFFF',
        border: '1px solid var(--line)',
        borderRadius: '20px',
        padding: '28px',
        width: 'min(560px, calc(100vw - 32px))',
        maxHeight: 'calc(100dvh - 64px)',
        boxShadow: 'var(--shadow-overlay)'
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
        <h2 style={{fontSize: '22px', fontWeight: 800, color: 'var(--ink)'}}>{title}</h2>
        <button className="icon-btn" aria-label="Close dialog" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function ErrorPanel({error, onRetry}: {error: string; onRetry?: () => void}) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '18px 22px',
        background: 'var(--error-fill)',
        border: '1px solid #FFCCD2',
        borderRadius: 'var(--radius-field)',
        color: 'var(--error)',
        margin: '20px 0'
      }}
    >
      <AlertCircle size={20} style={{flexShrink: 0, marginTop: '2px'}} />
      <div>
        <strong style={{display: 'block', fontSize: '14px', fontWeight: 700}}>That didn’t go through.</strong>
        <p style={{fontSize: '13px', marginTop: '4px', opacity: 0.9}}>{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{marginTop: '8px', color: 'var(--action)', fontWeight: 700, fontSize: '13px', textDecoration: 'underline'}}
          >
            Try again →
          </button>
        )}
      </div>
    </div>
  );
}

export function Busy({label = 'Finding your vibe…'}: {label?: string}) {
  return (
    <div className="busy" role="status" style={{textAlign: 'center', padding: '60px 20px'}}>
      <img src="/brand/icon.svg" alt="" style={{width: '64px', height: '64px', margin: '0 auto 20px'}} />
      <h3 style={{fontSize: '24px', fontWeight: 800, color: 'var(--ink)'}}>{label}</h3>
      <p style={{color: 'var(--muted)', marginTop: '8px', fontSize: '14px'}}>A little perspective is on its way.</p>
    </div>
  );
}

export function GarmentImage({
  garment,
  className = ''
}: {
  garment: Pick<Garment, 'image' | 'name'>;
  className?: string;
}) {
  const [src, cell] = garment.image.split('#');
  return cell !== undefined ? (
    <div
      role="img"
      aria-label={garment.name}
      className={`garment-image ${className}`}
      style={{
        backgroundImage: `url("${src}")`,
        backgroundSize: '300% 200%',
        backgroundPosition: `${(Number(cell) % 3) * 50}% ${Math.floor(Number(cell) / 3) * 100}%`,
        width: '100%',
        height: '100%'
      }}
    />
  ) : (
    <img className={`garment-image ${className}`} src={src} alt={garment.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  );
}

export function ConsentNotice() {
  const [config, setConfig] = useState<CloudConfig | null>(null);
  useEffect(() => {
    void getConfig().then(setConfig).catch(() => {});
  }, []);

  return (
    <p style={{fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6', margin: '14px 0'}}>
      {config?.cloudEnabled
        ? 'AI checks upload selected photos to private AWS storage and process them with AWS AI.'
        : `Photos stay on this device until you request a check. AI checks send selected photos to ${
            config?.provider === 'bedrock' ? 'AWS' : 'Google'
          }.`}{' '}
      Style feedback is subjective.
    </p>
  );
}

export function EmptyState({
  icon,
  heading,
  copy,
  children
}: {
  icon?: ReactNode;
  heading: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state" style={{padding: '50px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto'}}>
      <div style={{color: 'var(--action)', marginBottom: '16px', display: 'flex', justifyContent: 'center'}}>
        {icon || <Bookmark size={36} />}
      </div>
      <h2 style={{fontSize: '24px', fontWeight: 800, color: 'var(--ink)'}}>{heading}</h2>
      <p style={{fontSize: '14px', color: 'var(--muted)', margin: '10px 0 24px'}}>{copy}</p>
      {children}
    </div>
  );
}

export function Pills({
  items,
  value,
  onChange
}: {
  items: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0 18px'}}>
      {items.map(s => (
        <button
          type="button"
          key={s}
          className={`btn secondary ${s === value ? 'selected' : ''}`}
          style={{
            padding: '8px 16px',
            minHeight: '38px',
            fontSize: '12px',
            borderRadius: 'var(--radius-tag)',
            background: s === value ? 'var(--selected-fill)' : 'var(--surface)',
            color: s === value ? 'var(--action)' : 'var(--muted)',
            borderColor: s === value ? 'var(--action)' : 'var(--line)'
          }}
          aria-pressed={s === value}
          onClick={() => onChange(s)}
        >
          {s === value && <Check size={14} style={{marginRight: '4px'}} />}
          {s}
        </button>
      ))}
    </div>
  );
}
