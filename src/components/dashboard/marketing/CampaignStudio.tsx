'use client';

import { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, Mail, MessageSquare, Instagram, Loader2 } from 'lucide-react';
import styles from './CampaignStudio.module.css';
import { AIContentService, MarketingCampaign } from '@/services/aiContentService';

interface CampaignStudioProps {
    onClose: () => void;
}

export default function CampaignStudio({ onClose }: CampaignStudioProps) {
    const [goal, setGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!goal.trim()) return;

        setIsGenerating(true);
        try {
            // In Phase 10, we call the real AI service
            const result = await AIContentService.generateCampaign(goal, []);
            setCampaign(result);
        } catch (error) {
            console.error('Generation failed:', error);
            // Fallback for demo/dev
            setCampaign({
                subject: `Special Offer: ${goal}`,
                emailBody: `Hi there!\n\nWe're excited to announce a special campaign: ${goal}.\n\nVisit our store today to explore world-class products and save more.\n\nBest,\nYour SOLO Store`,
                smsCopy: `SOLO Sale: ${goal}. Shop now at our store!`,
                socialCaption: `✨ ${goal}\n\nWe're bringing you the best. Don't miss out! 🛍️ #SoloSME #Marketing`
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className={styles.studioContainer}>
            <div className={styles.studioHeader}>
                <h2><Sparkles size={20} color="var(--accent-primary)" /> AI Campaign Studio</h2>
                <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
            </div>

            <div className={styles.studioContent}>
                {!campaign ? (
                    <div className={styles.inputSection}>
                        <label className={styles.label}>What is your marketing goal?</label>
                        <textarea
                            className={styles.goalArea}
                            placeholder="e.g., Launch an Independence Day Sale campaign targeting your most loyal customers with a 15% discount."
                            rows={4}
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                        />
                        <button
                            className="btn btn-primary btn-block"
                            disabled={!goal.trim() || isGenerating}
                            onClick={handleGenerate}
                        >
                            {isGenerating ? (
                                <><Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} /> Generating Campaign...</>
                            ) : (
                                <><Sparkles size={18} style={{ marginRight: '8px' }} /> Generate World-Class Campaign</>
                            )
                            }
                        </button>
                    </div>
                ) : (
                    <div className={styles.resultSection}>
                        <div className={styles.resultGrid}>
                            <div className={styles.resultCard}>
                                <div className={styles.resultHeader}>
                                    <h4><Mail size={14} /> Email Marketing</h4>
                                    <button
                                        className={styles.copyBtn}
                                        onClick={() => copyToClipboard(campaign.emailBody, 'email')}
                                    >
                                        {copiedField === 'email' ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                    Subject: {campaign.subject}
                                </div>
                                <div className={styles.resultBody}>{campaign.emailBody}</div>
                            </div>

                            <div className={styles.resultCard}>
                                <div className={styles.resultHeader}>
                                    <h4><MessageSquare size={14} /> SMS / WhatsApp</h4>
                                    <button
                                        className={styles.copyBtn}
                                        onClick={() => copyToClipboard(campaign.smsCopy, 'sms')}
                                    >
                                        {copiedField === 'sms' ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <div className={styles.resultBody}>{campaign.smsCopy}</div>
                            </div>

                            <div className={styles.resultCard}>
                                <div className={styles.resultHeader}>
                                    <h4><Instagram size={14} /> Social Caption</h4>
                                    <button
                                        className={styles.copyBtn}
                                        onClick={() => copyToClipboard(campaign.socialCaption, 'social')}
                                    >
                                        {copiedField === 'social' ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <div className={styles.resultBody}>{campaign.socialCaption}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setCampaign(null)}>
                                Back to Edit
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.studioFooter}>
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                {campaign && (
                    <button className="btn btn-primary">
                        <Send size={18} style={{ marginRight: '8px' }} />
                        Launch Campaign
                    </button>
                )}
            </div>
        </div>
    );
}
