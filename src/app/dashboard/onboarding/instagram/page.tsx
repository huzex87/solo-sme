'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingService, OnboardingState } from '@/services/onboardingService';
import ImportReview from '@/components/dashboard/ImportReview';
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
        try {
            await OnboardingService.finalizeOnboarding('demo-user', result);
            router.push('/dashboard/products'); // Redirect to products to see the result
        } catch (err) {
            console.error("Finalize failed", err);
        } finally {
            setLoading(false);
        }
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
                    <ImportReview
                        products={result.products}
                        onConfirm={handleConfirm}
                        onCancel={() => setResult(null)}
                    />
                )}
            </div>
        </div>
    );
}
