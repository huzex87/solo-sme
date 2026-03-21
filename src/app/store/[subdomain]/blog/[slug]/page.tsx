import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string, slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
        title: `${title} | Blog`,
        description: `Read the latest insights on ${title} from our boutique.`,
        openGraph: {
            title,
            type: 'article',
            publishedTime: new Date().toISOString(),
        }
    };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ subdomain: string, slug: string }> }) {
    const { subdomain, slug } = await params;

    // In production, this would fetch from Supabase
    const article = {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        content: `
            <p>The journey of excellence begins with a commitment to high standards. In this article, we'll explore why ${slug.replace(/-/g, ' ')} is the standard for modern quality.</p>
            <p>Quality is not just a feature, it's a philosophy. It's about the attention to detail that only professional craftsmen can provide.</p>
            <h2>The Core Principles</h2>
            <p>Authenticity is the foundation. When we talk about ${slug.replace(/-/g, ' ')}, we are discussing the intersection of heritage and innovation.</p>
            <p>Innovation is about taking the best of the past and pushing it into the future. It&apos;s about being proactive, not reactive.</p>
            <blockquote>"Excellence is not an act, but a habit." - Aristotle</blockquote>
            <p>We invite you to explore our latest collections and see how we&apos;re redefining quality for the modern SME.</p>
            <p>Join the movement today.</p>
        `,
        date: 'Oct 24, 2025',
        author: 'AI Marketing Assistant',
        category: 'Lifestyle'
    };

    return (
        <article style={{ minHeight: '100vh', background: 'radial-gradient(circle at bottom left, rgba(124, 77, 255, 0.03), transparent 40%)' }}>
            {/* Hero Section */}
            <header style={{ padding: '8rem 2rem 4rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <Link
                    href={`/store/${subdomain}/blog`}
                    style={{
                        textDecoration: 'none',
                        color: 'var(--text-tertiary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '3rem',
                        fontWeight: 600,
                        fontSize: '13px',
                        transition: 'color 0.3s ease'
                    }}
                    className="hover-primary"
                >
                    <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Blog
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                    <span className="badge badge-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '11px', letterSpacing: '1px' }}>{article.category}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{article.date}</span>
                    <span style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>5 min read</span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    fontWeight: 950,
                    lineHeight: 1,
                    marginBottom: '3rem',
                    letterSpacing: '-0.05em',
                    color: 'var(--text-primary)'
                }}>
                    {article.title}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '3rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AI</div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>{article.author}</div>
                        <div style={{ fontSize: '12px', opacity: 0.5 }}>Curator & SME Expert</div>
                    </div>
                </div>
            </header>

            {/* Article Content */}
            <div className="content-container" style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem 8rem' }}>
                <div
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    style={{
                        lineHeight: 1.8,
                        fontSize: '1.25rem',
                        color: 'rgba(255,255,255,0.85)',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                    className="prose-crystalline"
                />

                {/* Interaction Footer */}
                <footer style={{
                    marginTop: '6rem',
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '2.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>What&apos;s your stance on this?</h3>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-secondary">Share Insight</button>
                        <button className="btn btn-primary" onClick={() => window.open(`https://wa.me/?text=Check out this article: ${article.title}`, '_blank')}>WhatsApp Share</button>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', marginTop: '1rem' }}>
                        <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '1.5rem' }}>Liked this perspective? Explore how we apply these principles to our products.</p>
                        <Link href={`/store/${subdomain}`} className="btn btn-primary btn-block" style={{ background: 'var(--text-primary)', color: 'black' }}>
                            Visit Storefront
                        </Link>
                    </div>
                </footer>
            </div>
        </article>
    );
}
