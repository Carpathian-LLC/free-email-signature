import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignatureFields } from '../types';
import { AdBanner } from '../components';
import { useSeo } from '../seo';

// Keys must match the persistence keys used in Create.tsx.
const HISTORY_KEY = 'cos_saved_signatures';
const FIELDS_KEY = 'sig-gen-fields';

interface SavedSignature {
  id: string;
  label: string;
  savedAt: number;
  data: SignatureFields;
  html: string;
  photoUrl: string | null;
}

function loadHistory(): SavedSignature[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function MySignatures() {
  useSeo({
    title: 'My Signatures | Free Signature Co',
    description: 'View the email signatures you have created. Saved only in this browser using localStorage. No account, nothing stored on our servers.',
    path: '/my-signatures',
    noindex: true,
  });

  const navigate = useNavigate();
  const [items, setItems] = useState<SavedSignature[]>([]);
  const [copiedLinks, setCopiedLinks] = useState(false);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  function persist(next: SavedSignature[]) {
    setItems(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  function handleDelete(id: string) {
    persist(items.filter(s => s.id !== id));
  }

  function handleLoad(entry: SavedSignature) {
    // Write the saved data into the key Create.tsx reads on mount,
    // then navigate so the editor hydrates from it.
    try {
      localStorage.setItem(FIELDS_KEY, JSON.stringify(entry.data));
    } catch {
      /* noop */
    }
    navigate('/create');
  }

  const imageLinks = Array.from(
    new Set(items.map(s => s.photoUrl).filter((u): u is string => !!u))
  );

  async function copyImageLinks() {
    if (imageLinks.length === 0) return;
    try {
      await navigator.clipboard.writeText(imageLinks.join('\n'));
      setCopiedLinks(true);
      setTimeout(() => setCopiedLinks(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <section className="py-16 sm:py-20 bg-page-bg min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">My Signatures</h1>

          <div className="text-sm text-gray-600 leading-relaxed space-y-2 mb-8">
            <p>
              These signatures are saved only in this browser using localStorage.
              Nothing is stored on our servers, and there is no account. We have no
              way to see them.
            </p>
            <p>
              The moment you clear your browser cookies, history, or site data, this
              list is gone for good. That is by design. Your data stays with you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button
              onClick={copyImageLinks}
              disabled={imageLinks.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {imageLinks.length === 0
                ? 'No uploaded images yet'
                : copiedLinks
                  ? 'Copied!'
                  : `Copy all image links (${imageLinks.length})`}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-600 mb-4">
                You have not saved any signatures yet. They are saved automatically
                when you copy one.
              </p>
              <Link
                to="/create"
                className="inline-block bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors"
              >
                Create a Signature
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(entry => (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-gray-900 truncate">
                        {entry.label}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Saved {formatDate(entry.savedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoad(entry)}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:border-brand-blue hover:text-brand-blue transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 overflow-x-auto">
                    {/* Trusted HTML: generated by our own template builder in Create.tsx. */}
                    <div dangerouslySetInnerHTML={{ __html: entry.html }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="bg-page-bg-alt">
        <AdBanner />
      </div>
    </>
  );
}
