import {Component, Suspense, lazy, useEffect, type ReactNode} from 'react';
import {NavLink, Route, Routes, Link, useLocation} from 'react-router-dom';
import {House, Image as ImageIcon, Search, Shirt, Layers, Box, Bookmark, Settings, Bell, ChevronRight, ArrowLeft, WifiOff} from 'lucide-react';
import {useStore} from './lib/context';
import Home from './features/Home';
import Story from './features/Story';
import Loox from './features/Loox';
import Saved from './features/Saved';
import Profile from './features/Profile';

const ChicFit = lazy(() => import('./features/ChicFit'));
const FitCheck3D = lazy(() => import('./features/FitCheck3D'));
const Demo = lazy(() => import('./demo/Demo'));

class Boundary extends Component<{children: ReactNode}, {error: boolean}> {
  state = {error: false};
  static getDerivedStateFromError() { return {error: true}; }
  render() {
    return this.state.error ? (
      <div className="empty-state" style={{padding: '60px 20px', textAlign: 'center'}}>
        <h2>Let’s get you back.</h2>
        <p style={{color: 'var(--muted)', margin: '12px 0 24px'}}>Something unexpected happened. Your saved looks are still on this device.</p>
        <button className="btn" onClick={() => location.reload()}>Reload vibecheck</button>
      </div>
    ) : this.props.children;
  }
}

export default function App() {
  const {state, update, ready} = useStore();
  const loc = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  const style = state.profile.style || 'soft';

  const userName = state.profile.name || (style === 'sharp' ? 'Arjun' : 'Maya');
  const avatarImg = state.profile.photo || (style === 'sharp' ? '/assets/male-portrait.png' : '/assets/female-portrait.png');

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    const p = loc.pathname;
    if (p === '/') return [{label: 'Workspace', path: '/'}, {label: 'Home'}];
    if (p.startsWith('/story')) return [{label: 'Workspace', path: '/'}, {label: 'Story Check', path: '/story'}, ...(loc.search.includes('compare') ? [{label: 'Compare'}] : [{label: 'Result'}])];
    if (p.startsWith('/loox')) return [{label: 'Workspace', path: '/'}, {label: 'loox', path: '/loox'}, {label: 'Your look'}];
    if (p.startsWith('/chicfit') || p.startsWith('/wardrobe')) return [{label: 'Workspace', path: '/'}, {label: 'ChicFit', path: '/chicfit'}, {label: p.startsWith('/wardrobe') ? 'Wardrobe' : 'Style preview'}];
    if (p.startsWith('/fit3d')) return [{label: 'Workspace', path: '/'}, {label: '3D Fit Check'}];
    if (p.startsWith('/saved')) return [{label: 'Workspace', path: '/'}, {label: 'Saved'}];
    if (p.startsWith('/profile')) return [{label: 'Workspace', path: '/'}, {label: 'Settings'}];
    return [{label: 'Workspace', path: '/'}, {label: 'Page'}];
  };

  const breadcrumbs = getBreadcrumbs();

  if (loc.pathname === '/demo') {
    return (
      <Boundary>
        <Suspense fallback={<div className="busy">Opening walkthrough…</div>}>
          <Demo />
        </Suspense>
      </Boundary>
    );
  }

  return (
    <div className={`app-shell theme-${style}`}>
      {/* Fixed Desktop Sidebar (240px) */}
      <aside className="app-sidebar" aria-label="Main sidebar">
        <Link to="/" className="sidebar-brand" aria-label="vibecheck home">
          <img src="/brand/logo.svg" alt="vibecheck." />
        </Link>

        <div className="sidebar-section-label">Workspace</div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            <House size={18} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/story">
            <ImageIcon size={18} />
            <span>Story Check</span>
          </NavLink>
          <NavLink to="/loox">
            <Search size={18} />
            <span>loox</span>
          </NavLink>
          <NavLink to="/chicfit">
            <Shirt size={18} />
            <span>ChicFit</span>
          </NavLink>
          <NavLink to="/wardrobe">
            <Layers size={18} />
            <span>Wardrobe</span>
          </NavLink>
          <NavLink to="/fit3d">
            <Box size={18} />
            <span>3D Fit Check</span>
          </NavLink>
          <NavLink to="/saved">
            <Bookmark size={18} />
            <span>Saved</span>
          </NavLink>
        </nav>

        <div className="sidebar-decor" aria-hidden="true" />

        <div className="sidebar-footer">
          <Link to="/profile" className="profile-pill" aria-label="User profile">
            <div className="profile-avatar">
              <img src={avatarImg} alt={userName} />
            </div>
            <div className="profile-meta">
              <div className="profile-name">{userName}</div>
              <div className="profile-sub">{style === 'soft' ? 'Soft style' : 'Sharp style'}</div>
            </div>
            <ChevronRight size={16} style={{color: 'var(--muted)', marginLeft: 'auto'}} />
          </Link>

          <Link to="/profile" className="settings-btn" aria-label="Settings">
            <Settings size={17} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Body */}
      <div className="app-body">
        {/* Sticky Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <nav className="breadcrumb-trail" aria-label="Breadcrumb">
              {breadcrumbs.map((b, i) => (
                <span key={i} style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                  {i > 0 && <span className="breadcrumb-sep">/</span>}
                  {b.path ? (
                    <Link to={b.path}>{b.label}</Link>
                  ) : (
                    <span className="breadcrumb-current">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>

          <div className="topbar-right">
            {/* Soft/Sharp is an appearance setting and lives in Settings, as in
                the v1 targets; it is deliberately not duplicated here. */}
            <button type="button" className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>

            <Link to="/profile" className="topbar-user" aria-label="Your profile">
              <img src={avatarImg} alt={userName} />
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="app-content" id="main-content">
          {!ready ? (
            <div className="busy" style={{padding: '60px 20px', textAlign: 'center'}}>Opening your workspace…</div>
          ) : (
            <Boundary>
              <Suspense fallback={<div className="busy" style={{padding: '60px 20px', textAlign: 'center'}}>Opening…</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/story" element={<Story />} />
                  <Route path="/loox" element={<Loox />} />
                  {/* Without the tab strip each route opens its own screen:
                      ChicFit is the style preview, Wardrobe is the grid. */}
                  <Route path="/chicfit" element={<ChicFit defaultTab="Outfit" />} />
                  <Route path="/wardrobe" element={<ChicFit defaultTab="Wardrobe" />} />
                  <Route path="/fit3d" element={<FitCheck3D />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route
                    path="*"
                    element={
                      <div className="empty-state" style={{padding: '60px 20px', textAlign: 'center'}}>
                        <h1>That page wandered off.</h1>
                        <p style={{margin: '12px 0 24px', color: 'var(--muted)'}}>We couldn't find the screen you're looking for.</p>
                        <Link className="btn" to="/">Back home</Link>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
            </Boundary>
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation (<768px) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile main navigation">
        <NavLink to="/" end className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <House size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/saved" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Bookmark size={20} />
          <span>Saved{state.saved.length ? ` (${state.saved.length})` : ''}</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Me</span>
        </NavLink>
      </nav>

      {!navigator.onLine && (
        <div className="offline" style={{position: 'fixed', bottom: 16, right: 16, background: '#061538', color: '#fff', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100, fontSize: '12px'}}>
          <WifiOff size={16} /> Offline · your saved looks are available
        </div>
      )}
    </div>
  );
}
