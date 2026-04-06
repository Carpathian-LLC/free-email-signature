import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { templates, SAMPLE_DATA } from '../templates';
import { StyleOptions } from '../types';

const PREVIEW_STYLE: StyleOptions = { accentColor: '#1B8FF2', separatorColor: '#e5e7eb', iconColor: '#6b7280' };
import { AdBanner, NativeBanner } from '../components';

export default function Home() {
  useEffect(() => {
    document.title = 'My Free Email Signature Generator. No Login, No Paywall.';
  }, []);

  // Popunder ad (from env, not hardcoded)
  useEffect(() => {
    const url = import.meta.env.VITE_AD_POPUNDER_URL;
    if (!url || !url.startsWith('https://')) return;
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue-light to-sky-300">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-white/[0.07] rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-brand-blue-dark/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.03] rounded-full" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/15 text-white rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-white/20">
            100% Free. No Login Required.
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl xl:text-6xl">
            Your emails deserve<br className="hidden sm:block" /> a better sign-off.
          </h1>
          <p className="mt-6 leading-8 text-blue-100/80 max-w-xl mx-auto">
            Create professional email signatures in seconds. No account needed. No paywall. Just fill, copy, and paste.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              to="/create"
              className="bg-white hover:bg-blue-50 text-brand-blue-dark rounded-md px-6 py-3 font-semibold transition-colors shadow-lg shadow-black/10"
            >
              Get Started
            </Link>
            <Link
              to="/templates"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-md px-6 py-3 font-semibold transition-colors backdrop-blur-sm"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Ad 1 ═══ */}
      <div className="bg-page-bg-alt">
        <AdBanner />
      </div>

      {/* ═══ Template Showcase ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg-alt">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Pick a Template</h2>
            <p className="mt-4 text-gray-500">Five styles. All free. Click to start building.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(t => (
              <Link
                key={t.id}
                to={`/create?template=${t.id}`}
                className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{t.description}</p>
                <div className="bg-gray-50 rounded-lg p-4 overflow-hidden" style={{ height: 140 }}>
                  <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left' }}>
                    <div dangerouslySetInnerHTML={{ __html: t.build(SAMPLE_DATA, PREVIEW_STYLE) }} />
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-brand-blue group-hover:text-brand-blue-hover transition-colors">
                  Use this template &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Native Banner ═══ */}
      <div className="bg-page-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <NativeBanner />
        </div>
      </div>

      {/* ═══ Why We Built This ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why we built this</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Every signature generator we found wanted an email, an account, or a credit card. We just wanted a signature. So we built one with none of that.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sign-Up. No Email.</h3>
              <p className="text-sm text-gray-500">You don't need to hand over your email to make a signature for your email. That never made sense to us either.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nothing Is Locked</h3>
              <p className="text-sm text-gray-500">Every template, every feature, every export. No "upgrade to unlock" gates. The whole tool is yours to use.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Works Everywhere</h3>
              <p className="text-sm text-gray-500">Gmail, Outlook, Apple Mail, Thunderbird. Copy once, paste wherever you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Ad 2 ═══ */}
      <div className="bg-page-bg-alt">
        <AdBanner />
      </div>
    </>
  );
}
