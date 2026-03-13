'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './CelebrationSystem.module.css';

interface CelebrationSystemProps {
    trigger: boolean;
    onComplete?: () => void;
}

export default function CelebrationSystem({ trigger, onComplete }: CelebrationSystemProps) {
    const [active, setActive] = useState(false);
    const [sparkles, setSparkles] = useState<{ id: number; left: string; top: string; animationDelay: string; size: string }[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (trigger) {
            // Defer activation to ensure it doesn't collide with the render pass
            const timer2 = setTimeout(() => {
                setActive(true);
                const newSparkles = Array.from({ length: 30 }).map((_, i) => ({
                    id: i,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    size: `${Math.random() * 10 + 5}px`
                }));
                setSparkles(newSparkles);
            }, 0);

            timer = setTimeout(() => {
                setActive(false);
                if (onComplete) onComplete();
            }, 5000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [trigger, onComplete]);

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
                        } as React.CSSProperties}
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
