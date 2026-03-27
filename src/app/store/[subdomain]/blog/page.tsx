'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BlogService, BlogPost } from '@/services/blogService';
import { TenantService } from '@/services/tenantService';
import { BookOpen, ArrowRight } from 'lucide-react';
import styles from '../store.module.css';

export default function BlogListingPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlog() {
            setLoading(true);
            const tenant = await TenantService.getTenantBySubdomain(subdomain);
            if (tenant) {
                const posts = await BlogService.getPosts(tenant.id);
                setArticles(posts);
            }
            setLoading(false);
        }
        fetchBlog();
    }, [subdomain]);

    if (loading) return <div className={styles.loading}>Loading Blog...</div>;

    return (
        <div className={styles.categoryHeader} style={{ padding: '6rem 2rem', background: 'radial-gradient(circle at top right, rgba(124, 77, 255, 0.05), transparent 40%)' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
                    <div className="badge badge-primary" style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '10px' }}>Our Perspectives</div>
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                        Blog<span className="text-primary">.</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.8 }}>
                        Insights, stories, and expertise from our boutique. Carefully curated for the discerning mind.
                    </p>
                </header>

                {articles.length > 0 && (
                    <section style={{ marginBottom: '6rem' }}>
                        <Link
                            href={`/store/${subdomain}/blog/${articles[0].slug}`}
                            className={styles.featuredArticle}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1.2fr 1fr',
                                gap: '3rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '2.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                overflow: 'hidden',
                                textDecoration: 'none',
                                backdropFilter: 'blur(20px)',
                                position: 'relative'
                            }}
                        >
                            <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
                                {articles[0].featured_image ? (
                                    <Image src={articles[0].featured_image} alt={articles[0].title} fill style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, var(--primary), var(--accent))', opacity: 0.2 }} />
                                )}
                            </div>
                            <div style={{ padding: '4rem 3rem 4rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Featured Article</span>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>{articles[0].title}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem', opacity: 0.8 }}>{articles[0].excerpt}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>
                                    Begin Reading <ArrowRight size={18} />
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem' }}>
                    {articles.length <= 1 ? (
                        articles.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', opacity: 0.5 }}>
                                <BookOpen size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                                <p style={{ fontSize: '1.2rem' }}>No articles published yet. Check back soon.</p>
                            </div>
                        )
                    ) : (
                        articles.slice(1).map(article => (
                            <Link
                                key={article.id}
                                href={`/store/${subdomain}/blog/${article.slug}`}
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem',
                                }}
                            >
                                <div style={{
                                    height: '300px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '2rem',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    position: 'relative',
                                    transition: 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)'
                                }} className="hover-scale">
                                    {article.featured_image ? (
                                        <Image src={article.featured_image} alt={article.title} fill style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BookOpen size={48} style={{ opacity: 0.1 }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '0 0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{article.category}</span>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                            {new Date(article.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.2, transition: 'color 0.3s ease' }}>{article.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.7 }}>{article.excerpt}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
