import { Link } from 'react-router-dom';
import { AdSenseBanner, PageHero } from '../components';
import { useSeo } from '../seo';

export default function GmailSignatureGenerator() {
  useSeo({
    path: '/free-gmail-signature-generator',
  });

  return (
    <>
      <PageHero
        title="Free Gmail Signature Generator"
        image="https://images.unsplash.com/photo-1620287341401-e2945a4b9daa?w=1600&q=80&auto=format&fit=crop"
      />
      <section className="py-16 sm:py-20 bg-page-bg-alt">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 lg:p-10">
          <p className="text-gray-600 leading-relaxed mb-8">
            Make a professional Gmail email signature for free, right in your browser. There is no account to
            create and no watermark on the result. Choose a template, add your name, title, company, photo, and
            logo, then copy it and paste it into your Gmail settings. The same signature also works in Outlook,
            Apple Mail, and any client that supports HTML.
          </p>

          <div className="mb-8">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free Gmail signature
            </Link>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Why use our Gmail signature generator</h2>
              <ul className="space-y-3 list-disc list-inside">
                <li><strong>Free with no watermark.</strong> Every template and feature is free, with nothing stamped on your signature.</li>
                <li><strong>No account, no install.</strong> It runs in any browser. Build, copy, paste, done.</li>
                <li><strong>Pastes cleanly into Gmail.</strong> Use Copy as rich text and your photo, links, and layout carry straight into the Gmail signature editor.</li>
                <li><strong>Modern templates.</strong> Clean, professional layouts that render correctly in Gmail on the web.</li>
              </ul>
            </div>

            <AdSenseBanner />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Free email signature templates for Gmail</h2>
              <p>
                Skip the blank page and start from a template. Browse the{' '}
                <Link to="/templates" className="text-brand-blue hover:text-brand-blue-hover">template gallery</Link>,
                choose a layout, then adjust the colors, fonts, photo, and details. Each template is built to
                render correctly in the Gmail web signature editor.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How to add your signature to Gmail</h2>
              <p>
                After you build and copy your signature, follow our{' '}
                <Link to="/how-to-add-email-signature-gmail" className="text-brand-blue hover:text-brand-blue-hover">
                  step-by-step Gmail guide
                </Link>{' '}
                to install it. It walks through Gmail on the web and explains how the Gmail mobile app handles
                signatures differently.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free Gmail signature
            </Link>
          </div>
          </div>
        </div>
      </section>
    </>
  );
}
