'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './CelebrationSystem.module.css';

interface CelebrationSystemProps {
    trigger: boolean;
    onComplete?: () => void;
}

export default function CelebrationSystem({ trigger, onComplete }: CelebrationSystemProps) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setActive(true);
            const timer = setTimeout(() => {
                setActive(false);
                if (onComplete) onComplete();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    const sparkles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            size: `${Math.random() * 10 + 5}px`
        }));
    }, []);

    if (!active) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.sparkleContainer}>
                {sparkles.map((s) => (
                    <div
                        key={s.id}
                        className={styles.sparkle}
                        style={{
                            left: s.left,
                            top: s.top,
                            animationDelay: s.animationDelay,
                            '--size': s.size
                        } as any}
                    />
                ))}
            </div>
            <div className={styles.content}>
                <h2 className={styles.text}>GOAL ACHIEVED</h2>
                <p className={styles.subtext}>Your business is accelerating! 🚀</p>
            </div>
        </div>
    );
}
