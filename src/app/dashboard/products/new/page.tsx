'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/formatCurrency';
import TableHeader from '@/components/shared/TableHeader';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import styles from './new-product.module.css';
import ImageStudio from '@/components/dashboard/ImageStudio';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [socialCaption, setSocialCaption] = useState('');
    const [showStudio, setShowStudio] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        image: ''
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push('/dashboard/products');
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="animate-entrance">
            <TableHeader
                title="Add New Product"
                subtitle="Scale your business by expanding your catalog."
                icon={PlusCircle}
            />

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.mainSection}>
                        <div className={`card ${styles.formCard}`}>
                            <h3 className={styles.sectionTitle}>Product Information</h3>

                            <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="input-label" htmlFor="name">Product Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Premium Wireless Headphones"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <div className={styles.labelRow}>
                                    <label className="input-label" htmlFor="description">Description</label>
                                    <button
                                        type="button"
                                        className={styles.aiButton}
                                        onClick={async () => {
                                            if (!formData.name) return alert('Enter a product name first');
                                            setIsGenerating(true);
                                            try {
                                                const res = await fetch('/api/ai/copywriter', {
                                                    method: 'POST',
                                                    body: JSON.stringify({
                                                        type: 'product-description',
                                                        name: formData.name,
                                                        category: formData.category,
                                                        currentDescription: formData.description
                                                    })
                                                });
                                                const data = await res.json();
                                                if (data.content) updateField('description', data.content);
                                            } finally {
                                                setIsGenerating(false);
                                            }
                                        }}
                                        disabled={isGenerating || !formData.name}
                                    >
                                        {isGenerating ? 'Generating...' : '✨ Write with AI'}
                                    </button>
                                </div>
                                <textarea
                                    id="description"
                                    className="input-field"
                                    placeholder="Describe your product in detail..."
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={4}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="price">Price ({formatCurrency(0).replace(/[0-9.]/g, '')})</label>
                                    <input
                                        id="price"
                                        type="number"
                                        className="input-field"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => updateField('price', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label" htmlFor="stock">Stock Quantity</label>
                                    <input
                                        id="stock"
                                        type="number"
                                        className="input-field"
                                        placeholder="0"
                                        min="0"
                                        value={formData.stock_quantity}
                                        onChange={(e) => updateField('stock_quantity', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideSection}>
                        <div className={`card ${styles.formCard}`}>
                            <h3 className={styles.sectionTitle}>Organization</h3>

                            <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="input-label" htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    className="input-field"
                                    value={formData.category}
                                    onChange={(e) => updateField('category', e.target.value)}
                                    required
                                >
                                    <option value="">Select category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Apparel">Apparel</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Home">Home</option>
                                    <option value="Food">Food &amp; Drink</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className={`card ${styles.formCard}`}>
                            <div className={styles.labelRow}>
                                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Social Preview</h3>
                                <button
                                    type="button"
                                    className={styles.aiButton}
                                    onClick={async () => {
                                        if (!formData.name || !formData.description) return alert('Enter product name and description first');
                                        setIsGenerating(true);
                                        try {
                                            const res = await fetch('/api/ai/copywriter', {
                                                method: 'POST',
                                                body: JSON.stringify({
                                                    type: 'social-caption',
                                                    name: formData.name,
                                                    category: formData.category,
                                                    currentDescription: formData.description
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.content) setSocialCaption(data.content);
                                        } finally {
                                            setIsGenerating(false);
                                        }
                                    }}
                                    disabled={isGenerating || !formData.name}
                                >
                                    {isGenerating ? 'Generating...' : '✨ Create Caption'}
                                </button>
                            </div>
                            <textarea
                                className="input-field"
                                style={{ fontSize: '0.8rem', marginTop: 'var(--space-md)' }}
                                placeholder="Social media caption will appear here..."
                                value={socialCaption}
                                onChange={(e) => setSocialCaption(e.target.value)}
                                rows={3}
                            />
                            <div className={styles.socialHint}>
                                📱 Ready for Instagram & Facebook Sync
                            </div>
                        </div>

                        <div className={`card ${styles.formCard}`}>
                            <h3 className={styles.sectionTitle}>Product Image</h3>
                            {!formData.image ? (
                                <div className={styles.uploadArea} onClick={() => setShowStudio(true)}>
                                    <span style={{ fontSize: '2rem' }}>📸</span>
                                    <p>Open AI Image Studio</p>
                                    <span className={styles.uploadHint}>Enhance automatically with AI</span>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ height: '160px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '2.5rem' }}>✨</span>
                                    </div>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowStudio(true)}>Edit in Studio</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showStudio && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <div style={{ width: '100%', maxWidth: '1000px', position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => setShowStudio(false)}
                                style={{ position: 'absolute', top: '-3rem', right: 0, color: 'white', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕ Close Studio
                            </button>
                            <ImageStudio
                                initialImage="demo.jpg"
                                onApply={(img) => {
                                    updateField('image', img);
                                    setShowStudio(false);
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Saving...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
