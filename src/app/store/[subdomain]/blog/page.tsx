'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from '../store.module.css';

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    category: string;
}

const DEMO_ARTICLES: Article[] = [
    {
        id: '1',
        title: 'Mastering the Art of Modern Craftsmanship',
        slug: 'modern-craftsmanship',
        excerpt: 'Discover the secrets behind high-fidelity product design and why it matters for your brand.',
        date: 'Oct 24, 2025',
        category: 'Lifestyle'
    },
    {
        id: '2',
        title: 'The Solo SME Revolution',
        slug: 'solo-sme-revolution',
        excerpt: 'How small businesses are using AI to dominate their local markets in 2025.',
        date: 'Oct 22, 2025',
        category: 'Business'
    }
];

export default function BlogListingPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    return (
        <div className={styles.categoryHeader} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>Journal</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Insights, stories, and expertise from the heart of our boutique. Carefully curated for the discerning eye.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '4rem', textAlign: 'left' }}>
                {DEMO_ARTICLES.map(article => (
                    <Link key={article.id} href={`/store/${subdomain}/blog/${article.slug}`} className="card" style={{ padding: '0', overflow: 'hidden', textDecoration: 'none', transition: 'transform 0.3s ease' }}>
                        <div style={{ height: '240px', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                            📖
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                <span className="badge badge-primary" style={{ fontSize: '10px' }}>{article.category}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{article.date}</span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{article.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{article.excerpt}</p>
                            <div style={{ marginTop: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '13px' }}>
                                Read Article →
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
