'use client';

import { useState } from 'react';
import { QrCode, X } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';

interface ProductQRModalProps {
    productUrl: string;
    productName: string;
    storeName: string;
    logoUrl?: string;
    color?: string;
}

export function ProductQRModal({ productUrl, productName, storeName, logoUrl, color }: ProductQRModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                title="Show QR Code"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    border: '1px solid var(--border, #e5e7eb)',
                    background: 'var(--glass-bg, rgba(255,255,255,0.7))',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: 'var(--ink, #002D44)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary, #00798C)';
                    e.currentTarget.style.color = 'var(--primary, #00798C)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border, #e5e7eb)';
                    e.currentTarget.style.color = 'var(--ink, #002D44)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <QrCode size={20} />
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    {/* Backdrop */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 45, 68, 0.5)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                        }}
                    />

                    {/* Modal */}
                    <div
                        style={{
                            position: 'relative',
                            background: 'var(--surface, #fff)',
                            borderRadius: '20px',
                            padding: '32px',
                            maxWidth: '380px',
                            width: '100%',
                            boxShadow: '0 24px 48px rgba(0, 45, 68, 0.15)',
                            animation: 'qrModalIn 0.2s ease-out',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--slate-100, #f1f5f9)',
                                color: 'var(--muted, #6B7280)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                            <p style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--primary, #00798C)',
                                margin: '0 0 4px',
                            }}>
                                Product QR Code
                            </p>
                        </div>

                        <QRCodeDisplay
                            url={productUrl}
                            size={220}
                            logoUrl={logoUrl}
                            color={color}
                            title={productName}
                            subtitle={storeName}
                        />

                        <p style={{
                            fontSize: '11px',
                            color: 'var(--muted, #6B7280)',
                            textAlign: 'center',
                            marginTop: '16px',
                            lineHeight: 1.5,
                            fontWeight: 500,
                        }}>
                            Scan to view this product or share the QR code on packaging and social media.
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes qrModalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
