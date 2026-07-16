import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { SignatureFields, SocialLink, TemplateId, StyleOptions } from '../types';
import { templates, SAMPLE_DATA } from '../templates';
import { Section, Field, ColorPicker } from '../components';
import { SOCIAL_PLATFORMS } from '../socialIcons';
import { useSeo } from '../seo';

// ── Constants ───────────────────────────────────────────────────────

const PLACEHOLDER_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%239ca3af'/%3E%3Cellipse cx='100' cy='170' rx='55' ry='45' fill='%239ca3af'/%3E%3C/svg%3E";

const STORAGE_KEY = 'sig-gen-fields';
const TEMPLATE_KEY = 'sig-gen-template';
const STYLE_KEY = 'sig-gen-style';
const HISTORY_KEY = 'cos_saved_signatures';
const HISTORY_CAP = 25;
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const EMPTY: SignatureFields = {
  fullName: '', title: '', company: '', email: '', phone: '', website: '',
  addressLine1: '', addressLine2: '', photoUrl: '', socialLinks: [],
};

const DEFAULT_STYLE: StyleOptions = {
  accentColor: '#1B8FF2',
  separatorColor: '#e5e7eb',
  iconColor: '#6b7280',
};

// ── Persistence helpers ─────────────────────────────────────────────

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Confirms an uploaded image URL actually serves an image before we put it in
// the signature, so a rejected upload can't silently become a broken photo.
function verifyImageLoads(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 10000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

function loadFields(): SignatureFields {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY,
      ...parsed,
      socialLinks: Array.isArray(parsed.socialLinks)
        ? parsed.socialLinks.map((l: Partial<SocialLink>) => ({ platformId: '', ...l }))
        : [],
    };
  } catch { return EMPTY; }
}

function loadTemplate(): TemplateId {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    if (raw && templates.some(t => t.id === raw)) return raw as TemplateId;
  } catch { /* noop */ }
  return 'professional';
}

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

function loadStyle(): StyleOptions {
  try {
    const raw = localStorage.getItem(STYLE_KEY);
    if (!raw) return DEFAULT_STYLE;
    const parsed = JSON.parse(raw);
    return {
      accentColor: typeof parsed.accentColor === 'string' && HEX_COLOR.test(parsed.accentColor) ? parsed.accentColor : DEFAULT_STYLE.accentColor,
      separatorColor: typeof parsed.separatorColor === 'string' && HEX_COLOR.test(parsed.separatorColor) ? parsed.separatorColor : DEFAULT_STYLE.separatorColor,
      iconColor: typeof parsed.iconColor === 'string' && HEX_COLOR.test(parsed.iconColor) ? parsed.iconColor : DEFAULT_STYLE.iconColor,
    };
  } catch { return DEFAULT_STYLE; }
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return raw;
}

// ── Crop utilities ──────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// background is a CSS color painted behind the photo, or 'transparent' to keep
// alpha. Transparent crops must export as PNG: JPEG has no alpha channel and
// the canvas flattens transparent pixels to black.
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  background: string,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const maxSize = 300;
  const scale = Math.min(1, maxSize / Math.max(pixelCrop.width, pixelCrop.height));
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);

  if (background !== 'transparent') {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    canvas.width, canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      background === 'transparent' ? 'image/png' : 'image/jpeg',
      0.9,
    );
  });
}

// ── Component ───────────────────────────────────────────────────────

