import { useState, useEffect } from 'react';

const CONSENT_KEY = 'cookieConsent';
const PREFS_KEY = 'cookiePreferences';

interface Service {
  id: string;
  name: string;
  description: string;
  required?: boolean;
}

const SERVICES: Service[] = [
  {
    id: 'analytics',
    name: 'Google Analytics',
    description: 'Helps us understand which pages are useful and how visitors navigate the site.',
  },
  {
    id: 'clarity',
    name: 'Microsoft Clarity',
    description: 'Shows us broken buttons and navigation issues so we can fix them.',
  },
];

function loadPrefs(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  const defaults: Record<string, boolean> = {};
  SERVICES.forEach(s => { defaults[s.id] = true; });
  return defaults;
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(loadPrefs);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    const all: Record<string, boolean> = {};
    SERVICES.forEach(s => { all[s.id] = true; });
    localStorage.setItem(CONSENT_KEY, 'accepted');
    localStorage.setItem(PREFS_KEY, JSON.stringify(all));
    setVisible(false);
    window.location.reload();
  }

  function saveCustom() {
    localStorage.setItem(CONSENT_KEY, 'custom');
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setVisible(false);
    window.location.reload();
  }

  function decline() {
    const none: Record<string, boolean> = {};
    SERVICES.forEach(s => { none[s.id] = false; });
    localStorage.setItem(CONSENT_KEY, 'declined');
    localStorage.setItem(PREFS_KEY, JSON.stringify(none));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {showPrefs && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={() => setShowPrefs(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
            <p className="text-sm text-gray-500">Choose which services you want to allow.</p>
            {SERVICES.map(s => (
              <label key={s.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={s.required || prefs[s.id] || false}
                  disabled={s.required}
                  onChange={e => setPrefs(p => ({ ...p, [s.id]: e.target.checked }))}
                  className="mt-1 accent-brand-blue"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {s.name}
                    {s.required && <span className="ml-2 text-xs text-gray-400">Required</span>}
                  </div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </div>
              </label>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={saveCustom} className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors">
                Save Preferences
              </button>
              <button onClick={() => setShowPrefs(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm text-gray-600 flex-1">
            We use cookies for analytics to improve the site. No personal data is collected. Read our{' '}
            <a href="/privacy" className="text-brand-blue hover:text-brand-blue-hover font-medium">Privacy Policy</a>.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={accept} className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors">
              Accept
            </button>
            <button onClick={() => setShowPrefs(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm font-semibold transition-colors">
              Customize
            </button>
            <button onClick={decline} className="text-sm text-gray-400 hover:text-gray-600 px-2 transition-colors">
              Decline
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function getConsentFor(serviceId: string): boolean {
  const consent = localStorage.getItem(CONSENT_KEY);
  if (!consent) return false;
  if (consent === 'declined') return false;
  if (consent === 'accepted') return true;
  try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    return !!prefs[serviceId];
  } catch { return false; }
}
