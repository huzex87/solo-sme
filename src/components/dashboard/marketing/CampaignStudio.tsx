'use client';

import { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, Mail, MessageSquare, Instagram, Loader2 } from 'lucide-react';
import styles from './CampaignStudio.module.css';
import { AIContentService, MarketingCampaign } from '@/services/aiContentService';
import { CampaignService } from '@/services/campaignService';
import { CustomerService } from '@/services/customerService';
import { useTenant } from '@/context/TenantContext';
import { toast } from 'sonner';

interface CampaignStudioProps {
    onClose: () => void;
}

export default function CampaignStudio({ onClose }: CampaignStudioProps) {
    const [goal, setGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<'email' | 'whatsapp'>('email');
    const [isLaunching, setIsLaunching] = useState(false);
    const { tenantId } = useTenant();

    const handleGenerate = async () => {
        if (!goal.trim()) return;

        setIsGenerating(true);
        try {
            const result = await AIContentService.generateCampaign(goal, []);
            setCampaign(result);
        } catch (error) {
            console.error('Generation failed:', error);
            setCampaign({
                subject: `Special Offer: ${goal}`,
                emailBody: `Hi there!\n\nWe're excited to announce a special campaign: ${goal}.\n\nVisit our store today to explore world-class products and save more.\n\nBest,\nYour SOLO Store`,
                smsCopy: `SOLO Sale: ${goal}. Shop now at our store!`,
                whatsappBody: `*SOLO Sale: ${goal}*\n\nWe're bringing you the best. Don't miss out! 🛍️\n\nVisit our store today to explore world-class products and save more.`,
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

    const handleLaunch = async () => {
        if (!campaign || !tenantId) return;

        setIsLaunching(true);
        try {
            const customers = await CustomerService.getCustomers(tenantId);
            const recipients = selectedChannel === 'email'
                ? customers.map(c => c.email).filter(Boolean) as string[]
                : customers.map(c => c.phone).filter(Boolean) as string[];

            if (recipients.length === 0) {
                toast.error(`No customers found with ${selectedChannel} to receive the campaign.`);
                return;
            }

            const result = await CampaignService.launchCampaign(tenantId, {
                title: campaign.subject || "New Campaign",
                channel: selectedChannel,
                content: {
                    subject: campaign.subject,
                    body: selectedChannel === 'email' ? campaign.emailBody : (campaign.whatsappBody || campaign.smsCopy),
                },
                recipients: recipients
            });

            if (result.success) {
                toast.success(`Campaign launched via ${selectedChannel} to ${recipients.length} customers!`);
                onClose();
            } else {
                toast.error("Failed to launch campaign. Please check your configuration.");
            }
        } catch (error) {
            console.error('Launch failed:', error);
            toast.error("A critical error occurred while launching the campaign.");
        } finally {
            setIsLaunching(false);
        }
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

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                                <button
                                    className={`btn ${selectedChannel === 'email' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectedChannel('email')}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Mail size={16} /> Email
                                </button>
                                <button
                                    className={`btn ${selectedChannel === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectedChannel('whatsapp')}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <MessageSquare size={16} /> WhatsApp
                                </button>
                            </div>

                            {selectedChannel === 'whatsapp' ? (
                                <div className={styles.phoneShell}>
                                    <div className={styles.phoneNotch} />
                                    <div className={styles.phoneScreen}>
                                        <div className={styles.phoneHeader}>
                                            <div className={styles.avatar}>S</div>
                                            <div className={styles.chatInfo}>
                                                <span className={styles.chatName}>SOLO Business</span>
                                                <span className={styles.onlineStatus}>online</span>
                                            </div>
                                        </div>
                                        <div className={styles.messageArea}>
                                            <div className={styles.bubble}>
                                                {campaign.whatsappBody || campaign.smsCopy}
                                                <div className={styles.bubbleTime}>
                                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                            <h4><MessageSquare size={14} /> SMS Copy</h4>
                                            <button
                                                className={styles.copyBtn}
                                                onClick={() => copyToClipboard(campaign.smsCopy, 'sms')}
                                            >
                                                {copiedField === 'sms' ? <Check size={12} /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                        <div className={styles.resultBody}>{campaign.smsCopy}</div>
                                    </div>
                                </>
                            )}

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
                <button className="btn btn-secondary" onClick={onClose} disabled={isLaunching}>Cancel</button>
                {campaign && (
                    <button
                        className="btn btn-primary"
                        onClick={handleLaunch}
                        disabled={isLaunching}
                    >
                        {isLaunching ? (
                            <><Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} /> Launching...</>
                        ) : (
                            <><Send size={18} style={{ marginRight: '8px' }} /> Launch Campaign</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
