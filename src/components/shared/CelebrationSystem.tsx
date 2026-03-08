'use client';

import { useEffect, useState } from 'react';
import styles from './CelebrationSystem.module.css';

interface CelebrationSystemProps {
    trigger: boolean;
    onComplete?: () => void;
}

const generateSparkles = () => {
    return Array.from({ length: 30 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        size: `${Math.random() * 10 + 5}px`
    }));
};

export default function CelebrationSystem({ trigger, onComplete }: CelebrationSystemProps) {
    const [active, setActive] = useState(false);
    const [sparkles, setSparkles] = useState<{ left: string; top: string; delay: string; size: string }[]>([]);

    useEffect(() => {
        if (trigger) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActive(true);

            setSparkles(generateSparkles());

            const timer = setTimeout(() => {
                setActive(false);
                if (onComplete) onComplete();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    if (!active) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.sparkleContainer}>
                {sparkles.map((sparkle, i) => (
                    <div
                        key={i}
                        className={styles.sparkle}
                        style={{
                            left: sparkle.left,
                            top: sparkle.top,
                            animationDelay: sparkle.delay,
                            '--size': sparkle.size
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
