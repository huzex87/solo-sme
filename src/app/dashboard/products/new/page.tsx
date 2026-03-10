'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/formatCurrency';
import { useTenant } from '@/context/TenantContext';
import { ProductService } from '@/services/productService';
import { StorageService } from '@/services/storageService';
import TableHeader from '@/components/shared/TableHeader';
import { PlusCircle, ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import styles from './new-product.module.css';
import ImageStudio from '@/components/dashboard/ImageStudio';

export default function NewProductPage() {
    const router = useRouter();
    const { tenantId } = useTenant();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [socialCaption, setSocialCaption] = useState('');
    const [showStudio, setShowStudio] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        image: ''
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!tenantId) { alert('Please wait — loading your store data.'); return; }
        setLoading(true);

        try {
            // 1. Upload image if selected
            let imageUrl = formData.image;
            if (imageFile) {
                const { url, error: uploadErr } = await StorageService.uploadProductImage(imageFile, tenantId);
                if (uploadErr) {
                    alert(`Image upload failed: ${uploadErr}`);
                    setLoading(false);
                    return;
                }
                imageUrl = url || '';
            }

            // 2. Create product
            const product = await ProductService.createProduct({
                tenant_id: tenantId,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                category: formData.category,
                image_url: imageUrl,
            });

            if (!product) {
                alert('Failed to create product. Please try again.');
                setLoading(false);
                return;
            }

            router.push('/dashboard/products');
        } catch (err) {
            console.error('[NewProduct] Error:', err);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
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
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                style={{ display: 'none' }}
                                onChange={handleImageSelect}
                            />
                            {!imagePreview && !formData.image ? (
                                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                                    <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                                        <Upload size={24} style={{ color: 'var(--ghost)', marginBottom: 8 }} />
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Upload Image</p>
                                        <span className={styles.uploadHint}>JPEG, PNG, WebP · Max 5MB</span>
                                    </div>
                                    <button type="button" onClick={() => setShowStudio(true)} style={{
                                        width: '100%', padding: '10px', background: 'var(--surface)',
                                        border: '1px solid var(--border)', borderRadius: 8,
                                        fontSize: 12, fontWeight: 700, color: 'var(--muted)', cursor: 'pointer',
                                    }}>
                                        📸 Open AI Image Studio
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    {imagePreview && (
                                        <div style={{ position: 'relative', marginBottom: 12 }}>
                                            <img src={imagePreview} alt="Preview" style={{
                                                width: '100%', height: 160, objectFit: 'cover',
                                                borderRadius: 8, border: '1px solid var(--border)',
                                            }} />
                                            <button type="button" onClick={() => {
                                                setImageFile(null);
                                                setImagePreview('');
                                            }} style={{
                                                position: 'absolute', top: 6, right: 6,
                                                width: 24, height: 24, borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.6)', border: 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer',
                                            }}>
                                                <X size={14} color="white" />
                                            </button>
                                        </div>
                                    )}
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                                        Change Image
                                    </button>
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
                        {loading ? <><Loader2 size={16} className="animate-spin" style={{ marginRight: 6 }} /> Saving...</> : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
