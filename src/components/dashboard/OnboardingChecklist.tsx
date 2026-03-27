'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, X, Rocket } from 'lucide-react';
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
    const [dismissed, setDismissed] = useState(false);
    const completedCount = steps.filter(s => s.isCompleted).length;
    const progress = (completedCount / steps.length) * 100;

    if (progress === 100 || dismissed) return null;

    const nextStep = steps.find(s => !s.isCompleted);

    return (
        <div className={styles.container}>
            {/* Dismiss button */}
            <button
                className={styles.dismissBtn}
                onClick={() => setDismissed(true)}
                aria-label="Dismiss setup guide"
            >
                <X size={14} />
            </button>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.iconWrapper}>
                        <Rocket size={20} />
                    </div>
                    <div className={styles.headerText}>
                        <h3 className={styles.title}>Complete Your Setup</h3>
                        <p className={styles.subtitle}>
                            {completedCount === 0
                                ? `${steps.length} steps to launch your store`
                                : `${completedCount} of ${steps.length} completed`
                            }
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className={styles.progressWrapper}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className={styles.progressLabel}>{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Steps */}
            <div className={styles.stepsGrid}>
                {steps.map((step) => {
                    const isNext = step.id === nextStep?.id;
                    const StepIcon = step.icon;
                    return (
                        <Link
                            href={step.href}
                            key={step.id}
                            className={`${styles.stepCard} ${step.isCompleted ? styles.completed : ''} ${isNext ? styles.nextStep : ''}`}
                        >
                            <div className={`${styles.stepIconBox} ${step.isCompleted ? styles.stepIconDone : ''} ${isNext ? styles.stepIconNext : ''}`}>
                                {step.isCompleted ? (
                                    <Check size={16} strokeWidth={3} />
                                ) : (
                                    <StepIcon size={16} />
                                )}
                            </div>
                            <div className={styles.stepContent}>
                                <span className={styles.stepTitle}>{step.title}</span>
                                <span className={styles.stepDesc}>{step.description}</span>
                            </div>
                            <div className={styles.stepAction}>
                                {step.isCompleted ? (
                                    <span className={styles.doneTag}>Done</span>
                                ) : isNext ? (
                                    <span className={styles.startTag}>
                                        Start
                                        <ChevronRight size={12} />
                                    </span>
                                ) : (
                                    <ChevronRight size={14} className={styles.chevron} />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
