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
  function gtag(..._args: any[]) { (window as any).dataLayer.push(arguments); }
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

// Google AdSense. Loads for every visitor by design (not gated by the consent
// banner). Env-driven so the publisher ID is never hardcoded.
const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
if (adsenseClient && /^ca-pub-[0-9]+$/.test(adsenseClient)) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
