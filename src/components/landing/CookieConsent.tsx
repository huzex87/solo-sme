'use client';

import { useState, useEffect } from 'react';
import { Cookie as CookieIcon } from 'lucide-react';
import styles from './landing.module.css';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className={styles.cookieBanner}>
            <div className={styles.cookieContent}>
                <div className={styles.cookieTextWrapper}>
                    <CookieIcon size={20} className={styles.cookieIcon} />
                    <p className={styles.cookieText}>
                        We use cookies to improve your experience and analyze site traffic.
                        By clicking &quot;Accept&quot;, you consent to our use of cookies.
                    </p>
                </div>
                <div className={styles.cookieActions}>
                    <button className="btn btn-ghost btn-sm" onClick={decline}>
                        Decline
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={accept}>
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
