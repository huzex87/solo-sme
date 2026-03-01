'use client';

import { useState } from 'react';

interface ImageStudioProps {
    initialImage?: string;
    onApply: (refinedImage: string) => void;
}

export default function ImageStudio({ initialImage, onApply }: ImageStudioProps) {
    const [filter, setFilter] = useState<'none' | 'premium' | 'bright' | 'warm' | 'cool'>('none');
    const [isProcessing, setIsProcessing] = useState(false);

    const applyRefinement = () => {
        setIsProcessing(true);
        // Simulated AI processing time
        setTimeout(() => {
            setIsProcessing(false);
            onApply(`refined_${filter}_image.jpg`);
        }, 2000);
    };

    const getFilterStyle = () => {
        switch (filter) {
            case 'premium': return { filter: 'contrast(1.1) brightness(1.05) saturate(0.9) sharpness(1.2)' };
            case 'bright': return { filter: 'brightness(1.2) contrast(1.1)' };
            case 'warm': return { filter: 'sepia(0.2) saturate(1.2) contrast(1.1)' };
            case 'cool': return { filter: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)' };
            default: return {};
        }
    };

    return (
        <div className="card animate-entrance" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>AI Image Studio</h3>
                <span className="badge badge-primary">Pro Version</span>
            </div>

            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ position: 'relative', height: '400px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    {initialImage ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%', ...getFilterStyle() }}>
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                <span style={{ fontSize: '4rem' }}>📸</span>
                                <p style={{ marginTop: '1rem' }}>Original Image Preview</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                            No Image Selected
                        </div>
                    )}
                    {isProcessing && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                            <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <p style={{ marginTop: '1rem', fontWeight: 700, fontSize: '12px' }}>AI ENHANCING...</p>
                        </div>
                    )}
                </div>

                <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Visual Refinement</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
                        {(['none', 'premium', 'bright', 'warm', 'cool'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>AI Features</h5>
                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '0.5rem' }}>✅ Smart Background Removal</li>
                            <li style={{ marginBottom: '0.5rem' }}>✅ HDR Lighting Optimization</li>
                            <li style={{ marginBottom: '0.5rem' }}>✅ Edge Sharpening</li>
                        </ul>
                    </div>

                    <button
                        className="btn btn-primary btn-block"
                        onClick={applyRefinement}
                        disabled={isProcessing || !initialImage || filter === 'none'}
                    >
                        {isProcessing ? 'Refining...' : 'Apply AI Refinement'}
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '1rem' }}>
                        Processing locally for maximum privacy.
                    </p>
                </div>
            </div>
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
