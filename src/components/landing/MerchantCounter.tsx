'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './landing.module.css';

export default function MerchantCounter() {
    const [count, setCount] = useState<number>(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const supabase = createClient();

                const { count: merchantCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                if (merchantCount !== null) {
                    setCount(merchantCount);
                }
            } catch {
                // Silently fail — counter just won't show
            } finally {
                setLoaded(true);
            }
        };

        fetchCount();
    }, []);

    if (!loaded || count === 0) return null;

    return (
        <span className={styles.merchantCounter}>
            {count > 10 ? `Join ${count.toLocaleString()} merchants already on SOLO` : 'Join our founding merchants on SOLO'}
        </span>
    );
}
