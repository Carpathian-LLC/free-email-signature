import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found. My Free Email Signature Generator.';
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-page-bg">
      <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
        <p className="text-6xl font-bold text-brand-blue mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/"
            className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/create"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-6 py-3 font-semibold transition-colors"
          >
            Create a Signature
          </Link>
        </div>
      </div>
    </section>
  );
}