export default function Create() {
  const [searchParams] = useSearchParams();
  const paramTemplate = searchParams.get('template') as TemplateId | null;

  const [fields, setFields] = useState<SignatureFields>(EMPTY);
  const [templateId, setTemplateId] = useState<TemplateId>('professional');
  const [styleOptions, setStyleOptions] = useState<StyleOptions>(DEFAULT_STYLE);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState<'html' | 'rich' | null>(null);
  const [uploading, setUploading] = useState(false);

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropBg, setCropBg] = useState<string>('transparent');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);

  const [showIconPicker, setShowIconPicker] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [uploadToken, setUploadToken] = useState('');
  const [showUploadPolicy, setShowUploadPolicy] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const modalOpen = !!cropImage || showUploadPolicy;
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [modalOpen]);

  // ── Lifecycle ───────────────────────────────────────────────────

  useSeo({
    path: '/create',
  });

  const fetchUploadToken = useCallback(() => {
    if (!API_URL) return;
    fetch(`${API_URL}/api/upload-token`).then(r => r.json()).then(d => {
      if (d.token) setUploadToken(d.token);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchUploadToken(); }, [fetchUploadToken]);

  useEffect(() => {
    setFields(loadFields());
    const initial = paramTemplate && templates.some(t => t.id === paramTemplate) ? paramTemplate : loadTemplate();
    setTemplateId(initial);
    setStyleOptions(loadStyle());
    setHydrated(true);
  }, [paramTemplate]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  }, [fields, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(TEMPLATE_KEY, templateId);
  }, [templateId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STYLE_KEY, JSON.stringify(styleOptions));
  }, [styleOptions, hydrated]);

  // ── Field updates ─────────────────────────────────────────────

  function update(key: keyof Omit<SignatureFields, 'socialLinks'>, value: string) {
    setFields(prev => ({ ...prev, [key]: key === 'phone' ? formatPhone(value) : value }));
  }

  function handleClear() {
    setFields(EMPTY);
    setStyleOptions(DEFAULT_STYLE);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STYLE_KEY);
  }

  // ── Social links ──────────────────────────────────────────────

  function addPlatformLink(platformId: string) {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;
    setFields(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, {
        id: newId(),
        platform: platform.name,
        url: platform.urlTemplate,
        iconUrl: '',
        platformId: platform.id,
      }],
    }));
    setShowIconPicker(false);
  }

  function addCustomLink() {
    setFields(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, {
        id: newId(),
        platform: '',
        url: '',
        iconUrl: '',
        platformId: '',
      }],
    }));
    setShowIconPicker(false);
  }

  function updateSocialLink(id: string, patch: Partial<SocialLink>) {
    setFields(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(l => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }

  function removeSocialLink(id: string) {
    setFields(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(l => l.id !== id),
    }));
  }

  // ── Photo crop ────────────────────────────────────────────────

  function openCrop(imageSrc: string) {
    setCropImage(imageSrc);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropBg('transparent');
    setCroppedAreaPixels(null);
    setCropError(null);
  }

  function closeCrop() {
    if (cropImage?.startsWith('blob:')) URL.revokeObjectURL(cropImage);
    setCropImage(null);
    setCroppedAreaPixels(null);
    setCropError(null);
  }

  const onCropComplete = useCallback((_: Area, croppedPx: Area) => {
    setCroppedAreaPixels(croppedPx);
  }, []);

  function handlePhotoUpload(file: File) {
    if (!policyAccepted) {
      setPendingFile(file);
      setShowUploadPolicy(true);
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    openCrop(blobUrl);
  }

  function acceptPolicy() {
    setPolicyAccepted(true);
    setShowUploadPolicy(false);
    if (pendingFile) {
      const blobUrl = URL.createObjectURL(pendingFile);
      openCrop(blobUrl);
      setPendingFile(null);
    }
  }

  function declinePolicy() {
    setShowUploadPolicy(false);
    setPendingFile(null);
  }

  async function applyCrop() {
    if (!cropImage || !croppedAreaPixels) return;
    setUploading(true);
    setCropError(null);
    try {
      const blob = await getCroppedImg(cropImage, croppedAreaPixels, cropBg);
      const uploadName = cropBg === 'transparent' ? 'cropped.png' : 'cropped.jpg';
      if (API_URL) {
        if (!uploadToken) {
          // Tokens are single-use; the previous one was consumed. Fetch a
          // replacement and have the user retry rather than uploading without
          // one, which the server rejects.
          fetchUploadToken();
          setCropError('Upload session expired. Please try again in a few seconds.');
          setUploading(false);
          return;
        }
        try {
          const form = new FormData();
          form.append('file', blob, uploadName);
          form.append('upload_token', uploadToken);
          if (honeypot) form.append('website_url', honeypot);
          const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: form });
          const data = await res.json();
          setUploadToken('');
          fetchUploadToken();
          if (data.success) {
            const url = `${API_URL}${data.url}`;
            if (await verifyImageLoads(url)) {
              update('photoUrl', url);
              closeCrop();
              setUploading(false);
              return;
            }
            setCropError('Upload could not be verified. Please try again.');
            setUploading(false);
            return;
          }
          setCropError(data.error || 'Upload failed. Please try again later.');
          setUploading(false);
          return;
        } catch {
          setCropError('Upload failed. Please try again later.');
          setUploading(false);
          return;
        }
      }
      setCropError('Upload failed. Please try again later.');
      setUploading(false);
    } catch {
      setCropError('Could not crop this image. Try uploading a file instead.');
      setUploading(false);
    }
  }

  // ── Template & preview ────────────────────────────────────────

  const template = templates.find(t => t.id === templateId) || templates[0];

  const hasContent = Object.entries(fields).some(([k, v]) => {
    if (k === 'socialLinks') return (v as SocialLink[]).length > 0;
    return (v as string).trim() !== '';
  });

  const previewFields: SignatureFields = hasContent
    ? { ...fields, photoUrl: fields.photoUrl || '' }
    : { ...SAMPLE_DATA, photoUrl: PLACEHOLDER_PHOTO };

  const previewHtml = template.build(previewFields, styleOptions);

  useEffect(() => {
    if (!previewRef.current) return;
    const imgs = previewRef.current.querySelectorAll('img');
    imgs.forEach(img => {
      img.onerror = () => { img.src = PLACEHOLDER_PHOTO; img.onerror = null; };
    });
  }, [previewHtml]);
  const signatureHtml = template.build(fields, styleOptions);

  // ── Copy ──────────────────────────────────────────────────────

  // Fire-and-forget ping to tick the public signatures-created counter.
  const pingSignatureCreated = () => {
    if (API_URL) { fetch(`${API_URL}/api/signature-created`, { method: 'POST' }).catch(() => {}); }
  };

  // Append the current signature to the local "My Signatures" history.
  // Stored only in this browser. Capped, newest first, skips exact dupes.
  const saveToHistory = () => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const history = Array.isArray(list) ? list : [];
      if (history[0] && history[0].html === signatureHtml) return;
      const label = fields.fullName.trim() || fields.email.trim() || 'Untitled signature';
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label,
        savedAt: Date.now(),
        data: fields,
        html: signatureHtml,
        photoUrl: fields.photoUrl ? fields.photoUrl : null,
      };
      const next = [entry, ...history].slice(0, HISTORY_CAP);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch { /* noop */ }
  };

  async function copyAsRichText() {
    try {
      const blob = new Blob([signatureHtml], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': new Blob([signatureHtml], { type: 'text/plain' }),
        }),
      ]);
      setCopied('rich');
      pingSignatureCreated();
      saveToHistory();
      setTimeout(() => setCopied(null), 2000);
    } catch { copyRawHtml(); }
  }

  async function copyRawHtml() {
    try {
      await navigator.clipboard.writeText(signatureHtml);
      setCopied('html');
      pingSignatureCreated();
      saveToHistory();
      setTimeout(() => setCopied(null), 2000);
    } catch { /* noop */ }
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      {/* ── Crop Modal ─────────────────────────────────────────── */}
      {cropImage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-5 w-full max-w-lg max-h-[90dvh] overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Crop Photo</h2>
            <div className="relative w-full h-56 sm:h-80 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-500 flex-shrink-0">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 accent-brand-blue"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 flex-shrink-0">Background</span>
              <button
                onClick={() => setCropBg('transparent')}
                title="Transparent"
                aria-label="Transparent background"
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  cropBg === 'transparent' ? 'border-gray-900 scale-110' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{
                  background:
                    'repeating-conic-gradient(#d1d5db 0% 25%, #ffffff 0% 50%) 0 0 / 8px 8px',
                }}
              />
              <button
                onClick={() => setCropBg('#ffffff')}
                title="White"
                aria-label="White background"
                className={`w-6 h-6 rounded-full border-2 bg-white transition-all ${
                  cropBg === '#ffffff' ? 'border-gray-900 scale-110' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              <input
                type="color"
                value={cropBg === 'transparent' ? '#ffffff' : cropBg}
                onChange={e => setCropBg(e.target.value)}
                title="Custom color"
                aria-label="Custom background color"
                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400 cursor-pointer p-0"
              />
              <span className="text-[11px] text-gray-400">
                {cropBg === 'transparent' ? 'Transparent (PNG)' : cropBg}
              </span>
            </div>
            {cropError && (
              <p className="mt-2 text-xs text-red-500">{cropError}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeCrop}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                disabled={uploading}
                className="px-4 py-2 text-sm text-white bg-brand-blue rounded-md hover:bg-brand-blue-hover transition-colors disabled:opacity-50"
              >
                {uploading ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Policy Modal ──────────────────────────────── */}
      {showUploadPolicy && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl p-5 sm:p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Policy</h2>
            <div className="text-sm text-gray-600 space-y-2 mb-5">
              <p>By uploading a photo, you agree to the following:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Maximum file size: 2MB</li>
                <li>Maximum dimensions: 2000x2000px</li>
                <li>Supported formats: JPEG, PNG, GIF, WebP</li>
                <li>No adult, violent, or illegal content</li>
                <li>Uploads are stored on our server and may be deleted at any time</li>
                <li>Abuse of the upload service will result in an IP ban</li>
              </ul>
            </div>
            <label className="flex items-start gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked readOnly className="mt-0.5 accent-brand-blue" />
              <span className="text-sm text-gray-700">I agree to the upload policy</span>
            </label>
            <div className="overflow-hidden h-0 aria-hidden">
              <label>
                <span>Confirm you are not a robot</span>
                <input
                  type="text"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={declinePolicy}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={acceptPolicy}
                className="px-4 py-2 text-sm text-white bg-brand-blue rounded-md hover:bg-brand-blue-hover transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page ───────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-gray-200 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Signature</h1>
            {hasContent && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-8">Pick a template, fill in your details, and copy.</p>

          <div className="flex gap-2 flex-wrap mb-8">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  templateId === t.id
                    ? 'bg-brand-blue text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-blue'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Left column: form ──────────────────────────── */}
            <div className="space-y-4">
              <Section title="Identity">
                <Field label="Full Name" value={fields.fullName} onChange={v => update('fullName', v)} placeholder="Peter Oswald" />
                <Field label="Title" value={fields.title} onChange={v => update('title', v)} placeholder="Software Engineer" />
                <Field label="Company" value={fields.company} onChange={v => update('company', v)} placeholder="Carpathian" />
              </Section>

              <Section title="Contact">
                <Field label="Email" value={fields.email} onChange={v => update('email', v)} placeholder="peter@carpathian.ai" type="email" />
                <Field label="Phone" value={fields.phone} onChange={v => update('phone', v)} placeholder="(515) 344-3081" />
                <Field label="Website" value={fields.website} onChange={v => update('website', v)} placeholder="https://carpathian.ai" />
                <Field label="Address Line 1" value={fields.addressLine1} onChange={v => update('addressLine1', v)} placeholder="West Des Moines, IA 50265" />
                <Field label="Address Line 2" value={fields.addressLine2} onChange={v => update('addressLine2', v)} placeholder="" />
              </Section>

              {/* ── Profile Photo ─────────────────────────────── */}
              <Section title="Profile Photo">
                <Field label="Photo URL" value={fields.photoUrl} onChange={v => update('photoUrl', v)} placeholder="https://example.com/photo.jpg" />
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
                    />
                  </label>
                  {fields.photoUrl && (
                    <button
                      onClick={() => openCrop(fields.photoUrl)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4v4H4zM16 16h4v4h-4zM4 16l4-4m8-4l4-4" />
                      </svg>
                      Crop
                    </button>
                  )}
                </div>
              </Section>

              {/* ── Social Links ──────────────────────────────── */}
              <Section title="Social Links">
                {fields.socialLinks.map(link => (
                  <div key={link.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      {link.platformId ? (
                        <>
                          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill={styleOptions.iconColor}>
                            <path d={SOCIAL_PLATFORMS.find(p => p.id === link.platformId)?.path || ''} />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{link.platform}</span>
                        </>
                      ) : (
                        <input
                          type="text"
                          value={link.platform}
                          onChange={e => updateSocialLink(link.id, { platform: e.target.value })}
                          placeholder="Platform name"
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      )}
                      <button
                        onClick={() => removeSocialLink(link.id)}
                        className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={link.url}
                      onChange={e => updateSocialLink(link.id, { url: e.target.value })}
                      placeholder={link.platformId ? `Your ${link.platform} URL` : 'Profile URL (https://...)'}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                    {!link.platformId && (
                      <input
                        type="text"
                        value={link.iconUrl}
                        onChange={e => updateSocialLink(link.id, { iconUrl: e.target.value })}
                        placeholder="Icon image URL (PNG recommended)"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    )}
                  </div>
                ))}

                {showIconPicker ? (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <p className="text-xs font-medium text-gray-500">Choose a platform</p>
                      <button
                        onClick={() => setShowIconPicker(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5">
                      {SOCIAL_PLATFORMS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => addPlatformLink(p.id)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#374151">
                            <path d={p.path} />
                          </svg>
                          <span className="text-[10px] text-gray-500 leading-tight text-center">{p.name}</span>
                        </button>
                      ))}
                      <button
                        onClick={addCustomLink}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                      >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path strokeLinecap="round" d="M12 8v8M8 12h8" />
                        </svg>
                        <span className="text-[10px] text-gray-500 leading-tight text-center">Custom</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowIconPicker(true)}
                    className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-colors"
                  >
                    + Add Social Link
                  </button>
                )}
              </Section>

              {/* ── Colors ────────────────────────────────────── */}
              <Section title="Colors">
                <ColorPicker
                  label="Accent Color (banner, accent lines, links)"
                  value={styleOptions.accentColor}
                  onChange={v => { if (HEX_COLOR.test(v)) setStyleOptions(prev => ({ ...prev, accentColor: v })); }}
                />
                <ColorPicker
                  label="Divider / Border Color"
                  value={styleOptions.separatorColor}
                  onChange={v => { if (HEX_COLOR.test(v)) setStyleOptions(prev => ({ ...prev, separatorColor: v })); }}
                />
                <ColorPicker
                  label="Social Icon Color"
                  value={styleOptions.iconColor}
                  onChange={v => { if (HEX_COLOR.test(v)) setStyleOptions(prev => ({ ...prev, iconColor: v })); }}
                />
              </Section>
            </div>

            {/* ── Right column: preview ──────────────────────── */}
            <div className="lg:sticky lg:top-20 self-start space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Preview</h2>
                <div className="border border-gray-100 rounded-lg p-4 sm:p-6 min-h-[120px] overflow-x-auto">
                  <div ref={previewRef} dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
                {!hasContent && (
                  <p className="text-xs text-gray-400 mt-2 text-center">Showing sample data. Start typing to see your signature.</p>
                )}
              </div>

              {hasContent && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-gray-900">Copy Signature</h2>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={copyAsRichText}
                      className="flex-1 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md text-sm font-semibold transition-colors"
                    >
                      {copied === 'rich' ? 'Copied!' : 'Copy for Email Client'}
                    </button>
                    <button
                      onClick={copyRawHtml}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-semibold transition-colors"
                    >
                      {copied === 'html' ? 'Copied!' : 'Copy HTML'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    <strong className="text-gray-500">Copy for Email Client</strong> pastes directly into Gmail or Outlook signature settings.
                    <br />
                    <strong className="text-gray-500">Copy HTML</strong> copies the raw source code.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO / informational content (static, prerendered) ────────
          Rendered identically on server and client so it is safe to
          prerender. Gives crawlers real content on the flagship /create
          route instead of an empty interactive shell. */}
      <section className="py-16 sm:py-20 bg-page-bg border-t border-gray-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            A free email signature generator that actually stays free
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This is a browser-based tool for building a professional HTML email signature in about a minute.
            Type your details into the form above, pick one of ten templates, and copy the result straight into
            Gmail, Outlook, or Apple Mail. There is no account to create, no email to hand over, and nothing to pay.
            Your signature is generated entirely in your browser, and the details you type never leave your device
            unless you choose to upload a photo.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">What you can add to your signature</h3>
          <ul className="mt-4 space-y-2 text-gray-600 leading-relaxed list-disc list-inside">
            <li>Your name, job title, and company, laid out with a clear visual hierarchy</li>
            <li>Email, phone, website, and a two-line address, each linked correctly</li>
            <li>A round profile photo or a company logo, cropped in the browser before it is added</li>
            <li>Social links for LinkedIn, X, GitHub, Instagram, YouTube, and more</li>
            <li>A brand accent color, divider color, and icon color to match your company style</li>
          </ul>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">How it works, in three steps</h3>
          <ol className="mt-4 space-y-3 text-gray-600 leading-relaxed list-decimal list-inside">
            <li><span className="font-medium text-gray-800">Pick a template.</span> Choose from professional, minimal, modern, bold, compact, elegant, sidebar, stacked, corporate, or creative. Every one is built with inline HTML tables so it survives the quirks of real email clients.</li>
            <li><span className="font-medium text-gray-800">Fill in your details.</span> The live preview updates as you type, so you see exactly what recipients will see before you copy anything.</li>
            <li><span className="font-medium text-gray-800">Copy and paste.</span> Use <em>Copy for Email Client</em> to paste formatted straight into your signature settings, or <em>Copy HTML</em> if you would rather work with the raw source.</li>
          </ol>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">Works in every major email client</h3>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The signatures use table-based inline HTML, the format email clients have rendered reliably for decades.
            That means they display consistently in Gmail on the web, new and classic Outlook on Windows and Mac,
            Outlook on the web, Apple Mail on macOS, and Thunderbird. If you need the exact clicks for your client,
            our step-by-step guides for{' '}
            <Link to="/how-to-add-email-signature-gmail" className="text-brand-blue hover:text-brand-blue-hover font-medium">Gmail</Link>,{' '}
            <Link to="/how-to-add-email-signature-outlook" className="text-brand-blue hover:text-brand-blue-hover font-medium">Outlook</Link>, and{' '}
            <Link to="/how-to-add-email-signature-apple-mail" className="text-brand-blue hover:text-brand-blue-hover font-medium">Apple Mail</Link>{' '}
            walk through each one. You can also browse all ten{' '}
            <Link to="/templates" className="text-brand-blue hover:text-brand-blue-hover font-medium">signature templates</Link>{' '}
            side by side first.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">Frequently asked questions</h3>
          <div className="mt-4 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900">Is this email signature generator really free?</h4>
              <p className="mt-1 text-gray-600 leading-relaxed">
                Yes. Every template and every feature is available to everyone at no cost. There is no premium tier,
                no watermark added to your signature, and no "Powered by" line forced into your emails. Ads on the
                page help cover hosting, and that is the whole business model.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Do I need to create an account?</h4>
              <p className="mt-1 text-gray-600 leading-relaxed">
                No. There is no signup and no login. Your work is saved locally in your own browser so you can come
                back to it, and you can view past signatures on the{' '}
                <Link to="/my-signatures" className="text-brand-blue hover:text-brand-blue-hover font-medium">My Signatures</Link> page.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">What happens to my data and my photo?</h4>
              <p className="mt-1 text-gray-600 leading-relaxed">
                The text you enter stays in your browser and is never sent to us. If you upload a photo, it is stored
                on our server so it can be linked from your signature. Full details are on the{' '}
                <Link to="/privacy" className="text-brand-blue hover:text-brand-blue-hover font-medium">privacy</Link> and{' '}
                <Link to="/security" className="text-brand-blue hover:text-brand-blue-hover font-medium">security</Link> pages.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Will the signature look right on mobile?</h4>
              <p className="mt-1 text-gray-600 leading-relaxed">
                Yes. The templates are built to stay readable on phones as well as desktops, since a large share of
                email is now read on mobile. For more on that, see our guide to{' '}
                <Link to="/blog/mobile-friendly-emails" className="text-brand-blue hover:text-brand-blue-hover font-medium">mobile-friendly emails</Link>.
              </p>
            </div>
          </div>

          <p className="mt-10 text-gray-600 leading-relaxed">
            Ready to build yours? Scroll back up, or read our{' '}
            <Link to="/email-signature-best-practices" className="text-brand-blue hover:text-brand-blue-hover font-medium">email signature best practices</Link>{' '}
            first to decide what to include and what to leave out.
          </p>
        </div>
      </section>
    </>
  );
}
