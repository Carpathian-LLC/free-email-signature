import { Link } from 'react-router-dom';
import { templates, SAMPLE_DATA } from '../templates';
import { StyleOptions } from '../types';
import { useSeo } from '../seo';

const PREVIEW_STYLE: StyleOptions = { accentColor: '#1B8FF2', separatorColor: '#e5e7eb', iconColor: '#6b7280', addressTwoLines: false };
import { AdSenseBanner, ScaledPreview } from '../components';

export default function Home() {
  useSeo({
    path: '/',
  });

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="relative py-12 sm:py-16 bg-brand-blue-dark border-b border-black/20 overflow-hidden">
        <img
          src="/email-hero-1-web.jpeg"
          alt="Free email signature generator for Gmail, Outlook, and Apple Mail"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-blue-dark/85" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl xl:text-6xl">
            <span className="text-brand-pink">Free Email Signature</span> Generator
          </h1>
          <p className="mt-6 leading-8 text-white max-w-2xl mx-auto">
            A fast, browser-based HTML email signature generator. Ten professional templates, photo and logo upload,
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
              className="bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md px-6 py-3 font-semibold transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Template Showcase ═══ */}
      <section className="py-20 sm:py-24 bg-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Email Signature Templates</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Ten professional HTML email signature templates. Each template is built with inline tables and inline CSS
              for predictable rendering in Gmail, Outlook, Apple Mail, and Thunderbird. Click any template to start building.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(t => (
              <Link
                key={t.id}
                to={`/create?template=${t.id}`}
                className="group bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 hover:border-brand-pink hover:ring-brand-pink/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.name} Email Signature Template</h3>
                <p className="text-sm text-gray-500 mb-4">{t.description}</p>
                <ScaledPreview
                  html={t.build(SAMPLE_DATA, PREVIEW_STYLE)}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-hidden"
                  style={{ height: 150 }}
                  maxScale={0.85}
                />
                <p className="mt-4 text-sm font-medium text-brand-blue group-hover:text-brand-blue-hover transition-colors">
                  Use this template &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="py-20 sm:py-24 bg-gray-100" aria-labelledby="how-it-works">
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
            <li className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <div className="text-sm font-bold text-brand-blue mb-2">Step 1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Template</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select from ten email signature templates: Professional, Minimal, Modern, Bold, Compact, Elegant, Sidebar, Stacked, Corporate, or Creative.
                Switch templates at any time. Your details carry over automatically.
              </p>
            </li>
            <li className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <div className="text-sm font-bold text-brand-blue mb-2">Step 2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Your Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Add your name, job title, company, email, phone, website, and address. Upload a square headshot or
                company logo. Add social links for LinkedIn, X, GitHub, Instagram, and more. Form data is saved to
                browser localStorage and never sent to a server.
              </p>
            </li>
            <li className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
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
              className="bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Start Building
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Choose Your Email Client ═══ */}
      <section className="py-20 sm:py-24 bg-gray-100" aria-labelledby="by-client">
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
              className="group bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 hover:border-brand-pink hover:ring-brand-pink/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
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
              className="group bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 hover:border-brand-pink hover:ring-brand-pink/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
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
              className="group bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 hover:border-brand-pink hover:ring-brand-pink/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
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
              className="group bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 hover:border-brand-pink hover:ring-brand-pink/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
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

      {/* ═══ Email Client Compatibility ═══ */}
      <section className="py-20 sm:py-24 bg-gray-100" aria-labelledby="email-clients">
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
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">Gmail</div>
              <div className="text-xs text-gray-500 mt-1">Web, iOS, Android</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">Outlook</div>
              <div className="text-xs text-gray-500 mt-1">Windows, Mac, Web, Mobile</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">Apple Mail</div>
              <div className="text-xs text-gray-500 mt-1">macOS, iOS, iPadOS</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">Thunderbird</div>
              <div className="text-xs text-gray-500 mt-1">Windows, macOS, Linux</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">Yahoo Mail</div>
              <div className="text-xs text-gray-500 mt-1">Web, Mobile</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">ProtonMail</div>
              <div className="text-xs text-gray-500 mt-1">Web, Mobile</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">Spark</div>
              <div className="text-xs text-gray-500 mt-1">macOS, iOS, Android</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-4">
              <div className="font-semibold text-gray-900">Fastmail, Hey</div>
              <div className="text-xs text-gray-500 mt-1">Web, Mobile</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-20 sm:py-24 bg-gray-100" aria-labelledby="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="features" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Features</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              A complete email signature maker with the features other generators put behind a paywall.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Account Required</h3>
              <p className="text-sm text-gray-500">
                Signature data stored in browser localStorage. No registration, no email collection,
                no server-side user record.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Unlocked</h3>
              <p className="text-sm text-gray-500">
                All ten email signature templates, all export formats, all customization options. No premium tier.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo and Logo Upload</h3>
              <p className="text-sm text-gray-500">
                Upload a profile photo or company logo with built-in cropping. Images served from a content-addressed
                URL for reliable cross-client rendering.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Link Icons</h3>
              <p className="text-sm text-gray-500">
                Add LinkedIn, X, GitHub, Instagram, Facebook, YouTube, Mastodon, Bluesky, and more.
                Icons inherit your accent color.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Color Customization</h3>
              <p className="text-sm text-gray-500">
                Set your accent color, separator color, and icon color. Match your company branding without
                editing raw HTML.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rich Text and Raw HTML Export</h3>
              <p className="text-sm text-gray-500">
                Copy as rich text for direct paste into webmail, or export raw HTML for manual installation,
                team templating, or MDM deployment.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy by Default</h3>
              <p className="text-sm text-gray-500">
                Form data never leaves your browser. Image uploads use content-addressed hashing with a secret salt.
                No third-party tracking unless you accept the cookie banner.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
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

      {/* ═══ FAQ ═══ */}
      <section className="py-20 sm:py-24 bg-gray-100" aria-labelledby="faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 id="faq" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Is this email signature generator really free?',
                a: 'Yes. Every template, every feature, every export format is free. No account, no trial period, no credit card on file, no hidden fees.',
              },
              {
                q: 'Does it work with Gmail and Outlook?',
                a: 'Yes. Signatures are generated as inline HTML tables with inline CSS, the standard format for cross-client email rendering. Compatible with Gmail, Outlook (Web, Windows, Mac, and Mobile), Apple Mail, Thunderbird, Yahoo Mail, ProtonMail, Spark, Hey, and Fastmail.',
              },
              {
                q: 'How do I add the signature to Gmail?',
                a: 'Copy your signature from the Create page. Open Gmail, click the gear icon, select See all settings, scroll to the Signature section, click Create new, paste the signature into the editor, and save. Assign as default for new messages and replies.',
              },
              {
                q: 'How do I add the signature to Outlook?',
                a: 'On Outlook for the web: Settings, Mail, Compose and reply, paste into the Email signature field. On Outlook desktop (Windows and Mac): File, Options, Mail, Signatures, New, paste into the editor.',
              },
              {
                q: 'How do I add the signature to Apple Mail?',
                a: 'Open Mail, then Settings, then Signatures. Select the account, click the plus button, and paste your signature. Uncheck Always match my default message font to preserve formatting.',
              },
              {
                q: 'Can I add a profile photo or company logo?',
                a: 'Yes. The Create page includes a photo uploader with built-in cropping. Images are hosted at a content-addressed URL with a secret salt, ensuring reliable cross-client rendering and non-guessable URLs.',
              },
              {
                q: 'Is there a watermark or branding?',
                a: 'No. No watermark, no "Sent from" footer, no "Powered by" tagline. The signature contains only the information you enter.',
              },
              {
                q: 'Will the signature render on mobile devices?',
                a: 'Yes. Inline tables and inline CSS render correctly on Gmail iOS, Gmail Android, Apple Mail on iPhone and iPad, and Outlook mobile.',
              },
              {
                q: 'Do I need an account?',
                a: 'No. The application has no user accounts. Form data is stored in browser localStorage and never transmitted to a server.',
              },
              {
                q: 'Can I use this for my whole team or company?',
                a: 'Yes. There is no per-seat pricing. Share the link with your team for individual use, or export the raw HTML and template it for company-wide deployment.',
              },
              {
                q: 'What email signature templates are included?',
                a: 'Ten templates: Professional (classic corporate layout with photo and dividers), Minimal (plain text with a single divider), Modern (accent bar with contemporary typography), Bold (colored header bar), Compact (condensed single-block format), Elegant (centered serif layout), Sidebar (colored side panel with photo), Stacked (centered single column), Corporate (formal two-column with labeled details), and Creative (tinted card with accent top bar).',
              },
            ].map((item) => (
              <details key={item.q} className="group bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-brand-pink transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/create"
              className="bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create Your Free Email Signature
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
