'use client';

import { ShieldCheck, Lock, Globe, FileCheck, Zap } from 'lucide-react';
import styles from './landing.module.css';

const TRUST_ITEMS = [
    { icon: <ShieldCheck size={18} />, label: 'Payments secured by Paystack' },
    { icon: <Lock size={18} />, label: 'Bank-level 256-bit Encryption' },
    { icon: <Zap size={18} />, label: 'Real-time AI by Google Gemini' },
    { icon: <FileCheck size={18} />, label: 'NDPR Data Privacy Compliant' },
    { icon: <Globe size={18} />, label: 'Global infrastructure by Supabase' },
];


export default function TrustBar() {
    // Duplicate items for seamless marquee effect
    const marqueeItems = [...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS];

    return (
        <div className={styles.trustBar}>
            <div className={styles.trustBarInner}>
                {marqueeItems.map((item, idx) => (
                    <div key={idx} className={styles.trustItem}>
                        <span className={styles.trustIcon}>{item.icon}</span>
                        <span className={styles.trustLabel}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
