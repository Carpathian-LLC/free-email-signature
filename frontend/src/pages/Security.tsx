import { useEffect } from 'react';
import { AdBanner } from '../components';

export default function Security() {
  useEffect(() => {
    document.title = 'Security Policy. My Free Email Signature Generator.';
  }, []);

  return (
    <>
    <section className="py-16 sm:py-20 bg-page-bg">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Policy</h1>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Data in transit</h2>
            <p>All connections are served over HTTPS with TLS. Database connections between the application and MySQL use TLS when certificates are provided. No data is transmitted in plaintext.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Data at rest</h2>
            <p>The MySQL database uses InnoDB tablespace encryption (AES-256). Uploaded image files are stored with restrictive file permissions: directories are 700 (owner-only access), files are 600 (owner read/write only). Your signature data never leaves your browser.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Image upload security</h2>
            <p>Uploaded files go through multiple validation layers before being stored:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Magic byte validation: the first bytes of the file are checked against known image signatures (JPEG, PNG, GIF, WebP). We do not trust the Content-Type header.</li>
              <li>File size limits enforced server-side (configurable, default 5MB).</li>
              <li>Rate limiting: each IP is limited to a configurable number of uploads per minute.</li>
              <li>COS URLs use content-addressed hashes derived from the file content plus a secret salt. URLs are not guessable.</li>
              <li>Filenames are truncated and never used in file paths. All stored files use generated hex hashes.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Path traversal protection</h2>
            <p>URL path segments in image retrieval are validated to contain only lowercase hex characters. After constructing the file path, symlinks are resolved and the final path is verified to still be inside the upload directory. Any mismatch is logged and blocked.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Application security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All user input in signature HTML is escaped to prevent XSS.</li>
              <li>Database queries use parameterized statements to prevent SQL injection.</li>
              <li>Every response includes security headers: X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy.</li>
              <li>FastAPI docs, redoc, and OpenAPI endpoints are disabled in production.</li>
              <li>Unhandled exceptions return a generic error message. The actual error is logged server-side only.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration</h2>
            <p>All secrets, API keys, and configuration values are read from an environment file (keys.env) that is git-ignored. No secrets are hardcoded in source code. A keys.env.example file is provided as a template.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Open source</h2>
            <p>The full source code is public on <a href="https://github.com/Carpathian-LLC/free-email-signature" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-blue-hover">GitHub</a>. Security through obscurity is not security.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Reporting vulnerabilities</h2>
            <p>If you find a security issue, email info@carpathian.ai or open a private security advisory on GitHub. We take every report seriously.</p>
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
