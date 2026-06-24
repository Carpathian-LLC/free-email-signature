import { Link } from 'react-router-dom';
import { PageHero } from '../components';
import { useSeo } from '../seo';
import { SOCIAL_PLATFORMS } from '../socialIcons';

// Optional donation link; hidden when VITE_DONATE_URL is unset (see App.tsx).
const DONATE_URL = import.meta.env.VITE_DONATE_URL || '';

const SAMUEL_SOCIALS: { id: string; url: string }[] = [
  { id: 'linkedin', url: 'https://linkedin.com/in/samuel-malkasian' },
  { id: 'x', url: 'https://x.com/samuelmalkasian' },
];

const CARPATHIAN_SOCIALS: { id: string; url: string }[] = [
  { id: 'linkedin', url: 'https://www.linkedin.com/company/carpathianai/' },
  { id: 'x', url: 'https://x.com/carpathianai' },
  { id: 'instagram', url: 'https://instagram.com/carpathianai' },
  { id: 'youtube', url: 'https://www.youtube.com/@Carpathianai' },
];


function SocialIcon({ id, url, label }: { id: string; url: string; label: string }) {
  const platform = SOCIAL_PLATFORMS.find(p => p.id === id);
  if (!platform) return null;
  const isPlaceholder = url === '#';
  return (
    <a
      href={url}
      target={isPlaceholder ? undefined : '_blank'}
      rel={isPlaceholder ? undefined : 'noopener noreferrer'}
      aria-label={`${label} on ${platform.name}`}
      className="text-gray-400 hover:text-brand-blue transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={platform.path} />
      </svg>
    </a>
  );
}

