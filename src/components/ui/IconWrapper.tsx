'use client';

import React from 'react';

interface IconWrapperProps {
    children: React.ReactNode;
    color?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    glow?: boolean;
}

export default function IconWrapper({
    children,
    color = 'var(--accent-primary)',
    size = 'md',
    glow = true
}: IconWrapperProps) {
    const sizeMap = {
        sm: '32px',
        md: '48px',
        lg: '64px',
        xl: '80px'
    };

    return (
        <div className={`icon-wrapper ${glow ? 'glow' : ''}`}>
            {children}
            <style jsx>{`
        .icon-wrapper {
          width: ${sizeMap[size]};
          height: ${sizeMap[size]};
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 30%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          color: ${color};
          position: relative;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .icon-wrapper:hover {
          transform: translateY(-4px) scale(1.05);
          background: rgba(255, 255, 255, 0.08);
          border-color: ${color};
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .glow::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: ${color};
          filter: blur(15px);
          opacity: 0.15;
          z-index: -1;
          transition: opacity 0.3s;
        }

        .icon-wrapper:hover::after {
          opacity: 0.3;
        }
      `}</style>
        </div>
    );
}
