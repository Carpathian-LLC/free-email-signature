import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { templates, SAMPLE_DATA } from '../templates';
import { StyleOptions } from '../types';

const PREVIEW_STYLE: StyleOptions = { accentColor: '#1B8FF2', separatorColor: '#e5e7eb', iconColor: '#6b7280' };
import { AdBanner } from '../components';

const UPSELL_LABELS: Record<string, string> = {
  professional: 'Unlock Premium Features',
  minimal: 'Remove Watermark',
  modern: 'Upgrade to Pro+',
  bold: 'Subscribe for More Templates',
  compact: 'Start Free Trial',
};

const POPUP_MESSAGES = [
  'There is no premium version. Everything is already unlocked. This is a free tool made by someone who hates paywalls as much as you do.',
  "Of course there's no premium version. What would we even lock? It's an email signature. Go make yours.",
  "You just clicked an upsell link out of habit, didn't you? That's what the internet has done to us. Everything here is free. Always will be.",
  "The whole codebase is public on GitHub. We couldn't sneak in a paywall even if we wanted to.",
];

export default function Templates() {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'My Free Email Signature Templates. Professional Designs for Gmail, Outlook.';
  }, []);

  const openPopup = useCallback(() => {
    setPopupMessage(POPUP_MESSAGES[Math.floor(Math.random() * POPUP_MESSAGES.length)]);
  }, []);

  const closePopup = useCallback(() => setPopupMessage(null), []);

  return (
    <>
      {/* Header */}
      <section className="py-16 sm:py-20 bg-page-bg">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Email Signature Templates</h1>
          <p className="mt-4 leading-8 text-gray-500 max-w-2xl mx-auto">
            Five styles built for email. Each one works in Gmail, Outlook, and Apple Mail. Pick one and make it yours.
          </p>
        </div>
      </section>

      {/* Template Grid */}
      <section className="py-16 bg-page-bg-alt">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
          {templates.map((t, i) => (
            <div
              key={t.id}
              className={`flex flex-col lg:flex-row gap-8 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Preview */}
              <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-sm min-h-[200px] overflow-x-auto">
                <div dangerouslySetInnerHTML={{ __html: t.build(SAMPLE_DATA, PREVIEW_STYLE) }} />
              </div>

              {/* Description */}
              <div className="flex-1 lg:max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.name}</h2>
                <p className="text-gray-500 mb-6">{t.description}</p>
                <ul className="space-y-2 text-sm text-gray-500 mb-6">
                  <li>Works in all major email clients</li>
                  <li>Supports profile photos and social links</li>
                  <li>Copy as rich text or raw HTML</li>
                </ul>
                <Link
                  to={`/create?template=${t.id}`}
                  className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
                >
                  Use This Template
                </Link>
                <button
                  type="button"
                  onClick={openPopup}
                  className="block mt-3 text-xs text-gray-400 hover:text-gray-500 underline underline-offset-2 transition-colors"
                >
                  {UPSELL_LABELS[t.id] || 'Upgrade'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popup */}
      {popupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={closePopup}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-gray-700 leading-relaxed mb-6">{popupMessage}</p>
            <button
              type="button"
              onClick={closePopup}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors"
            >
              Back to the free stuff
            </button>
          </div>
        </div>
      )}

      {/* Ad */}
      <div className="bg-page-bg">
        <AdBanner />
      </div>
    </>
  );
}
