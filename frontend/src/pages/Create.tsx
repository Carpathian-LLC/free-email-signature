import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { SignatureFields, SocialLink, TemplateId, StyleOptions } from '../types';
import { templates, SAMPLE_DATA } from '../templates';
import { Section, Field, AdBanner, ColorPicker } from '../components';
import { SOCIAL_PLATFORMS } from '../socialIcons';

// ── Constants ───────────────────────────────────────────────────────

const PLACEHOLDER_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%239ca3af'/%3E%3Cellipse cx='100' cy='170' rx='55' ry='45' fill='%239ca3af'/%3E%3C/svg%3E";

const STORAGE_KEY = 'sig-gen-fields';
const TEMPLATE_KEY = 'sig-gen-template';
const STYLE_KEY = 'sig-gen-style';
const API_URL = import.meta.env.VITE_API_URL || '';

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

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const maxSize = 300;
  const scale = Math.min(1, maxSize / Math.max(pixelCrop.width, pixelCrop.height));
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);

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
      'image/jpeg',
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

  useEffect(() => {
    document.title = 'Create Your Email Signature. Free Generator.';
    if (API_URL) {
      fetch(`${API_URL}/api/upload-token`).then(r => r.json()).then(d => {
        if (d.token) setUploadToken(d.token);
      }).catch(() => {});
    }
  }, []);

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
      const blob = await getCroppedImg(cropImage, croppedAreaPixels);
      if (API_URL) {
        try {
          const form = new FormData();
          form.append('file', blob, 'cropped.jpg');
          if (uploadToken) form.append('upload_token', uploadToken);
          if (honeypot) form.append('website_url', honeypot);
          const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: form });
          const data = await res.json();
          if (data.success) {
            update('photoUrl', `${API_URL}${data.url}`);
            closeCrop();
            setUploading(false);
            return;
          }
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
      setTimeout(() => setCopied(null), 2000);
    } catch { copyRawHtml(); }
  }

  async function copyRawHtml() {
    try {
      await navigator.clipboard.writeText(signatureHtml);
      setCopied('html');
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
      <section className="py-8 sm:py-12 bg-page-bg-alt min-h-screen">
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
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue'
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
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                    {!link.platformId && (
                      <input
                        type="text"
                        value={link.iconUrl}
                        onChange={e => updateSocialLink(link.id, { iconUrl: e.target.value })}
                        placeholder="Icon image URL (PNG recommended)"
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Preview</h2>
                <div className="border border-gray-100 rounded-lg p-4 sm:p-6 min-h-[120px] overflow-x-auto">
                  <div ref={previewRef} dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
                {!hasContent && (
                  <p className="text-xs text-gray-400 mt-2 text-center">Showing sample data. Start typing to see your signature.</p>
                )}
              </div>

              {hasContent && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
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
              <AdBanner />
            </div>
          </div>
        </div>
      </section>

      <div className="bg-page-bg">
        <AdBanner />
      </div>
    </>
  );
}
