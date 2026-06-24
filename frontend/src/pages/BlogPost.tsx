import { Link, useParams } from 'react-router-dom';
import { getPost, relatedPosts } from '../blog';
import { AdSenseBanner } from '../components';
import { useSeo } from '../seo';

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || '';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const post = getPost(slug);

  useSeo({
    path: `/blog/${slug}`,
    title: post ? post.title : 'Article Not Found | Free Signature Co.',
    description: post?.description,
    noindex: !post,
  });

  if (!post) {
    return (
      <section className="py-24 bg-page-bg">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article not found</h1>
          <p className="text-gray-600 mb-8">
            The article you are looking for does not exist or may have moved.
          </p>
          <Link
            to="/blog"
            className="bg-brand-blue hover:bg-brand-blue-hover text-white rounded-md px-6 py-3 font-semibold transition-colors inline-block"
          >
            Back to the blog
          </Link>
        </div>
      </section>
    );
  }

  const related = relatedPosts(post.slug, 3);
  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image ? [post.image] : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Free Signature Co.', url: 'https://carpathian.ai' },
    publisher: {
      '@type': 'Organization',
      name: 'Free Signature Co.',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/MyFreeEmailSignature_logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="bg-page-bg">
        {/* ═══ Header ═══ */}
        <header className="pt-12 sm:pt-16 pb-8 bg-page-bg-alt border-b border-gray-100">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              {post.title}
            </h1>
            <div className="mt-5 text-sm text-gray-500">
              By {post.author} &middot; {formatDate(post.date)} &middot; {post.readingTime} min read
            </div>
          </div>
        </header>

        {/* ═══ Cover image ═══ */}
        {post.image && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-px">
            <figure className="mt-8">
              <img
                src={post.image}
                alt={post.imageAlt}
                loading="eager"
                className="w-full rounded-xl border border-gray-200 object-cover"
                style={{ maxHeight: 460 }}
              />
              {post.imageCredit && (
                <figcaption className="mt-2 text-xs text-gray-400 text-center">
                  Photo by{' '}
                  {post.imageCreditUrl ? (
                    <a href={post.imageCreditUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 underline">
                      {post.imageCredit}
                    </a>
                  ) : (
                    post.imageCredit
                  )}{' '}
                  on Unsplash
                </figcaption>
              )}
            </figure>
          </div>
        )}

        {/* ═══ Body ═══ */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }} />

          <div className="mt-12 bg-brand-blue-dark rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Put it into practice</h2>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              A clean email signature makes every message you send look professional. Build one free in under a minute,
              no account required.
            </p>
            <Link
              to="/create"
              className="bg-white hover:bg-gray-100 text-brand-blue-dark rounded-md px-6 py-3 font-semibold transition-colors inline-block"
            >
              Create your free signature
            </Link>
          </div>
        </div>

        {/* ═══ Ad ═══ */}
        <div className="bg-page-bg-alt">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <AdSenseBanner />
          </div>
        </div>

        {/* ═══ Related ═══ */}
        {related.length > 0 && (
          <section className="py-16 bg-page-bg-alt">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Keep reading</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map(r => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group flex flex-col bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-900/5 shadow-lg overflow-hidden hover:border-brand-blue hover:ring-brand-blue/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    {r.image && (
                      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                        <img src={r.image} alt={r.imageAlt} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-blue transition-colors leading-snug">
                        {r.title}
                      </h3>
                      <div className="mt-3 text-xs text-gray-400">{r.readingTime} min read</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
