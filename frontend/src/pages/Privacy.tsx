import { AdBanner } from '../components';
import { useSeo } from '../seo';

export default function Privacy() {
  useSeo({
    title: 'Privacy Policy | Free Signature Co',
    description: 'How Free Signature Co handles your data. No accounts, no tracking, your signature data stays in your browser. Full transparency on uploads, analytics, ads, and logs.',
    path: '/privacy',
  });

  return (
    <>
    <section className="py-16 sm:py-20 bg-page-bg">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">What we collect</h2>
            <p>Your signature data (name, title, phone, etc.) stays in your browser's localStorage. It is never sent to our servers. We do not have accounts, so we have no way to identify you.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Saved signatures</h2>
            <p>When you copy a signature, we save a copy of it to a My Signatures list in your browser's localStorage so you can find it again later. This list lives only in your browser. It is never sent to our servers, there is no account, and we have no way to see it. The moment you clear your browser cookies, history, or site data, the list is gone for good. You can also delete individual signatures from the My Signatures page at any time.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Photo uploads</h2>
            <p>If you use the upload button, the image is stored on our server at a random, non-guessable URL. We store the file and minimal metadata: content type, file size, the original filename (truncated to 255 characters), and your IP address. Your IP address is stored solely to detect and prevent upload abuse, such as a single address uploading repeatedly. All metadata is encrypted at rest via InnoDB tablespace encryption. We do not associate uploads with any user identity because we don't have user identities.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h2>
            <p>We use Google Analytics and Microsoft Clarity to understand how the site is used and to find broken things. Both are loaded only if you accept cookies via the consent banner. If you decline, no analytics scripts run.</p>
            <p className="mt-2">These are third-party services. When loaded, they collect data directly from your browser, which can include your IP address, device and browser details, and how you interact with pages. Microsoft Clarity may also record your session (clicks, scrolling, and mouse movement) for usability analysis. This data is processed by Google and Microsoft under their own privacy policies, and we do not control everything they collect.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ads</h2>
            <p>We display ads to cover hosting costs, including Google AdSense. We do not send ad networks any data ourselves, because we do not collect any user data to share. However, ad networks load their own scripts in your browser and collect data directly, which can include your IP address, device details, cookies or similar identifiers, and your browsing activity. Google and its partners use cookies to serve ads based on your prior visits to this and other websites, and may use this data for ad measurement and personalization under their own privacy policies, which we do not control. You can manage or opt out of personalized Google ads at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-blue-hover">Google Ads Settings</a>.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Server logs</h2>
            <p>Our backend logs HTTP requests: method, URL path, response status, response time, and IP address. These logs are written to disk only, not stored in a database. They are automatically rotated and deleted on a regular schedule. This is for security monitoring and debugging. Logs are not shared with third parties.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Cookies</h2>
            <p>We store a few items in your browser's localStorage (not cookies): your consent preference, your current signature form data, and the My Signatures list of signatures you have copied. Analytics services set their own cookies only when you accept them through the consent banner.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Open source</h2>
            <p>This application is fully open source. You can read every line of code on <a href="https://github.com/Carpathian-LLC/free-email-signature" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-blue-hover">GitHub</a> and verify these claims.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact</h2>
            <p>Questions? Open an issue on GitHub or email info@carpathian.ai.</p>
          </div>
        </div>
      </div>
    </section>
    <div className="bg-page-bg-alt">
      <AdBanner />
    </div>
    </>
  );
}
