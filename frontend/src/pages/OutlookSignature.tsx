import { Link } from 'react-router-dom';
import { PageHero } from '../components';
import { useSeo } from '../seo';

export default function OutlookSignature() {
  useSeo({
    path: '/how-to-add-email-signature-outlook',
  });

  return (
    <>
      <PageHero
        title="How to Add an Email Signature in Outlook"
        image="https://images.unsplash.com/photo-1602016736566-7ed6a58894bd?w=1600&q=80&auto=format&fit=crop"
      />
      <section className="py-16 sm:py-20 bg-page-bg-alt">
        <div className="mx-auto max-w-3xl lg:max-w-5xl xl:max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 sm:p-8 lg:p-10 xl:p-12">
          <p className="text-gray-600 leading-relaxed mb-8">
            Outlook comes in several versions, and the signature setting lives in a different place in each one.
            This guide covers new Outlook and Outlook on the web, which share the same settings, and classic
            Outlook desktop for Windows. Build your signature first with our free generator, then follow the
            steps for your version.
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">New Outlook and Outlook on the web</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Build and copy your signature on the <Link to="/create" className="text-brand-blue hover:text-brand-blue-hover">Create page</Link> using the Copy as rich text button.</li>
                <li>Open Outlook and click the <strong>Settings</strong> gear in the top right.</li>
                <li>Go to <strong>Account</strong>, then <strong>Signatures</strong> (in some builds this is under Mail, then Compose and reply).</li>
                <li>Click <strong>New signature</strong> and give it a name.</li>
                <li>Click into the editing box and paste (Ctrl+V or Cmd+V). The photo, formatting, and links carry over.</li>
                <li>Under the default signature options, select this signature for new messages and for replies and forwards if you want it everywhere.</li>
                <li>Click <strong>Save</strong>.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Classic Outlook desktop (Windows)</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Copy your signature from the Create page using Copy as rich text.</li>
                <li>In Outlook, click <strong>File</strong>, then <strong>Options</strong>.</li>
                <li>Select <strong>Mail</strong> in the left panel, then click the <strong>Signatures</strong> button.</li>
                <li>Click <strong>New</strong>, name the signature, and click OK.</li>
                <li>Click into the <strong>Edit signature</strong> box and paste your signature.</li>
                <li>On the right, set this signature as the default for <strong>New messages</strong> and <strong>Replies/forwards</strong>.</li>
                <li>Click <strong>OK</strong> to save.</li>
              </ol>
              <p className="mt-3">
                Tip: if pasting strips the image, save the signature, then close and reopen the Signatures window to
                confirm it rendered. Hosted images (which our generator uses) are more reliable in Outlook than
                pasted local files.
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
