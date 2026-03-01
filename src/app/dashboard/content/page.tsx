'use client';

import { useState } from 'react';
import { AIContentService, BlogPost, SocialCaptions } from '@/services/aiContentService';

export default function ContentLabPage() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BlogPost | null>(null);
    const [captions, setCaptions] = useState<SocialCaptions | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [posting, setPosting] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const post = await AIContentService.generateBlogPost('Artisan Soul', topic);
            const social = AIContentService.generateSocialCaptions(topic, 15500);
            setResult(post);
            setCaptions(social);
        } catch (err) {
            console.error("Content generation failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (platform: 'instagram' | 'whatsapp' | 'twitter', content: string) => {
        setPosting(platform);
        try {
            await AIContentService.postToSocial(platform, content, selectedImage || undefined);
            alert(`Successfully posted to ${platform.charAt(0).toUpperCase() + platform.slice(1)}! ✨`);
        } catch {
            alert(`Failed to post to ${platform}.`);
        } finally {
            setPosting(null);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Content Lab</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Automate your brand growth with high-fidelity, organic marketing content.</p>
            </div>

            <div className={`card`} style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Generate New Insight</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Entrez un sujet (e.g. 'Handmade Quality', 'Sustainable Slow-Fashion')..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                            {selectedImage ? '🖼️ Flyer Attached' : '📎 Add Flyer/Photo'}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                                accept="image/*"
                            />
                        </label>
                        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !topic}>
                            {loading ? '🤖 AI is writing...' : 'Generate Content'}
                        </button>
                    </div>
                </div>
            </div>

            {result && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    <div className={`card`} style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Generated Article</h3>
                            <button className="btn btn-ghost btn-sm">Edit Draft</button>
                        </div>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>{result.title}</h4>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: result.content }} />
                        <button className="btn btn-primary btn-block" style={{ marginTop: '2rem' }}>Publish to Store Blog</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className={`card`} style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Social Captions</h3>
                            {captions && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Instagram</div>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                style={{ fontSize: '10px', height: 'auto', padding: '4px 8px' }}
                                                onClick={() => handlePost('instagram', captions.instagram)}
                                                disabled={posting !== null}
                                            >
                                                {posting === 'instagram' ? 'Posting...' : 'Post Directly'}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '13px', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{captions.instagram}</p>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>WhatsApp</div>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                style={{ fontSize: '10px', height: 'auto', padding: '4px 8px', background: '#25D366', borderColor: '#25D366' }}
                                                onClick={() => handlePost('whatsapp', captions.whatsapp)}
                                                disabled={posting !== null}
                                            >
                                                {posting === 'whatsapp' ? 'Sharing...' : 'Share Status'}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '13px', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{captions.whatsapp}</p>
                                    </div>
                                </div>
                            )}
                            <button className="btn btn-ghost btn-block btn-sm" style={{ marginTop: '1rem' }}>Copy to Clipboard</button>
                        </div>

                        <div className={`card`} style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(var(--accent-primary-rgb), 0.1), transparent)' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 800 }}>SEO Orchestration</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Automatic keywords: <strong>{result.tags.join(', ')}</strong>
                            </p>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <span className="badge badge-success">Sitemap Updated</span>
                                <span className="badge badge-success">Meta Optimized</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
