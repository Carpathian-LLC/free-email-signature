import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import Templates from './pages/Templates';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Security from './pages/Security';
import NotFound from './pages/NotFound';
import MySignatures from './pages/MySignatures';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import GmailSignature from './pages/GmailSignature';
import OutlookSignature from './pages/OutlookSignature';
import AppleMailSignature from './pages/AppleMailSignature';
import MacSignatureGenerator from './pages/MacSignatureGenerator';
import GmailSignatureGenerator from './pages/GmailSignatureGenerator';
import SignatureBestPractices from './pages/SignatureBestPractices';
import ConsentBanner from './cmp/ConsentBanner';
import { AdSenseBanner } from './components';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
// Optional donation link. Set VITE_DONATE_URL to your own (PayPal, Ko-fi, etc.);
// when unset, the donate button is hidden so forks never link to someone else.
const DONATE_URL = import.meta.env.VITE_DONATE_URL || '';

function Layout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [showDonate, setShowDonate] = useState(false);
  const [sigCount, setSigCount] = useState<number | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (API_URL) {
      fetch(`${API_URL}/api/signature-count`)
        .then(r => r.json())
        .then(d => { if (typeof d.count === 'number') setSigCount(d.count); })
        .catch(() => {});
    }
  }, []);

  // Show the My Signatures tab only once something is saved locally. Re-checked
  // on navigation so it appears right after a signature is first copied.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cos_saved_signatures');
      const list = raw ? JSON.parse(raw) : [];
      setHasSaved(Array.isArray(list) && list.length > 0);
    } catch {
      setHasSaved(false);
    }
  }, [location.pathname]);

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
            <img src="/MyFreeEmailSignature_logo.png" alt="Free Signature Co." className="h-6 w-auto flex-shrink-0 hidden sm:block" />
            <span className="truncate">Free Signature Co.</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/templates"
              className={`hidden sm:inline text-sm font-medium transition-colors ${isActive('/templates') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Templates
            </Link>
            <Link
              to="/blog"
              className={`hidden sm:inline text-sm font-medium transition-colors ${location.pathname.startsWith('/blog') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Blog
            </Link>
            <Link
              to="/about"
              className={`hidden sm:inline text-sm font-medium transition-colors ${isActive('/about') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              About
            </Link>
            {hasSaved && (
              <Link
                to="/my-signatures"
                className={`hidden sm:inline text-sm font-medium transition-colors ${isActive('/my-signatures') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                My Signatures
              </Link>
            )}
            <Link
              to="/create"
              className="bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
            >
              Create
            </Link>
          </div>
        </div>
      </nav>

      <Outlet />
      <AdSenseBanner />
      <ConsentBanner />

      <footer className="bg-page-bg-alt border-t border-gray-200 pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-bold text-base mb-3">
                <img src="/MyFreeEmailSignature_logo.png" alt="Free Signature Co." className="h-6 w-auto flex-shrink-0" />
                Free Signature Co.
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                A project by{' '}
                <a href="https://carpathian.ai" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-blue-hover transition-colors font-medium">
                  Carpathian
                </a>
              </p>
              <p className="text-sm italic mt-2 text-gray-400">Made with love and 100% recycled electrons.</p>
              {DONATE_URL && (
                <button type="button" onClick={() => setShowDonate(true)} className="donate-shimmer font-bold text-xs mt-3 border border-brand-blue rounded-md px-3 py-1.5 hover:opacity-80 transition-opacity">
                  Super Ultra Premium Extra Deluxe Donate Button
                </button>
              )}
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/templates" className="hover:text-gray-900 transition-colors">Templates</Link></li>
                <li><Link to="/create" className="hover:text-gray-900 transition-colors">Create Signature</Link></li>
                <li><Link to="/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
                <li><Link to="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-3">Guides</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/free-gmail-signature-generator" className="hover:text-gray-900 transition-colors">Gmail Signature Generator</Link></li>
                <li><Link to="/free-email-signature-generator-mac" className="hover:text-gray-900 transition-colors">Mac Signature Generator</Link></li>
                <li><Link to="/how-to-add-email-signature-gmail" className="hover:text-gray-900 transition-colors">Gmail Signature Guide</Link></li>
                <li><Link to="/how-to-add-email-signature-outlook" className="hover:text-gray-900 transition-colors">Outlook Signature Guide</Link></li>
                <li><Link to="/how-to-add-email-signature-apple-mail" className="hover:text-gray-900 transition-colors">Apple Mail Signature Guide</Link></li>
                <li><Link to="/email-signature-best-practices" className="hover:text-gray-900 transition-colors">Signature Best Practices</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/security" className="hover:text-gray-900 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 text-center text-xs text-gray-400">
            {sigCount !== null && sigCount > 0 && (
              <p className="mb-1">{sigCount.toLocaleString()} email signatures created and counting</p>
            )}
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
                href={DONATE_URL}
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
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/security" element={<Security />} />
        <Route path="/my-signatures" element={<MySignatures />} />
        <Route path="/how-to-add-email-signature-gmail" element={<GmailSignature />} />
        <Route path="/how-to-add-email-signature-outlook" element={<OutlookSignature />} />
        <Route path="/how-to-add-email-signature-apple-mail" element={<AppleMailSignature />} />
        <Route path="/free-email-signature-generator-mac" element={<MacSignatureGenerator />} />
        <Route path="/free-gmail-signature-generator" element={<GmailSignatureGenerator />} />
        <Route path="/email-signature-best-practices" element={<SignatureBestPractices />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
