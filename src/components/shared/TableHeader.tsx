'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './TableHeader.module.css';

interface TableHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    actions?: React.ReactNode;
    count?: number;
}

export default function TableHeader({ title, subtitle, icon: Icon, actions, count }: TableHeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.titleWrapper}>
                {Icon && (
                    <div className={styles.iconContainer}>
                        <Icon size={20} />
                    </div>
                )}
                <div className={styles.textContainer}>
                    <div className={styles.titleLine}>
                        <h2 className={styles.title}>{title}</h2>
                        {count !== undefined && (
                            <span className={styles.badge}>{count}</span>
                        )}
                    </div>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    );
}
