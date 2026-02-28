'use client';

import { useState } from 'react';
import { AIImportResult } from '@/services/onboardingService';

interface ImportReviewProps {
    products: AIImportResult[];
    onConfirm: (finalProducts: AIImportResult[]) => void;
    onCancel: () => void;
}

export default function ImportReview({ products, onConfirm, onCancel }: ImportReviewProps) {
    const [items, setItems] = useState(products);

    const handleUpdate = (index: number, field: keyof AIImportResult, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleRemove = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    return (
        <div className="import-review">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Review Your Catalog</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    We&apos;ve extracted these products from your link. Please verify the names and prices.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {items.map((product, idx) => (
                    <div key={idx} className="card" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '80px 1fr 120px 40px', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                            📦
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                className="input-field"
                                value={product.name}
                                onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                                style={{ fontWeight: 600 }}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="number"
                                className="input-field"
                                value={product.price}
                                onChange={(e) => handleUpdate(idx, 'price', parseInt(e.target.value))}
                                style={{ textAlign: 'right' }}
                            />
                        </div>
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => handleRemove(idx)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <button className="btn btn-ghost" onClick={onCancel}>Start Over</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onConfirm(items)}>
                    Finalize & Create Store
                </button>
            </div>
        </div>
    );
}
