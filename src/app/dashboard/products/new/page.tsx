'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './new-product.module.css';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push('/dashboard/products');
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <div className={styles.header}>
                <button className="btn btn-ghost" onClick={() => router.back()}>
                    ← Back
                </button>
                <h1 className={styles.title}>Add New Product</h1>
            </div>

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
                                <label className="input-label" htmlFor="description">Description</label>
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
                                    <label className="input-label" htmlFor="price">Price (₦)</label>
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
                            <h3 className={styles.sectionTitle}>Product Image</h3>
                            <div className={styles.uploadArea}>
                                <span style={{ fontSize: '2rem' }}>📸</span>
                                <p>Click to upload an image</p>
                                <span className={styles.uploadHint}>PNG, JPG up to 5MB</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Saving...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </>
    );
}
