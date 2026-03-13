'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, CheckCircle, AlertTriangle, ArrowRight, Sparkles, Zap, Layout, Tag, Megaphone } from 'lucide-react';
import styles from '../page.module.css';

export default function SEOStudio() {
    const [score, setScore] = useState(72);
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setScore(88);
            setAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="animate-entrance">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="gradient-text">SEO Studio</h1>
                    <p style={{ opacity: 0.7 }}>Optimize your storefront for global search visibility.</p>
                </div>
                <button
                    className="bg-primary hover:bg-primary-dk text-white font-bold font-sans text-[13px] tracking-tight px-[18px] py-[9px] rounded-[8px] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(0,121,140,0.3)] flex items-center gap-2"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? 'Analyzing...' : <><Zap size={18} /> Run SEO Audit</>}
                </button>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="card" style={{ gridColumn: 'span 1' }}>
                    <div className="text-center py-4">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle
                                    cx="60" cy="60" r="54" fill="none" stroke="var(--primary)"
                                    strokeWidth="8" strokeDasharray="339.292"
                                    strokeDashoffset={339.292 * (1 - score / 100)}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 900 }}>{score}</span>
                                <span className="font-mono" style={{ fontSize: '0.8rem', opacity: 0.5 }}>/100</span>
                            </div>
                        </div>
                        <h3 style={{ marginTop: '1rem', fontWeight: 800 }}>SEO Health</h3>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 className="mb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" /> AI Recommendations
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <Tag size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Improve Meta Description</div>
                                    <div className="text-xs opacity-70">Add &quot;Handmade in Nigeria&quot; to boost local ranking.</div>
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm text-xs">Apply</button>
                        </div>
                        <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-success/20 text-success">
                                    <CheckCircle size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Alt Texts Optimized</div>
                                    <div className="text-xs opacity-70">All 24 products have descriptive image tags.</div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-success uppercase px-2">Perfect</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="card">
                    <h3 className="mb-6 flex items-center gap-2">
                        <Globe size={18} /> Search Preview
                    </h3>
                    <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '1.5rem', color: '#1a0dab', textAlign: 'left' }}>
                        <div style={{ fontSize: '12px', color: '#202124', marginBottom: '4px' }}>https://example.com › store</div>
                        <div style={{ fontSize: '20px', lineHeight: 1.3, marginBottom: '4px', cursor: 'pointer' }}>Boutique SME | Premium Nigerian Logistics & Fashion</div>
                        <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: 1.5 }}>
                            Discover world-class products curated with excellence. Fast delivery across Lagos, Abuja, and beyond. Step into the standard of quality.
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold opacity-50 mb-2 block uppercase">SEO Title Tag</label>
                            <input type="text" className="input-field" defaultValue="Boutique SME | Premium Nigerian Logistics & Fashion" />
                        </div>
                        <div>
                            <label className="text-xs font-bold opacity-50 mb-2 block uppercase">Meta Description</label>
                            <textarea className="input-field" rows={3} defaultValue="Discover world-class products curated with excellence. Fast delivery across Lagos, Abuja, and beyond. Step into the standard of quality." />
                        </div>
                        <button className="bg-primary hover:bg-primary-dk text-white font-bold font-sans text-[13px] tracking-tight px-[18px] py-[13px] rounded-[10px] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_18px_rgba(0,121,140,0.32)] w-full">Save Metadata</button>
                    </div>
                </div>

                <div className="card">
                    <h3 className="mb-6 flex items-center gap-2">
                        <Megaphone size={18} /> Keyword Performance
                    </h3>
                    <div className="space-y-4">
                        {[
                            { word: 'Boutique Fashion', rank: 3, trend: 'up' },
                            { word: 'Lagos Delivery', rank: 12, trend: 'up' },
                            { word: 'Premium SME', rank: 1, trend: 'stable' },
                            { word: 'Fast Shipping', rank: 25, trend: 'down' },
                        ].map((kw, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="font-bold">{kw.word}</div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs opacity-50 uppercase font-mono">Rank</div>
                                        <div className="font-bold font-mono">#{kw.rank}</div>
                                    </div>
                                    <div className={`p-2 rounded-lg ${kw.trend === 'up' ? 'bg-success/10 text-success' : kw.trend === 'down' ? 'bg-error/10 text-error' : 'bg-white/10'}`}>
                                        {kw.trend === 'up' ? '↑' : kw.trend === 'down' ? '↓' : '—'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-ghost w-full mt-6">Explore More Keywords <ArrowRight size={14} /></button>
                </div>
            </div>
        </div>
    );
}
