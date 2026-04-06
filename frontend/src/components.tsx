import { useEffect, useRef, useState } from 'react';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
      />
    </div>
  );
}

// ── Color Picker ────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#1B8FF2', '#0A66C2', '#0891B2', '#16A34A', '#D97706',
  '#EA580C', '#DC2626', '#DB2777', '#7C3AED', '#374151',
  '#6b7280', '#000000',
];

export function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5 flex-wrap">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              value.toLowerCase() === color.toLowerCase()
                ? 'border-gray-900 scale-110'
                : 'border-transparent hover:border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        <label
          className="w-6 h-6 rounded-full border border-dashed border-gray-300 overflow-hidden cursor-pointer relative"
          title="Custom color"
        >
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-full h-full"
            style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
          />
        </label>
      </div>
    </div>
  );
}

// ── Ad Banners ──────────────────────────────────────────────────────

const isDev = import.meta.env.DEV;

function AdPlaceholder({ width, height, label }: { width: number; height: number; label: string }) {
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400"
      style={{ width, height }}
    >
      {label} ({width}x{height})
    </div>
  );
}

export function AdBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const adKey = import.meta.env.VITE_AD_BANNER_KEY;
  const adNetwork = import.meta.env.VITE_AD_BANNER_NETWORK;

  const isMobile = typeof window !== 'undefined' &&
    (window.innerWidth <= 767 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  const width = isMobile ? 320 : 468;
  const height = isMobile ? 50 : 60;

  useEffect(() => {
    if (!adKey || !adNetwork || !ref.current || ref.current.children.length > 0) return;
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(adNetwork)) return;
    if (!/^[a-f0-9]+$/i.test(adKey)) return;

    const config = document.createElement('script');
    config.textContent = `atOptions = {'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};`;
    ref.current.appendChild(config);

    const invoke = document.createElement('script');
    invoke.src = `https://${adNetwork}/${adKey}/invoke.js`;
    ref.current.appendChild(invoke);

    const timer = setTimeout(() => {
      if (ref.current && ref.current.querySelector('iframe')) setAdLoaded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [adKey, adNetwork, width, height]);

  if (!adKey) return null;

  return (
    <div className="flex justify-center py-4 overflow-hidden">
      <div ref={ref} />
      {isDev && !adLoaded && <AdPlaceholder width={width} height={height} label="Banner Ad" />}
    </div>
  );
}

export function SidebarAd() {
  const ref = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const adKey = import.meta.env.VITE_AD_SIDEBAR_KEY;
  const adNetwork = import.meta.env.VITE_AD_BANNER_NETWORK;

  useEffect(() => {
    if (!adKey || !adNetwork || !ref.current || ref.current.children.length > 0) return;
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(adNetwork)) return;
    if (!/^[a-f0-9]+$/i.test(adKey)) return;

    const config = document.createElement('script');
    config.textContent = `atOptions = {'key':'${adKey}','format':'iframe','height':600,'width':160,'params':{}};`;
    ref.current.appendChild(config);

    const invoke = document.createElement('script');
    invoke.src = `https://${adNetwork}/${adKey}/invoke.js`;
    ref.current.appendChild(invoke);

    const timer = setTimeout(() => {
      if (ref.current && ref.current.querySelector('iframe')) setAdLoaded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [adKey, adNetwork]);

  if (!adKey) return null;

  return (
    <div className="flex justify-center py-4 overflow-hidden">
      <div ref={ref} />
      {isDev && !adLoaded && <AdPlaceholder width={160} height={600} label="Sidebar Ad" />}
    </div>
  );
}

export function NativeBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const scriptUrl = import.meta.env.VITE_AD_NATIVE_SCRIPT;
  const containerId = import.meta.env.VITE_AD_NATIVE_CONTAINER;

  useEffect(() => {
    if (!scriptUrl || !containerId || !ref.current || ref.current.children.length > 0) return;
    if (!scriptUrl.startsWith('https://')) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = scriptUrl;
    ref.current.appendChild(script);

    const container = document.createElement('div');
    container.id = containerId;
    ref.current.appendChild(container);

    const timer = setTimeout(() => {
      if (ref.current && ref.current.querySelector('iframe')) setAdLoaded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [scriptUrl, containerId]);

  if (!scriptUrl) return null;

  return (
    <div className="flex justify-center py-4 overflow-hidden">
      <div ref={ref} />
      {isDev && !adLoaded && <AdPlaceholder width={468} height={120} label="Native Ad" />}
    </div>
  );
}
