'use client';

import { ShieldCheck, Lock, Globe, FileCheck, Zap } from 'lucide-react';
import styles from './landing.module.css';

const TRUST_ITEMS = [
    { icon: <ShieldCheck size={18} />, label: 'Secure Payments by Paystack' },
    { icon: <Lock size={18} />, label: '256-bit SSL Encryption' },
    { icon: <Globe size={18} />, label: '99.9% Uptime Guarantee' },
    { icon: <FileCheck size={18} />, label: 'NDPR Data Compliant' },
    { icon: <Zap size={18} />, label: 'Cloud Infrastructure by Supabase' },
];

export default function TrustBar() {
    return (
        <div className={styles.trustBar}>
            <div className={styles.trustBarInner}>
                {TRUST_ITEMS.map((item, idx) => (
                    <div key={idx} className={styles.trustItem}>
                        <span className={styles.trustIcon}>{item.icon}</span>
                        <span className={styles.trustLabel}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
