'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    } | React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <Icon size={48} strokeWidth={1.5} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            {action && (
                <div className={styles.actionWrapper}>
                    {React.isValidElement(action) ? (
                        action
                    ) : (
                        <button className="btn btn-primary" onClick={(action as any).onClick}>
                            {(action as any).label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
