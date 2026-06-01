import { Link } from 'react-router-dom';
import { AdBanner, AdSenseBanner } from '../components';
import { useSeo } from '../seo';

export default function MacSignatureGenerator() {
  useSeo({
    path: '/free-email-signature-generator-mac',
  });

  return (
    <>
      <section className="py-16 sm:py-20 bg-page-bg">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Free Email Signature Generator for Mac and Apple Mail
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Build a polished email signature for your Mac in your browser, completely free and with no
            account required. Our generator works great with Apple Mail on macOS, and the same signature
            also works in Outlook for Mac, Gmail, and any other mail client that supports HTML. Add your
            name, title, company, photo, and logo, pick a template, and copy it straight into Mail.
          </p>

          <div className="mb-8">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free Mac signature
            </Link>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Why use our generator on a Mac</h2>
              <ul className="space-y-3 list-disc list-inside">
                <li><strong>Free with no watermark.</strong> Every template and feature is free, with nothing stamped on your signature.</li>
                <li><strong>No account, no install.</strong> It runs in Safari, Chrome, or any browser on macOS. There is nothing to download.</li>
                <li><strong>Works in Apple Mail.</strong> The signature is standard HTML that pastes cleanly into Apple Mail, including your photo and links.</li>
                <li><strong>Mac-friendly templates.</strong> Clean, modern layouts that look right on a Retina display and in dark mode.</li>
              </ul>
            </div>

            <AdSenseBanner />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Free email signature templates for Mac Mail</h2>
              <p>
                Start from a ready-made template instead of a blank page. Browse the{' '}
                <Link to="/templates" className="text-brand-blue hover:text-brand-blue-hover">template gallery</Link>,
                pick a layout, then customize the colors, fonts, photo, and details to match your brand. Each
                template is built to render correctly in Apple Mail and other clients on macOS.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How to add your signature to Apple Mail</h2>
              <p>
                Once you have built and copied your signature, follow our{' '}
                <Link to="/how-to-add-email-signature-apple-mail" className="text-brand-blue hover:text-brand-blue-hover">
                  step-by-step Apple Mail guide
                </Link>{' '}
                to install it. It covers the one setting in Apple Mail you need to change so your photo and
                formatting show up correctly.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              to="/create"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free Mac signature
            </Link>
          </div>
        </div>
      </section>
      <div className="bg-page-bg-alt">
        <AdBanner />
      </div>
    </>
  );
}
