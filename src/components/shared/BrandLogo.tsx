'use client';

import React from 'react';

interface BrandLogoProps {
    variant?: 'light' | 'dark' | 'monochrome-ink' | 'monochrome-white' | 'amber';
    size?: number;
    showText?: boolean;
    textSide?: 'right' | 'bottom';
    className?: string;
}

/**
 * SOLO SME Official Brand Logo (Sovereign Dot 3x3 Grid)
 * Based on Identity Guide v1.0
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
    variant = 'light',
    size = 40,
    showText = true,
    textSide = 'right',
    className = ''
}) => {
    const getTheme = () => {
        switch (variant) {
            case 'dark':
                return {
                    bg: '#0F766E', // Sovereign Teal
                    dotT: 'rgba(255, 255, 255, 0.9)',
                    dotA: '#F59E0B', // Amber
                    dotO: 'rgba(255, 255, 255, 0.22)',
                    text: '#ffffff',
                    sub: '#14B8A6' // Teal Light
                };
            case 'monochrome-ink':
                return {
                    bg: '#072435', // Deep Ink
                    dotT: '#ffffff',
                    dotA: 'rgba(255, 255, 255, 0.7)',
                    dotO: 'rgba(255, 255, 255, 0.28)',
                    text: '#072435',
                    sub: '#072435'
                };
            case 'monochrome-white':
                return {
                    bg: 'rgba(255, 255, 255, 0.15)',
                    dotT: '#ffffff',
                    dotA: '#ffffff',
                    dotO: 'rgba(255, 255, 255, 0.3)',
                    text: '#ffffff',
                    sub: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                };
            case 'amber':
                return {
                    bg: '#F59E0B', // Amber Gold
                    dotT: '#072435', // Ink
                    dotA: '#0F766E', // Teal Anchor
                    dotO: 'rgba(7, 36, 53, 0.2)',
                    text: '#072435',
                    sub: '#92400E'
                };
            default: // light
                return {
                    bg: '#072435', // Deep Ink
                    dotT: '#14B8A6', // Teal Light
                    dotA: '#F59E0B', // Amber Gold
                    dotO: 'rgba(255, 255, 255, 0.18)',
                    text: '#072435',
                    sub: '#0F766E' // Sovereign Teal
                };
        }
    };

    const theme = getTheme();
    const dotSize = size * 0.18;
    const gap = size * 0.08;
    const borderRadius = Math.max(8, size * 0.25);

    const logoMark = (
        <div
            style={{
                width: size,
                height: size,
                backgroundColor: theme.bg,
                borderRadius: borderRadius,
                display: 'grid',
                gridTemplateColumns: `repeat(3, ${dotSize}px)`,
                gap: `${gap}px`,
                padding: `${size * 0.22}px`,
                alignContent: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: (theme as { border?: string }).border || 'none'
            }}
            className="brand-logo-mark shadow-sm overflow-hidden"
        >
            {/* Row 1 */}
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotT }} />
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotT }} />
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotO }} />

            {/* Row 2 */}
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotT }} />
            <div style={{
                width: dotSize * 1.1,
                height: dotSize * 1.1,
                borderRadius: '50%',
                background: theme.dotA,
                margin: `-${dotSize * 0.05}px`
            }} />
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotT }} />

            {/* Row 3 */}
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotO }} />
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotT }} />
            <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: theme.dotT }} />
        </div>
    );

    if (!showText) return <div className={className}>{logoMark}</div>;

    const textSize = size * 0.75;
    const subSize = size * 0.22;

    return (
        <div
            className={`${className} flex ${textSide === 'bottom' ? 'flex-col items-center text-center' : 'items-center'} gap-3.5`}
            style={{ color: theme.text }}
        >
            {logoMark}
            <div className="flex flex-col leading-none">
                <span style={{
                    fontSize: textSize,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    fontFamily: 'var(--font-outfit)'
                }}>
                    SOLO
                </span>
                <span style={{
                    fontSize: subSize,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                    color: theme.sub
                }}>
                    SME PLATFORM
                </span>
            </div>
        </div>
    );
};
