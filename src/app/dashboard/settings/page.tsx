'use client';

import { useState } from 'react';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [storeName, setStoreName] = useState('Demo Boutique');
    const [subdomain, setSubdomain] = useState('demo-boutique');
    const [customDomain, setCustomDomain] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#7c4dff');
    const [secondaryColor, setSecondaryColor] = useState('#00e5ff');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>Store Settings</h1>
                <p className={styles.subtitle}>Configure your store&apos;s identity and branding</p>
            </div>

            <div className={styles.settingsGrid}>
                {/* General Settings */}
                <div className={`card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>General Information</h3>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="storeName">Store Name</label>
                        <input
                            id="storeName"
                            type="text"
                            className="input-field"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="subdomain">Store URL (Subdomain)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="subdomain"
                                type="text"
                                className="input-field"
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value)}
                                style={{ paddingRight: '7rem' }}
                            />
                            <span style={{
                                position: 'absolute', right: '1rem', top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                                fontSize: 'var(--font-size-xs)', pointerEvents: 'none',
                            }}>
                                .solo.app
                            </span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="customDomain">Custom Domain (Optional)</label>
                        <input
                            id="customDomain"
                            type="text"
                            className="input-field"
                            placeholder="shop.yourbrand.com"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                        />
                        <p className="error-text" style={{ color: 'var(--text-tertiary)' }}>
                            Point your CNAME record to cname.solo.app
                        </p>
                    </div>
                </div>

                {/* Branding Settings */}
                <div className={`card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>Branding</h3>

                    <div className={styles.colorRow}>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="input-label">Primary Color</label>
                            <div className={styles.colorPicker}>
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="input-label">Secondary Color</label>
                            <div className={styles.colorPicker}>
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className={styles.preview} style={{
                        '--preview-primary': primaryColor,
                        '--preview-secondary': secondaryColor,
                    } as React.CSSProperties}>
                        <h4 className={styles.previewTitle}>Live Preview</h4>
                        <div className={styles.previewCard}>
                            <div className={styles.previewHeader}>
                                <span style={{ fontWeight: 700, letterSpacing: 2 }}>{storeName || 'Your Store'}</span>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: 'var(--font-size-sm)' }}>
                                    <span>Shop</span>
                                    <span>About</span>
                                    <span>Contact</span>
                                </div>
                            </div>
                            <div className={styles.previewHero}>
                                <span style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: 800,
                                }}>
                                    Welcome to {storeName || 'Your Store'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                {saved && <span className="badge badge-success">✓ Settings saved</span>}
                <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
        </>
    );
}
