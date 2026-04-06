import { useEffect } from 'react';
import { AdBanner } from '../components';

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy Policy. My Free Email Signature Generator.';
  }, []);

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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Photo uploads</h2>
            <p>If you use the upload button, the image is stored on our server at a random, non-guessable URL. We store the file and minimal metadata: content type, file size, the original filename (truncated to 255 characters), and your IP address. Your IP address is stored solely to detect and prevent upload abuse, such as a single address uploading repeatedly. All metadata is encrypted at rest via InnoDB tablespace encryption. We do not associate uploads with any user identity because we don't have user identities.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h2>
            <p>We use Google Analytics and Microsoft Clarity to understand how the site is used and to find broken things. Both are loaded only if you accept cookies via the consent banner. If you decline, no analytics scripts run.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ads</h2>
            <p>We display banner and native ads to cover hosting costs. Ad networks may set their own cookies. We do not share any data with ad networks because we do not collect any user data to share.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Server logs</h2>
            <p>Our backend logs HTTP requests: method, URL path, response status, response time, and IP address. These logs are written to disk only, not stored in a database. They are automatically rotated and deleted on a regular schedule. This is for security monitoring and debugging. Logs are not shared with third parties.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Cookies</h2>
            <p>We store two items in localStorage (not cookies): your consent preference and your signature form data. Analytics services set their own cookies only when you accept them through the consent banner.</p>
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
