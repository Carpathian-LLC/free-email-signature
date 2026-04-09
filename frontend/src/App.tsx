import { useState, useCallback } from 'react';
import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import Templates from './pages/Templates';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Security from './pages/Security';
import NotFound from './pages/NotFound';
import ConsentBanner from './cmp/ConsentBanner';

function Layout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [showDonate, setShowDonate] = useState(false);

  const fireConfetti = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:100;pointer-events:none;width:100%;height:100%';
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;
    const colors = ['#1B8FF2', '#4DB6F7', '#134A86', '#0F6BB8', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
    const pieces: { x: number; y: number; vx: number; vy: number; r: number; color: string; rot: number; vr: number; w: number; h: number }[] = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      pieces.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
        r: 0, color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.3,
        w: 4 + Math.random() * 6, h: 6 + Math.random() * 10,
      });
    }
    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.vy += 0.25;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / 90);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (frame < 90) requestAnimationFrame(animate);
      else canvas.remove();
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="min-h-screen bg-page-bg text-gray-900 font-sans">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg hover:text-brand-blue transition-colors min-w-0">
            <img src="/MyFreeEmailSignature_logo.png" alt="My Free Email Signature" className="h-6 w-auto flex-shrink-0 hidden sm:block" />
            <span className="truncate">My Free Email Signature</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/templates"
              className={`hidden sm:inline text-sm font-medium transition-colors ${isActive('/templates') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Templates
            </Link>
            <Link
              to="/about"
              className={`hidden sm:inline text-sm font-medium transition-colors ${isActive('/about') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              About
            </Link>
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
            >
              Create
            </Link>
            <a
              href="https://github.com/Carpathian-LLC/free-email-signature"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      <Outlet />
      <ConsentBanner />

      <footer className="bg-page-bg-alt border-t border-gray-200 pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-bold text-base mb-3">
                <img src="/MyFreeEmailSignature_logo.png" alt="My Free Email Signature" className="h-6 w-auto flex-shrink-0" />
                My Free Email Signature
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                An open source project by{' '}
                <a href="https://carpathian.ai/cloud" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-blue-hover transition-colors font-medium">
                  Carpathian
                </a>
              </p>
              <p className="text-sm italic mt-2 text-gray-400">Made with love and 100% recycled electrons.</p>
              <button type="button" onClick={() => setShowDonate(true)} className="donate-shimmer font-bold text-xs mt-3 border border-brand-blue rounded-md px-3 py-1.5 hover:opacity-80 transition-opacity">
                Super Ultra Premium Extra Deluxe Donate Button
              </button>
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/templates" className="hover:text-gray-900 transition-colors">Templates</Link></li>
                <li><Link to="/create" className="hover:text-gray-900 transition-colors">Create Signature</Link></li>
                <li><Link to="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="https://github.com/Carpathian-LLC/free-email-signature" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a></li>
                <li><Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/security" className="hover:text-gray-900 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Carpathian LLC. All rights reserved.
          </div>
        </div>
      </footer>

      {showDonate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setShowDonate(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-gray-700 leading-relaxed mb-2">
              Okay, okay. Did you actually want to donate or did you just want to see what happens when you click this?
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <a
                href="https://paypal.me/smalkasian"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors"
              >
                I actually want to donate
              </a>
              <button
                type="button"
                onClick={() => { fireConfetti(); setShowDonate(false); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                I just wanted to see what would happen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/security" element={<Security />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
