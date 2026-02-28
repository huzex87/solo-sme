'use client';

import { useEffect, useState } from 'react';
import { LoyaltyService, LoyaltyAccount } from '@/services/loyaltyService';

export default function LoyaltyBadge() {
    const [account, setAccount] = useState<LoyaltyAccount | null>(null);

    useEffect(() => {
        // Simulate fetching points for a signed-in customer (Grace Adekunle)
        const data = LoyaltyService.getAccount('c5');
        setAccount(data);
    }, []);

    if (!account || account.points === 0) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '100px',
            background: 'rgba(255, 215, 0, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            color: '#ffd700',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
        }} title={`${account.tier} Status`}>
            <span>🏆</span>
            <span>{account.points.toLocaleString()} Points</span>
            <span style={{
                fontSize: '10px',
                opacity: 0.8,
                paddingLeft: '4px',
                borderLeft: '1px solid rgba(255, 215, 0, 0.2)',
                marginLeft: '4px'
            }}>
                {account.tier.toUpperCase()}
            </span>
        </div>
    );
}
