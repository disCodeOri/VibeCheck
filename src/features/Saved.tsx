import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Bookmark, ArrowUpRight, Trash2} from 'lucide-react';
import {PageHeading, Pills, EmptyState, Button, Modal} from '../components/ui';
import {useStore} from '../lib/context';

export default function Saved() {
  const {state, update, notify} = useStore();
  const nav = useNavigate();
  const [filter, setFilter] = useState('All');
  const [removeId, setRemoveId] = useState('');

  const names: Record<string, string> = {story: 'Story Check', loox: 'loox', outfit: 'ChicFit'};
  const looks = state.saved.filter(l => filter === 'All' || names[l.kind] === filter);

  return (
    <div className="saved-page-container">
      <PageHeading
        title="Good looks. Kept close."
        subtitle="Your favourites, ready when you are."
      />

      <Pills
        items={['All', 'Story Check', 'loox', 'ChicFit']}
        value={filter}
        onChange={setFilter}
      />

      {looks.length ? (
        <div className="saved-grid">
          {looks.map(l => (
            <article className="saved-card" key={l.id}>
              <button
                type="button"
                className="saved-open"
                onClick={() =>
                  nav(l.kind === 'outfit' ? '/chicfit' : l.kind === 'loox' ? '/loox' : '/story', {
                    state: {saved: l}
                  })
                }
                style={{width: '100%', textAlign: 'left', cursor: 'pointer'}}
              >
                <div className="saved-img-frame">
                  <img src={l.secondaryImage || l.image} alt={l.title} />
                  {l.analysis.source !== 'manual' && (
                    <div className="saved-score-badge">
                      {Math.round(l.analysis.score)}
                      <small style={{fontSize: '13px', fontWeight: 600}}>/100</small>
                    </div>
                  )}
                </div>

                <div className="saved-info">
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'var(--action)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}
                  >
                    {names[l.kind]}
                    {l.analysis.source === 'example' ? ' · EXAMPLE' : ''}
                  </span>
                  <h3>
                    {l.title} <ArrowUpRight size={17} style={{color: 'var(--muted)'}} />
                  </h3>
                  <p>
                    {new Date(l.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </button>

              <button
                type="button"
                className="icon-btn"
                aria-label={`Delete ${l.title}`}
                onClick={() => setRemoveId(l.id)}
                style={{position: 'absolute', top: '14px', right: '14px', background: 'rgba(255, 255, 255, 0.9)'}}
              >
                <Trash2 size={16} style={{color: 'var(--error)'}} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark size={36} />}
          heading="Make room for your favourites."
          copy={
            filter === 'All'
              ? 'Save a photo check, a new hairstyle, or an outfit. Your next good look starts here.'
              : 'Nothing saved in this category yet.'
          }
        >
          <Button onClick={() => nav('/')}>Find your vibe →</Button>
        </EmptyState>
      )}

      {removeId && (
        <Modal title="Remove this saved look?" onClose={() => setRemoveId('')}>
          <p style={{fontSize: '14px', color: 'var(--muted)', marginBottom: '20px'}}>
            This look will be removed from your saved collection.
          </p>
          <div style={{display: 'flex', gap: '12px'}}>
            <Button secondary style={{flex: 1}} onClick={() => setRemoveId('')}>
              Keep it
            </Button>
            <Button
              style={{flex: 1}}
              onClick={() => {
                update(s => ({...s, saved: s.saved.filter(l => l.id !== removeId)}));
                setRemoveId('');
                notify('Saved look removed.');
              }}
            >
              Remove look
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