export default function About() {
  useSeo({
    path: '/about',
  });

  return (
    <>
    <PageHero
      title="Why does this exist?"
      subtitle="Because you shouldn't need a subscription to make an email signature."
      image="/email-hero-3-web.jpeg"
    />
    <article className="py-16 sm:py-20 bg-page-bg-alt">
      <div className="mx-auto max-w-3xl lg:max-w-5xl xl:max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg p-6 sm:p-8 lg:p-10 xl:p-12">
        <div className="space-y-10 text-gray-600 leading-relaxed">

          <section aria-labelledby="the-problem">
            <h2 id="the-problem" className="text-xl font-semibold text-gray-900 mb-3">The problem</h2>
            <p>
              I needed an email signature. That's it. A one-time task that takes five minutes. So I searched for a
              generator and every single one wanted me to create an account, hand over my email, or pay a monthly fee.
              A dollar a month, five dollars a month. It doesn't matter. It's the principle. I don't want another
              subscription. Nobody does. You make a signature once, maybe twice if you change jobs, and you're done.
              Why would anyone pay <em>monthly</em> for that?
            </p>
          </section>

          <section aria-labelledby="the-solution">
            <h2 id="the-solution" className="text-xl font-semibold text-gray-900 mb-3">So I built one</h2>
            <p>
              I made this tool for myself and then realized there are a lot of people like me, people who are
              tired of living in an oversold world where <em>everything</em> is a subscription. Streaming services,
              productivity apps, note-taking tools, PDF editors, weather apps. At some point we went from buying
              software to renting permission to use it. This is one small thing that doesn't need to be that way.
            </p>
            <p className="mt-4">
              Fill in your details, pick a template, copy the HTML, paste it into your email client. Done. No account,
              no paywall, no "upgrade to unlock" nonsense. Every feature is available to everyone.
            </p>
          </section>

          <section aria-labelledby="enshittification">
            <h2 id="enshittification" className="text-xl font-semibold text-gray-900 mb-3">The enshittification of the internet</h2>
            <p>
              Writer Cory Doctorow coined the term <em>enshittification</em> to describe what happens when platforms
              prioritize extracting value over providing it. First they're good to users, then they abuse users to serve
              business customers, then they abuse everyone to claw back value for themselves. It's the lifecycle of
              every platform that forgets why people showed up in the first place.
            </p>
            <p className="mt-4">
              The web used to be full of people making things because making things was cool. Personal sites, weird
              tools, hobbyist forums, software shared because someone thought it might help somebody else. That energy
              still exists, but it's buried under a mountain of SEO spam, paywalls, algorithmic feeds, and AI-generated
              slop designed to farm clicks instead of solve problems.
            </p>
            <p className="mt-4">
              AI is a genuinely powerful technology. But it doesn't need to be shoved into every search result, every
              product page, every creative tool. Sometimes you just need a straightforward answer from a straightforward
              website built by a person who actually cared about the problem.
            </p>
          </section>

          <section aria-labelledby="old-internet">
            <h2 id="old-internet" className="text-xl font-semibold text-gray-900 mb-3">I miss the old internet</h2>
            <p>
              I miss when people built things because they <em>liked</em> building things. Not because everything has
              to be a hustle, a side project with a monetization strategy, or a SaaS with a pricing page. Some of us
              are just creatives who like making stuff. That's the whole motivation behind Carpathian's work.
            </p>
            <blockquote className="border-l-4 border-brand-blue pl-4 my-6 text-gray-700 italic">
              Open technology, limitless possibilities.
            </blockquote>
            <p>
              That's not a marketing line. It's the reason we write code and give it away. Software should make
              people's lives easier, not drain their wallets one micro-subscription at a time.
            </p>
          </section>

          <section aria-labelledby="free-forever">
            <h2 id="free-forever" className="text-xl font-semibold text-gray-900 mb-3">Free. Always. No watermarks.</h2>
            <p>
              This tool is free and it will stay free. No watermarks, no "Powered by" branding forced into your
              signature, no fine print. Your signature is yours. Share it, screenshot it, put it on a billboard.
              We genuinely do not care. We don't need your signature to advertise for us.
            </p>
            <p className="mt-4">
              Carpathian hosts it, and while we do run ads, the servers physically cost money, so the ads help
              offset the cost of development, hosting, and keeping the lights on. We're not building a funnel.
              We're covering our bills so we can keep making things.
            </p>
          </section>

          <section aria-labelledby="support">
            <h2 id="support" className="text-xl font-semibold text-gray-900 mb-3">Want to support the project?</h2>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Share it on social media or write about it online. Word of mouth is everything.</li>
              {DONATE_URL && (
                <li>
                  <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-blue-hover font-medium">
                    Buy me a coffee
                  </a>{' '}
                  if you're feeling generous. Not required, not expected, but appreciated.
                </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="contribute">
            <h2 id="contribute" className="text-xl font-semibold text-gray-900 mb-3">Build with us</h2>
            <p>
              If you write code and want to contribute to software that actually helps people, we'd love
              to hear from you. Reach out at{' '}
              <a href="mailto:info@carpathian.ai" className="text-brand-blue hover:text-brand-blue-hover font-medium">
                info@carpathian.ai
              </a>.
            </p>
            <p className="mt-4">
              Challenge yourself to make the world a little better by sharing software that betters humanity and makes
              people's lives easier. That's all any of us can do.
            </p>
          </section>

          {/* ── Author bio ──────────────────────────────────────── */}
          <section aria-labelledby="author-bio" className="pt-10 border-t border-gray-200">
            <h2 id="author-bio" className="sr-only">About the author</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <img
                  src="https://carpathian.ai/profile-images/samuel-malkasian.jpeg"
                  alt="Samuel Malkasian"
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">Samuel Malkasian</h3>
                  <p className="text-sm text-gray-500">Founder, Carpathian AI</p>
                </div>
                <div className="flex gap-3 items-center flex-shrink-0">
                  {SAMUEL_SOCIALS.map(s => (
                    <SocialIcon key={s.id} id={s.id} url={s.url} label="Samuel Malkasian" />
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Follow Carpathian</span>
                <div className="flex gap-4 items-center">
                  {CARPATHIAN_SOCIALS.map(s => (
                    <SocialIcon key={s.id} id={s.id} url={s.url} label="Carpathian" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-gray-200">
            <Link to="/create" className="inline-block bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md px-6 py-3 font-semibold transition-colors">
              Create your signature
            </Link>
          </div>

        </div>
        </div>
      </div>
    </article>
    </>
  );
}
