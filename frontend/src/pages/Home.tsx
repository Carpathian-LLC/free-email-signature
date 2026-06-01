import { Link } from 'react-router-dom';
import { templates, SAMPLE_DATA } from '../templates';
import { StyleOptions } from '../types';
import { useSeo } from '../seo';

const PREVIEW_STYLE: StyleOptions = { accentColor: '#1B8FF2', separatorColor: '#e5e7eb', iconColor: '#6b7280' };
import { AdBanner, NativeBanner, AdSenseBanner, RectangleAd } from '../components';

export default function Home() {
  useSeo({
    path: '/',
  });

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="relative py-20 sm:py-28 bg-brand-blue-dark border-b border-black/20">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block px-4 py-1.5 bg-white text-brand-blue-dark rounded-full text-sm font-semibold mb-6">
            Free. Open Source. No Account Required.
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl xl:text-6xl">
            Free Email Signature Generator <br className="hidden sm:block" /> for Gmail, Outlook, and Apple Mail
          </h1>
          <p className="mt-6 leading-8 text-white max-w-2xl mx-auto">
            A fast, browser-based HTML email signature generator. Five professional templates, photo and logo upload,
            social link integration, and one-click copy as rich text or raw HTML. Compatible with Gmail, Outlook,
            Apple Mail, Thunderbird, Yahoo Mail, ProtonMail, and Fastmail. No account. No paywall. No watermark.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              to="/create"
              className="bg-white hover:bg-gray-100 text-brand-blue-dark rounded-md px-6 py-3 font-semibold transition-colors"
            >
              Create Email Signature
            </Link>
            <Link
              to="/templates"
              className="bg-transparent hover:bg-white/10 text-white border border-white rounded-md px-6 py-3 font-semibold transition-colors"
            >
              Browse Templates
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/15">
            {[
              { stat: '5', label: 'Professional templates' },
              { stat: '8+', label: 'Email clients supported' },
              { stat: '$0', label: 'No paywall, ever' },
              { stat: '0', label: 'Accounts required' },
            ].map(({ stat, label }) => (
              <div key={label} className="bg-white/5 px-4 py-5">
                <dt className="text-2xl font-bold text-white">{stat}</dt>
                <dd className="mt-1 text-xs text-white/70 leading-snug">{label}</dd>
              </div>
            ))}
          </dl>
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Email Signature Templates</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Five professional HTML email signature templates. Each template is built with inline tables and inline CSS
              for predictable rendering in Gmail, Outlook, Apple Mail, and Thunderbird. Click any template to start building.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(t => (
              <Link
                key={t.id}
                to={`/create?template=${t.id}`}
                className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.name} Email Signature Template</h3>
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

      {/* ═══ Ad ═══ */}
      <div className="bg-page-bg-alt">
        <AdSenseBanner />
      </div>

      {/* ═══ How It Works ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg" aria-labelledby="how-it-works">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="how-it-works" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How to Create an Email Signature
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Three steps. No tutorial required. The full email signature generator runs in your browser.
            </p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <li className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-sm font-bold text-brand-blue mb-2">Step 1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Template</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select from five email signature templates: Professional, Minimal, Modern, Bold, or Compact.
                Switch templates at any time. Your details carry over automatically.
              </p>
            </li>
            <li className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-sm font-bold text-brand-blue mb-2">Step 2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Your Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Add your name, job title, company, email, phone, website, and address. Upload a square headshot or
                company logo. Add social links for LinkedIn, X, GitHub, Instagram, and more. Form data is saved to
                browser localStorage and never sent to a server.
              </p>
            </li>
            <li className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-sm font-bold text-brand-blue mb-2">Step 3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Copy and Paste</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Copy as rich text and paste directly into Gmail, Outlook, or Apple Mail. Or copy the raw HTML
                for manual installation, MDM deployment, or templating across a team.
              </p>
            </li>
          </ol>
          <div className="text-center mt-12">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Start Building
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Choose Your Email Client ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg-alt" aria-labelledby="by-client">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="by-client" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              A Free Signature Generator for Every Email Client
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              The same signature works everywhere, but each email client installs it a little differently.
              Start with the generator or guide built for your client.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              to="/free-gmail-signature-generator"
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Gmail Signature Generator</h3>
              <p className="text-sm text-gray-500">
                Build a Gmail signature and paste it straight into the web signature editor. Photo, links, and
                layout carry over intact.
              </p>
              <p className="mt-4 text-sm font-medium text-brand-blue group-hover:text-brand-blue-hover transition-colors">
                Make a Gmail signature &rarr;
              </p>
            </Link>
            <Link
              to="/free-email-signature-generator-mac"
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Signature Generator for Mac</h3>
              <p className="text-sm text-gray-500">
                Made for Apple Mail on macOS, with templates that render correctly on Retina displays and in
                dark mode.
              </p>
              <p className="mt-4 text-sm font-medium text-brand-blue group-hover:text-brand-blue-hover transition-colors">
                Make a Mac signature &rarr;
              </p>
            </Link>
            <Link
              to="/how-to-add-email-signature-outlook"
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlook Signature Guide</h3>
              <p className="text-sm text-gray-500">
                Step-by-step install for Outlook on Windows, Mac, the web, and mobile, including where each
                version hides the setting.
              </p>
              <p className="mt-4 text-sm font-medium text-brand-blue group-hover:text-brand-blue-hover transition-colors">
                Read the Outlook guide &rarr;
              </p>
            </Link>
            <Link
              to="/email-signature-best-practices"
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Signature Best Practices</h3>
              <p className="text-sm text-gray-500">
                What to include, what to cut, and how to keep a signature readable across desktop, web, and
                mobile inboxes.
              </p>
              <p className="mt-4 text-sm font-medium text-brand-blue group-hover:text-brand-blue-hover transition-colors">
                See best practices &rarr;
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Native Banner ═══ */}
      <div className="bg-page-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <NativeBanner />
        </div>
      </div>

      {/* ═══ Email Client Compatibility ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg-alt" aria-labelledby="email-clients">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="email-clients" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Cross-Client Compatibility
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Every email signature is generated as inline HTML with inline CSS, the standard format for cross-client
              email rendering. The same approach used by Mailchimp, Stripe, and most transactional email platforms.
              Tested across desktop, web, and mobile clients.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">Gmail</div>
              <div className="text-xs text-gray-500 mt-1">Web, iOS, Android</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">Outlook</div>
              <div className="text-xs text-gray-500 mt-1">Windows, Mac, Web, Mobile</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">Apple Mail</div>
              <div className="text-xs text-gray-500 mt-1">macOS, iOS, iPadOS</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">Thunderbird</div>
              <div className="text-xs text-gray-500 mt-1">Windows, macOS, Linux</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">Yahoo Mail</div>
              <div className="text-xs text-gray-500 mt-1">Web, Mobile</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">ProtonMail</div>
              <div className="text-xs text-gray-500 mt-1">Web, Mobile</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">Spark</div>
              <div className="text-xs text-gray-500 mt-1">macOS, iOS, Android</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900">Fastmail, Hey</div>
              <div className="text-xs text-gray-500 mt-1">Web, Mobile</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Ad ═══ */}
      <div className="bg-page-bg-alt">
        <RectangleAd />
      </div>

      {/* ═══ Features ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg" aria-labelledby="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="features" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Features</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              A complete email signature maker with the features other generators put behind a paywall.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Account Required</h3>
              <p className="text-sm text-gray-500">
                Signature data stored in browser localStorage. No registration, no email collection,
                no server-side user record.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Unlocked</h3>
              <p className="text-sm text-gray-500">
                All five email signature templates, all export formats, all customization options. No premium tier.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo and Logo Upload</h3>
              <p className="text-sm text-gray-500">
                Upload a profile photo or company logo with built-in cropping. Images served from a content-addressed
                URL for reliable cross-client rendering.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Link Icons</h3>
              <p className="text-sm text-gray-500">
                Add LinkedIn, X, GitHub, Instagram, Facebook, YouTube, Mastodon, Bluesky, and more.
                Icons inherit your accent color.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Color Customization</h3>
              <p className="text-sm text-gray-500">
                Set your accent color, separator color, and icon color. Match your company branding without
                editing raw HTML.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rich Text and Raw HTML Export</h3>
              <p className="text-sm text-gray-500">
                Copy as rich text for direct paste into webmail, or export raw HTML for manual installation,
                team templating, or MDM deployment.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy by Default</h3>
              <p className="text-sm text-gray-500">
                Form data never leaves your browser. Image uploads use content-addressed hashing with a secret salt.
                No third-party tracking unless you accept the cookie banner.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Open Source</h3>
              <p className="text-sm text-gray-500">
                Full source code published on GitHub under a permissive license. Audit it, fork it, or self-host it.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Compatible</h3>
              <p className="text-sm text-gray-500">
                Signatures render correctly on Gmail iOS, Gmail Android, Apple Mail on iPhone and iPad,
                and Outlook mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Ad ═══ */}
      <div className="bg-page-bg">
        <AdSenseBanner />
      </div>

      {/* ═══ Anatomy of a Good Signature ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg-alt" aria-labelledby="good-signature">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 id="good-signature" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
            Anatomy of a Professional Email Signature
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            A good business email signature gives the recipient exactly what they need to identify and reach you.
            The most effective email signatures share a consistent structure across the team. Recommended fields,
            in order of importance:
          </p>
          <ul className="space-y-3 text-gray-600 leading-relaxed list-disc list-inside mb-8">
            <li><strong>Full name and title.</strong> The minimum viable email signature.</li>
            <li><strong>Company name.</strong> Useful for external recipients who may not recognize your domain.</li>
            <li><strong>Primary phone number.</strong> One number, not three.</li>
            <li><strong>Website URL.</strong> Linked, not bare text.</li>
            <li><strong>Profile photo or company logo.</strong> A square headshot, or a logo, not both.</li>
            <li><strong>Social links.</strong> One to three platforms maximum, ideally professional channels only.</li>
            <li><strong>Office address.</strong> Optional. Required for some industries and regulated communications.</li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">What to Skip</h3>
          <ul className="space-y-2 text-gray-600 leading-relaxed list-disc list-inside mb-8">
            <li>Inspirational quotes.</li>
            <li>Confidentiality disclaimers longer than two lines.</li>
            <li>Multiple fonts. One font is correct.</li>
            <li>Animated GIFs. Most clients block them by default.</li>
            <li>Background images. They rarely render the same on two clients.</li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Formatting Notes</h3>
          <p className="text-gray-600 leading-relaxed">
            Every template here uses system-safe fonts, inline styles, and HTML tables for layout. This is the same
            architecture used by the major transactional email providers, and it is the only reliable way to produce
            an HTML email signature that looks consistent across desktop, web, and mobile clients.
          </p>
        </div>
      </section>

      {/* ═══ Ad ═══ */}
      <div className="bg-page-bg-alt">
        <AdBanner />
      </div>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 sm:py-24 bg-page-bg" aria-labelledby="faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 id="faq" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <dl className="space-y-8">
            <div>
              <dt className="text-lg font-semibold text-gray-900">Is this email signature generator really free?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Yes. Every template, every feature, every export format is free. No account, no trial period, no credit
                card on file, no hidden fees. The full source code is published on GitHub.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">Does it work with Gmail and Outlook?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Yes. Signatures are generated as inline HTML tables with inline CSS, the standard format for
                cross-client email rendering. Compatible with Gmail, Outlook (Web, Windows, Mac, and Mobile),
                Apple Mail, Thunderbird, Yahoo Mail, ProtonMail, Spark, Hey, and Fastmail.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">How do I add the signature to Gmail?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Copy your signature from the Create page. Open Gmail, click the gear icon, select See all settings,
                scroll to the Signature section, click Create new, paste the signature into the editor, and save.
                Assign as default for new messages and replies.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">How do I add the signature to Outlook?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                On Outlook for the web: Settings, Mail, Compose and reply, paste into the Email signature field.
                On Outlook desktop (Windows and Mac): File, Options, Mail, Signatures, New, paste into the editor.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">How do I add the signature to Apple Mail?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Open Mail, then Settings, then Signatures. Select the account, click the plus button, and paste your
                signature. Uncheck Always match my default message font to preserve formatting.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">Can I add a profile photo or company logo?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Yes. The Create page includes a photo uploader with built-in cropping. Images are hosted at a
                content-addressed URL with a secret salt, ensuring reliable cross-client rendering and
                non-guessable URLs.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">Is there a watermark or branding?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                No. No watermark, no "Sent from" footer, no "Powered by" tagline. The signature contains only the
                information you enter.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">Will the signature render on mobile devices?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Yes. Inline tables and inline CSS render correctly on Gmail iOS, Gmail Android, Apple Mail on iPhone
                and iPad, and Outlook mobile.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">Do I need an account?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                No. The application has no user accounts. Form data is stored in browser localStorage and
                never transmitted to a server.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">Can I use this for my whole team or company?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Yes. There is no per-seat pricing. Share the link with your team for individual use, or export the
                raw HTML and template it for company-wide deployment. The repository is open source under a
                permissive license.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">What email signature templates are included?</dt>
              <dd className="mt-2 text-gray-600 leading-relaxed">
                Five templates: Professional (classic corporate layout with photo and dividers), Minimal (plain text
                with a single divider), Modern (accent bar with contemporary typography), Bold (colored header bar),
                and Compact (condensed single-block format).
              </dd>
            </div>
          </dl>
          <div className="text-center mt-12">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create Your Free Email Signature
            </Link>
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
