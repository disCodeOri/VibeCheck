import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {ArrowRight, Images} from 'lucide-react';
import {Button, PhotoPicker} from '../components/ui';
import {useStore} from '../lib/context';
import {garmentSheet} from '../lib/storage';

export default function Home() {
  const [mode, setMode] = useState<'Story' | 'loox' | 'ChicFit'>('Story');
  const nav = useNavigate();
  const {state} = useStore();
  const style = state.profile.style || 'soft';

  const handlePhotoPicked = (imgData: string) => {
    if (mode === 'Story') {
      nav('/story', {state: {prefillImage: imgData}});
    } else if (mode === 'loox') {
      nav('/loox', {state: {prefillImage: imgData}});
    } else {
      nav('/chicfit', {state: {prefillImage: imgData}});
    }
  };

  const primaryLabel =
    mode === 'Story'
      ? 'Check my story'
      : mode === 'loox'
      ? 'Explore loox'
      : 'Build an outfit';

  const primaryTarget =
    mode === 'Story' ? '/story' : mode === 'loox' ? '/loox' : '/chicfit';

  // Hero panel artwork, cropped from the v1 desktop targets. It is decorative:
  // the wordmark, the encouragement note and the corner tag are part of the
  // artwork, so they are not repeated as DOM overlays.
  const heroModelImg = style === 'sharp' ? '/assets/hero-sharp.png' : '/assets/hero-soft.png';

  const looxThumb =
    style === 'sharp'
      ? '/assets/male-portrait.png'
      : '/assets/female-portrait.png';

  const chicfitThumb =
    style === 'sharp'
      ? '/assets/male-outfit.png'
      : '/assets/female-outfit.png';

  const wardrobeThumb = garmentSheet(style);

  return (
    <div className="home-workspace">
      {/* Top Heading */}
      <header className="view-header">
        <h1>Good taste. All you.</h1>
        <p>Look good. Feel right. Be you.</p>
      </header>

      {/* Two-Column Hero Grid */}
      <section className="home-hero-grid" aria-label="Hero section">
        {/* Left Visual Card */}
        <div className="hero-visual-card">
          <img
            className="hero-model-img"
            src={heroModelImg}
            alt={style === 'sharp' ? 'Your vibe. Looking sharp.' : 'Your vibe. So you, so good.'}
          />
        </div>

        {/* Right Action Workbench */}
        <div className="hero-workbench-card">
          <div className="workbench-head">
            <h2>What’s the move?</h2>
            <p>A little clarity before you go.</p>
          </div>

          {/* Segmented Mode Selector */}
          <div className="mode-segmented" role="group" aria-label="Feature mode selector">
            {(['Story', 'loox', 'ChicFit'] as const).map(m => (
              <button
                type="button"
                key={m}
                className={mode === m ? 'active' : ''}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Photo Dropzone */}
          <PhotoPicker asDropzone onPick={handlePhotoPicked} />

          {/* Action Buttons */}
          <div className="workbench-actions">
            <Button className="block" onClick={() => nav(primaryTarget)}>
              {primaryLabel} <ArrowRight size={17} />
            </Button>

            <Button
              secondary
              className="block"
              onClick={() => nav('/story?compare=1')}
            >
              <Images size={16} /> Compare two photos
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom 3 Feature Shortcuts */}
      <section className="home-shortcuts-grid" aria-label="Feature shortcuts">
        {/* 1. loox */}
        <Link to="/loox" className="shortcut-card">
          <div className="shortcut-thumbnail">
            <img src={looxThumb} alt="loox portrait preview" />
          </div>
          <div className="shortcut-info">
            <h3>loox</h3>
            <p>Find your next look.</p>
          </div>
          <div className="shortcut-arrow" aria-hidden="true">
            <ArrowRight size={18} />
          </div>
        </Link>

        {/* 2. ChicFit */}
        <Link to="/chicfit" className="shortcut-card">
          <div className="shortcut-thumbnail">
            <img src={chicfitThumb} alt="ChicFit outfit preview" />
          </div>
          <div className="shortcut-info">
            <h3>ChicFit</h3>
            <p>Build an outfit.</p>
          </div>
          <div className="shortcut-arrow" aria-hidden="true">
            <ArrowRight size={18} />
          </div>
        </Link>

        {/* 3. Wardrobe */}
        <Link to="/wardrobe" className="shortcut-card">
          <div className="shortcut-thumbnail">
            <img
              src={wardrobeThumb}
              alt="Wardrobe flatlay"
              style={{objectFit: 'cover', objectPosition: 'center 20%'}}
            />
          </div>
          <div className="shortcut-info">
            <h3>Wardrobe</h3>
            <p>Style what you own.</p>
          </div>
          <div className="shortcut-arrow" aria-hidden="true">
            <ArrowRight size={18} />
          </div>
        </Link>
      </section>

      {/* 3D Fit Check — added by PR #1 */}
      <Link to="/fit3d" className="shortcut-card fit3d-card">
        <div className="shortcut-thumbnail fit3d-thumb" aria-hidden="true" />
        <div className="shortcut-info">
          <span className="fit3d-kicker">NEW</span>
          <h3>3D Fit Check</h3>
          <p>See a look in 360°.</p>
        </div>
        <div className="shortcut-arrow" aria-hidden="true">
          <ArrowRight size={18} />
        </div>
      </Link>
    </div>
  );
}
