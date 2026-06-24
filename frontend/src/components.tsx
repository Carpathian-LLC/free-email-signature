import { useEffect, useRef, useState } from 'react';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

// Image header banner used at the top of content pages. The photo sits behind a
// solid brand-color overlay (no gradient) so white text always has strong
// contrast. Renders the page's single <h1>, so the page body must not add another.
export function PageHero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative py-16 sm:py-20 bg-brand-blue-dark border-b border-black/20 overflow-hidden">
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-brand-blue-dark/85" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-4 text-white/90 leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
        ) : null}
      </div>
    </section>
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
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue focus:bg-white"
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
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
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

// ── Scaled signature preview ─────────────────────────────────────────

// Renders a signature's raw HTML scaled to fit a fixed-size box without
// clipping. Templates vary in natural height, so a single hardcoded scale
// crops the taller ones. After mount we measure the untransformed content and
// pick the largest scale (capped at maxScale) that fits the box's content area
// in both directions, then recompute whenever the box resizes.
export function ScaledPreview({
  html,
  className = '',
  style,
  maxScale = 1,
}: {
  html: string;
  className?: string;
  style?: React.CSSProperties;
  maxScale?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);

  useEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;

    const fit = () => {
      const cs = getComputedStyle(box);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const bw = box.clientWidth - padX;
      const bh = box.clientHeight - padY;
      const cw = content.scrollWidth;
      const ch = content.scrollHeight;
      if (cw <= 0 || ch <= 0 || bw <= 0 || bh <= 0) return;
      setScale(Math.min(maxScale, bw / cw, bh / ch));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [html, maxScale]);

  return (
    <div ref={boxRef} className={className} style={style}>
      <div
        ref={contentRef}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 'fit-content' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// ── Ads ─────────────────────────────────────────────────────────────

// Google AdSense responsive display unit. Renders only when both the publisher
// ID and a slot ID are set (env-driven, nothing hardcoded). The loader script
// is injected once via index.html.
export function AdSenseBanner() {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const slot = import.meta.env.VITE_ADSENSE_BANNER_SLOT;
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch { /* noop */ }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <div className="flex justify-center py-4 overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
