import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { getConsentFor } from './cmp/ConsentBanner'
import './index.css'

const gtagId = import.meta.env.VITE_GTAG_ID;
if (gtagId && /^[A-Z0-9-]+$/.test(gtagId) && getConsentFor('analytics')) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
  document.head.appendChild(s);
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  gtag('js', new Date());
  gtag('config', gtagId);
}

const clarityId = import.meta.env.VITE_CLARITY_ID;
if (clarityId && /^[a-z0-9]+$/i.test(clarityId) && getConsentFor('clarity')) {
  (function(c: any, l: any, a: string, r: string, i: string) {
    c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
    const t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", clarityId);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
