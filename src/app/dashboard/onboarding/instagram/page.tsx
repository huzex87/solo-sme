'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingService, OnboardingState } from '@/services/onboardingService';
import styles from './instagram.module.css';

export default function InstagramOnboarding() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OnboardingState | null>(null);
    const router = useRouter();

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        try {
            const data = await OnboardingService.importFromSocial(url);
            setResult(data);
        } catch (err) {
            console.error("Import failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!result) return;
        setLoading(true);
        // Simulate finalizing
        await new Promise(r => setTimeout(r, 1500));
        router.push('/dashboard');
    };

    return (
        <div className={styles.container}>
            <div className={`card ${styles.onboardingCard}`}>
                {!result ? (
                    <>
                        <div className={styles.header}>
                            <span className={styles.icon}>✨</span>
                            <h1 className={styles.title}>Magic Import</h1>
                            <p className={styles.subtitle}>
                                Paste your Instagram or Website link. Our AI will build your store catalog in seconds.
                            </p>
                        </div>

                        <form onSubmit={handleImport} className={styles.form}>
                            <div className="input-group">
                                <label className="input-label">Social/Web Link</label>
                                <input
                                    type="url"
                                    className="input-field"
                                    placeholder="https://instagram.com/your-brand"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%', marginTop: 'var(--space-md)' }}
                            >
                                {loading ? '🤖 AI is analyzing...' : 'Build My Store'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className={styles.resultView}>
                        <div className={styles.header}>
                            <span className={styles.icon}>✅</span>
                            <h1 className={styles.title}>Analysis Complete!</h1>
                            <p className={styles.subtitle}>
                                We found <strong>{result.products.length} products</strong> and identified your brand colors.
                            </p>
                        </div>

                        <div className={styles.previewScroll}>
                            {result.products.map(p => (
                                <div key={p.name} className={styles.productSnippet}>
                                    <div className={styles.snippetImg}>📦</div>
                                    <div className={styles.snippetText}>
                                        <h4>{p.name}</h4>
                                        <p>₦{p.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.brandingPreview}>
                            <p>Suggested Brand colors:</p>
                            <div className={styles.colorPills}>
                                <div className={styles.pill} style={{ background: result.branding.primary }} />
                                <div className={styles.pill} style={{ background: result.branding.secondary }} />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className="btn btn-ghost" onClick={() => setResult(null)}>Try Another Link</button>
                            <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                                {loading ? 'Finalizing...' : 'Setup My Dashboard'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
