import { Link } from 'react-router-dom';
import { AdSenseBanner, PageHero } from '../components';
import { useSeo } from '../seo';

export default function GmailSignature() {
  useSeo({
    path: '/how-to-add-email-signature-gmail',
  });

  return (
    <>
      <PageHero
        title="How to Add an Email Signature in Gmail (Free, 2026 Guide)"
        image="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=1600&q=80&auto=format&fit=crop"
      />
      <section className="py-16 sm:py-20 bg-page-bg-alt">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 lg:p-10">
          <p className="text-gray-600 leading-relaxed mb-8">
            Adding an email signature in Gmail takes about a minute. This guide covers Gmail on the web,
            where you can paste a fully formatted HTML signature, and the Gmail mobile app, which uses a
            separate plain-text signature. Build your signature first with our free generator, then follow
            the steps below to install it.
          </p>

          <div className="mb-8">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free signature
            </Link>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Add a signature in Gmail on the web</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Build and copy your signature on the <Link to="/create" className="text-brand-blue hover:text-brand-blue-hover">Create page</Link> using the Copy as rich text button.</li>
                <li>Open Gmail in your browser and click the gear icon in the top right.</li>
                <li>Click <strong>See all settings</strong>.</li>
                <li>On the <strong>General</strong> tab, scroll down to the <strong>Signature</strong> section.</li>
                <li>Click <strong>Create new</strong>, give the signature a name, and click Create.</li>
                <li>Click into the signature editor box and paste (Ctrl+V or Cmd+V). The formatting, photo, and links carry over.</li>
                <li>Under <strong>Signature defaults</strong>, choose this signature for new emails and, if you want, for replies and forwards.</li>
                <li>Scroll to the bottom of the page and click <strong>Save Changes</strong>.</li>
              </ol>
              <p className="mt-3">
                Tip: if the image does not appear, make sure you used Copy as rich text rather than copying raw HTML
                into the editor.
              </p>
            </div>

            <AdSenseBanner />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">A note on the Gmail mobile app</h2>
              <p>
                The Gmail app on iPhone and Android uses its own signature setting, and it is plain text only,
                so it cannot show a photo or formatted layout. To set it, open the Gmail app, tap the menu, go to
                <strong> Settings</strong>, choose your account, and tap <strong>Mobile Signature</strong>. Many
                people leave the mobile signature as a short plain-text line and rely on the full HTML signature
                on the web and desktop.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free signature
            </Link>
          </div>
          </div>
        </div>
      </section>
    </>
  );
}
