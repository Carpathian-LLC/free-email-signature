import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { templates, SAMPLE_DATA, SAMPLE_PHOTOS } from '../templates';
import { StyleOptions } from '../types';
import { useSeo } from '../seo';

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

const TEMPLATE_DETAILS: Record<string, { tagline: string; whenToUse: string }> = {
  professional: {
    tagline: 'A polished corporate signature with photo, dividers, and clear contact hierarchy.',
    whenToUse: 'Best for client-facing roles, sales, recruiting, and anyone in a buttoned-up industry where a headshot reinforces trust.',
  },
  minimal: {
    tagline: 'Pure text, a single divider, and not a pixel of decoration.',
    whenToUse: 'Best for engineers, writers, founders, and anyone who finds heavy signatures embarrassing on a plain-text reply.',
  },
  modern: {
    tagline: 'Accent bar on the left with contemporary spacing and typography.',
    whenToUse: 'Best for startups, designers, and product folks who want a touch of brand color without looking like a banner ad.',
  },
  bold: {
    tagline: 'A colored header bar and strong type for maximum visual presence.',
    whenToUse: 'Best for agencies, freelancers, and anyone using their signature as a small piece of personal branding.',
  },
  compact: {
    tagline: 'A condensed, one-line-feeling layout that takes up the least possible space.',
    whenToUse: 'Best for high-volume email senders, support teams, and anyone who replies thirty times a day and hates seeing their own giant signature in every thread.',
  },
};

export default function Templates() {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useSeo({
    path: '/templates',
  });

  const openPopup = useCallback(() => {
    setPopupMessage(POPUP_MESSAGES[Math.floor(Math.random() * POPUP_MESSAGES.length)]);
  }, []);

  const closePopup = useCallback(() => setPopupMessage(null), []);

  return (
    <>
      {/* Header */}
      <section className="py-16 sm:py-20 bg-page-bg">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Free Email Signature Templates</h1>
          <p className="mt-5 text-lg leading-8 text-gray-500">
            Five professional email signature templates, all free, all open source. Each one is built with inline HTML tables
            so it renders correctly in Gmail, Outlook, Apple Mail, Thunderbird, and every other email client we could test.
            Pick the style that fits your role, fill in your details, and copy it into your email client in under a minute.
          </p>
          <p className="mt-4 text-sm text-gray-400">
            No account. No paywall. No watermark. The same five templates everyone else has, except not locked behind a subscription.
          </p>
        </div>
      </section>

      {/* Template Grid */}
      <section className="py-16 bg-gray-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
          {templates.map((t, i) => {
            const detail = TEMPLATE_DETAILS[t.id];
            const sample = { ...SAMPLE_DATA, photoUrl: SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length] };
            return (
              <div
                key={t.id}
                className={`flex flex-col lg:flex-row gap-8 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Preview: the white card hugs the signature (w-fit, no forced
                    height), centered in its column so the empty space is gray page,
                    not blank card. Strong drop shadow, no border. */}
                <div className="flex-1 w-full flex justify-center">
                  <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-2xl shadow-gray-500/30 w-fit max-w-full overflow-x-auto">
                    <div dangerouslySetInnerHTML={{ __html: t.build(sample, PREVIEW_STYLE) }} />
                  </div>
                </div>

                {/* Description */}
                <div className="flex-1 lg:max-w-md">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.name} Email Signature</h2>
                  <p className="text-gray-600 mb-3">{detail?.tagline || t.description}</p>
                  {detail?.whenToUse && (
                    <p className="text-sm text-gray-500 mb-6">{detail.whenToUse}</p>
                  )}
                  <ul className="space-y-2 text-sm text-gray-500 mb-6 list-disc list-inside">
                    <li>Renders in Gmail, Outlook, Apple Mail, and Thunderbird</li>
                    <li>Supports a profile photo or company logo</li>
                    <li>Add social links: LinkedIn, X, GitHub, Instagram, and more</li>
                    <li>Copy as rich text or raw HTML, whichever your client prefers</li>
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
            );
          })}
        </div>
      </section>

      {/* How to install */}
      <section className="py-20 sm:py-24 bg-page-bg" aria-labelledby="install-guide">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 id="install-guide" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
            How to install your new signature
          </h2>
          <p className="text-gray-600 leading-relaxed mb-10">
            Every template uses standard inline HTML, which means installation is the same boring copy-and-paste it's been since the late 1990s.
            Here's where to paste it in each major client.
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gmail (web)</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm leading-relaxed">
                <li>Click the gear icon, then See all settings.</li>
                <li>Scroll to the Signature section and click Create new.</li>
                <li>Paste your signature into the editor.</li>
                <li>Set it as your default for new messages and replies.</li>
                <li>Click Save Changes at the bottom of the page.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Outlook (desktop, Windows and Mac)</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm leading-relaxed">
                <li>Open File, then Options, then Mail, then Signatures.</li>
                <li>Click New, name your signature, and paste it into the editor.</li>
                <li>Choose it as your default for new messages and replies.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Outlook (web)</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm leading-relaxed">
                <li>Open Settings, then Mail, then Compose and reply.</li>
                <li>Paste your signature into the Email signature box.</li>
                <li>Tick the boxes to include it on new messages and replies.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Apple Mail (macOS)</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm leading-relaxed">
                <li>Open Mail, then Settings, then Signatures.</li>
                <li>Pick the account, click the plus button, and paste your signature.</li>
                <li>Uncheck Always match my default message font so the formatting sticks.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thunderbird</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm leading-relaxed">
                <li>Open Account Settings for your email account.</li>
                <li>Tick Use HTML and paste your signature into the signature text box.</li>
              </ol>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Build Your Signature
            </Link>
          </div>
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
