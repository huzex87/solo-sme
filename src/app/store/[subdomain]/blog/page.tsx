import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BlogService, BlogPost } from '@/services/blogService';
import styles from '../store.module.css';

export default function BlogListingPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlog() {
            setLoading(true);
            // In a real multi-tenant scenario, we'd resolve tenantId from subdomain
            // For now, we use a placeholder or handle it in the service
            const posts = await BlogService.getPosts(subdomain);
            setArticles(posts);
            setLoading(false);
        }
        fetchBlog();
    }, [subdomain]);

    if (loading) return <div className={styles.loading}>Loading Journal...</div>;

    return (
        <div className={styles.categoryHeader} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>Journal</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Insights, stories, and expertise from our boutique. Carefully curated for the discerning eye.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '4rem', textAlign: 'left' }}>
                {articles.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                        <p>No articles published yet. Check back soon.</p>
                    </div>
                ) : (
                    articles.map(article => (
                        <Link key={article.id} href={`/store/${subdomain}/blog/${article.slug}`} className="card" style={{ padding: '0', overflow: 'hidden', textDecoration: 'none', transition: 'transform 0.3s ease' }}>
                            <div style={{ height: '240px', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                {article.featured_image ? (
                                    <img src={article.featured_image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : '📖'}
                            </div>
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>{article.category}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        {new Date(article.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{article.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{article.excerpt}</p>
                                <div style={{ marginTop: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '13px' }}>
                                    Read Article →
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
