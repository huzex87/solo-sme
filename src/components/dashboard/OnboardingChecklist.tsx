'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './OnboardingChecklist.module.css';
import Link from 'next/link';

interface Step {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    href: string;
    icon: React.ElementType;
}

interface OnboardingChecklistProps {
    steps: Step[];
}

export default function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
    const completedCount = steps.filter(s => s.isCompleted).length;
    const progress = (completedCount / steps.length) * 100;

    if (progress === 100) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h3 className={styles.title}>Complete Your Setup</h3>
                    <p className={styles.subtitle}>{completedCount} of {steps.length} steps finished</p>
                </div>
                <div className={styles.progressWrapper}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className={styles.progressText}>{Math.round(progress)}%</span>
                </div>
            </div>

            <div className={styles.stepsGrid}>
                {steps.map((step) => (
                    <Link
                        href={step.href}
                        key={step.id}
                        className={`${styles.stepCard} ${step.isCompleted ? styles.completed : ''}`}
                    >
                        <div className={styles.stepIcon}>
                            <step.icon size={20} />
                        </div>
                        <div className={styles.stepContent}>
                            <h4>{step.title}</h4>
                            <p>{step.description}</p>
                        </div>
                        <div className={styles.statusIcon}>
                            {step.isCompleted ? (
                                <CheckCircle2 size={20} className={styles.iconDone} />
                            ) : (
                                <ArrowRight size={18} className={styles.iconPending} />
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
