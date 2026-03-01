import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string, slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
        title: `${title} | Journal`,
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
            <p>Innovation is about taking the best of the past and pushing it into the future. It's about being proactive, not reactive.</p>
            <blockquote>"Excellence is not an act, but a habit." - Aristotle</blockquote>
            <p>We invite you to explore our latest collections and see how we're redefining quality for the modern SME.</p>
        `,
        date: 'Oct 24, 2025',
        author: 'AI Marketing Assistant',
        category: 'Lifestyle'
    };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Link href={`/store/${subdomain}/blog`} style={{ textDecoration: 'none', color: 'var(--accent-primary)', display: 'block', marginBottom: '2rem', fontWeight: 700 }}>
                ← Back to Journal
            </Link>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="badge badge-primary">{article.category}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{article.date}</span>
                <span style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>By {article.author}</span>
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2.5rem' }}>{article.title}</h1>

            <div dangerouslySetInnerHTML={{ __html: article.content }} style={{ lineHeight: 1.8, fontSize: '18px', color: 'var(--text-secondary)' }} />

            <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-ghost btn-sm">Share on X</button>
                    <button className="btn btn-ghost btn-sm">Share on WhatsApp</button>
                </div>
                <Link href={`/store/${subdomain}`} className="btn btn-primary">Shop Related Products</Link>
            </div>
        </div>
    );
}
