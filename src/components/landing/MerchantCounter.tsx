'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './landing.module.css';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function MerchantCounter() {
    const [count, setCount] = useState<number>(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                if (!supabaseUrl || !supabaseAnonKey) {
                    setLoaded(true);
                    return;
                }
                const supabase = createClient(supabaseUrl, supabaseAnonKey);
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
            Join <strong>{count.toLocaleString()}</strong> merchants already on SOLO
        </span>
    );
}
