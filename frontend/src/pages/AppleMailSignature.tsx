import { Link } from 'react-router-dom';
import { AdSenseBanner, PageHero } from '../components';
import { useSeo } from '../seo';

export default function AppleMailSignature() {
  useSeo({
    path: '/how-to-add-email-signature-apple-mail',
  });

  return (
    <>
      <PageHero
        title="How to Add an Email Signature in Apple Mail"
        image="https://images.unsplash.com/photo-1543145223-1f9043516739?w=1600&q=80&auto=format&fit=crop"
      />
      <section className="py-16 sm:py-20 bg-page-bg-alt">
        <div className="mx-auto max-w-3xl lg:max-w-5xl xl:max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 sm:p-8 lg:p-10 xl:p-12">
          <p className="text-gray-600 leading-relaxed mb-8">
            Apple Mail on macOS supports a full HTML email signature with a photo and formatting, while the
            Mail app on iPhone and iPad uses a plain-text signature only. This guide covers both. Build your
            signature first with our free generator, then follow the steps for your device.
          </p>

          <div className="mb-8">
            <Link
              to="/create"
              className="bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free signature
            </Link>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Apple Mail on macOS</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Build and copy your signature on the <Link to="/create" className="text-brand-blue hover:text-brand-blue-hover">Create page</Link> using the Copy as rich text button.</li>
                <li>Open the <strong>Mail</strong> app, then in the menu bar click <strong>Mail</strong>, then <strong>Settings</strong> (older versions call this Preferences).</li>
                <li>Click the <strong>Signatures</strong> tab.</li>
                <li>In the left column, select the email account the signature belongs to.</li>
                <li>Click the <strong>plus button</strong> below the middle column to create a new signature and give it a name.</li>
                <li>Click into the right-hand preview box, select any placeholder text, and paste your signature (Cmd+V).</li>
                <li>Uncheck <strong>Always match my default message font</strong> so the pasted formatting is preserved.</li>
                <li>Use the <strong>Choose Signature</strong> menu at the bottom to assign it to the account, then close the window.</li>
              </ol>
            </div>

            <AdSenseBanner />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Mail on iPhone and iPad</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Open the <strong>Settings</strong> app on your device.</li>
                <li>Scroll down and tap <strong>Mail</strong>.</li>
                <li>Tap <strong>Signature</strong>.</li>
                <li>Type your signature, or choose Per Account to set a different signature for each mailbox.</li>
              </ol>
              <p className="mt-3">
                Note: iOS Mail signatures are plain text only. They cannot include a photo, links, or formatting,
                so a short typed signature is the practical option on iPhone and iPad. For the full HTML signature
                with a photo and links, use Apple Mail on macOS.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              to="/create"
              className="bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
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
