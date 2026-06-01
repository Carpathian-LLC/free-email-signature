import { Link } from 'react-router-dom';
import { AdBanner } from '../components';
import { useSeo } from '../seo';

export default function SignatureBestPractices() {
  useSeo({
    path: '/email-signature-best-practices',
  });

  return (
    <>
      <section className="py-16 sm:py-20 bg-page-bg">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Email Signature Best Practices and Examples
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            A good email signature gives the recipient what they need to identify and reach you, and nothing more.
            These email signature best practices keep yours clean, professional, and reliable across desktop, web,
            and mobile clients. The examples below are evergreen, so they apply whether you use Gmail, Outlook,
            or Apple Mail.
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">What to include</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Full name and job title.</strong> The minimum a signature needs.</li>
                <li><strong>Company name.</strong> Helpful for recipients who do not recognize your domain.</li>
                <li><strong>One phone number.</strong> Your primary line, not three options.</li>
                <li><strong>Website.</strong> Linked text, not a bare URL.</li>
                <li><strong>A photo or a logo.</strong> A square headshot or a company logo, not both.</li>
                <li><strong>One to three social links.</strong> Professional channels only.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">What to leave out</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Inspirational quotes.</li>
                <li>Long confidentiality disclaimers (keep to two lines if your industry requires one).</li>
                <li>Multiple fonts. Pick one and stick with it.</li>
                <li>Animated GIFs. Most clients block them by default.</li>
                <li>Background images. They rarely render the same way twice.</li>
              </ul>
            </div>

            <AdBanner />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Sizing and format tips</h2>
              <p>
                Keep the signature compact. Aim for roughly four to seven lines of text and a single image. Use a
                web-safe font and a font size between 12 and 14 pixels so it reads well without dominating the
                message. Build the layout with HTML tables and inline styles, which is the only reliable way to get
                consistent rendering across email clients. Host images at a stable URL rather than embedding large
                files, and keep any photo or logo under about 200 pixels wide so it loads quickly and does not
                overwhelm the message on small screens.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Keep it accessible and lightweight</h2>
              <p>
                Add descriptive alt text to your image so screen readers and clients that block images still convey
                who you are. Make sure text has enough contrast against the background, and never put important
                information (your name, phone, or email) inside an image, where it cannot be read, copied, or
                searched. A lightweight signature also loads faster and is less likely to be clipped by Gmail's
                message size limit.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Mobile considerations</h2>
              <p>
                A large share of email is read on phones, so test how your signature looks on a small screen. Some
                mobile apps, including the Gmail app and Mail on iPhone, support only a plain-text signature, so keep
                a short plain-text version for those. For everything else, a single-column layout with a modest image
                and tappable links works best, since wide multi-column signatures often get squeezed or cut off on
                narrow screens.
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
      </section>
      <div className="bg-page-bg-alt">
        <AdBanner />
      </div>
    </>
  );
}
