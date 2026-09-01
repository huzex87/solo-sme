'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Send, Copy, Check, Mail, MessageSquare, Instagram, Loader2, Users, AlertTriangle, FileText } from 'lucide-react';
import styles from './CampaignStudio.module.css';
import { AIContentService, MarketingCampaign } from '@/services/aiContentService';
import type { CampaignTemplate, ServiceWindowBreakdown } from '@/services/campaignService';
import {
    launchCampaignAction,
    getApprovedTemplatesAction,
    getServiceWindowBreakdownAction
} from '@/app/actions/campaignActions';
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
    const { tenantId, tenantName } = useTenant();

    // WhatsApp reach: Meta only allows free-form marketing within 24h of a customer's
    // last message. Everyone else needs an approved template, so the merchant sees the
    // split and picks a fallback before launching.
    const [phones, setPhones] = useState<string[] | null>(null);
    const [reach, setReach] = useState<ServiceWindowBreakdown | null>(null);
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
    const [templateName, setTemplateName] = useState<string>('');
    const [isCheckingReach, setIsCheckingReach] = useState(false);

    const loadWhatsAppReach = useCallback(async () => {
        if (!tenantId) return;
        setIsCheckingReach(true);
        try {
            const customers = await CustomerService.getCustomers(tenantId);
            const numbers = customers.map(c => c.phone).filter(Boolean) as string[];
            setPhones(numbers);

            const [breakdown, approved] = await Promise.all([
                getServiceWindowBreakdownAction(numbers, tenantId),
                getApprovedTemplatesAction(tenantId)
            ]);
            setReach(breakdown);
            setTemplates(approved);
            setTemplateName(prev => prev || approved[0]?.template_name || '');
        } catch (err) {
            console.error('Reach check failed:', err);
            setReach(null);
        } finally {
            setIsCheckingReach(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (selectedChannel === 'whatsapp' && campaign && reach === null && !isCheckingReach) {
            loadWhatsAppReach();
        }
    }, [selectedChannel, campaign, reach, isCheckingReach, loadWhatsAppReach]);

    const selectedTemplate = templates.find(t => t.template_name === templateName);

    /** Fills the chosen template's {{n}} placeholders with the campaign's own values. */
    const templateParams = (body: string): string[] => {
        const count = selectedTemplate?.param_count ?? 0;
        // store_announcement is 'An update from {{1}}: {{2}}' — store name, then message.
        return [tenantName || 'our store', body].slice(0, count);
    };

    const renderTemplatePreview = (): string => {
        if (!selectedTemplate?.body_text) return '';
        const params = templateParams(campaign?.whatsappBody || campaign?.smsCopy || '');
        return selectedTemplate.body_text.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] ?? `{{${n}}}`);
    };

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
            let recipients: string[];
            if (selectedChannel === 'email') {
                const customers = await CustomerService.getCustomers(tenantId);
                recipients = customers.map(c => c.email).filter(Boolean) as string[];
            } else {
                // Reuse the list already fetched for the reach breakdown.
                recipients = phones ?? (await CustomerService.getCustomers(tenantId))
                    .map(c => c.phone).filter(Boolean) as string[];
            }

            if (recipients.length === 0) {
                toast.error(`No customers found with ${selectedChannel} to receive the campaign.`);
                return;
            }

            const body = selectedChannel === 'email' ? campaign.emailBody : (campaign.whatsappBody || campaign.smsCopy);

            const result = await launchCampaignAction(tenantId, {
                title: campaign.subject || "New Campaign",
                channel: selectedChannel,
                content: {
                    subject: campaign.subject,
                    body
                },
                recipients,
                ...(selectedChannel === 'whatsapp' && templateName
                    ? { templateName, templateParams: templateParams(body) }
                    : {})
            });

            if (result.success) {
                const { sent = 0, skipped = 0 } = result.delivery ?? {};
                toast.success(`Campaign delivered via ${selectedChannel} to ${sent} of ${recipients.length} customers.`);
                if (skipped > 0) {
                    toast.warning(
                        `${skipped} customer${skipped === 1 ? '' : 's'} skipped — WhatsApp only allows free-form messages within 24 hours of their last message. Choose an approved template to reach them.`
                    );
                }
                onClose();
            } else {
                toast.error(result.error || "Campaign reached no one. Check your WhatsApp configuration and approved templates.");
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
                                <>
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

                                    {/* Who this actually reaches. WhatsApp forbids free-form
                                        marketing outside 24h of the customer's last message. */}
                                    <div className={styles.reachCard}>
                                        <div className={styles.resultHeader}>
                                            <h4><Users size={14} /> Who will receive this</h4>
                                        </div>

                                        {isCheckingReach ? (
                                            <div className={styles.reachLoading}>
                                                <Loader2 className="animate-spin" size={14} /> Checking customer reach...
                                            </div>
                                        ) : reach ? (
                                            <>
                                                <div className={styles.reachRow}>
                                                    <span className={styles.reachDotLive} />
                                                    <strong>{reach.inWindow}</strong>
                                                    <span>messaged you in the last 24h — they get the copy above.</span>
                                                </div>
                                                <div className={styles.reachRow}>
                                                    <span className={styles.reachDotGated} />
                                                    <strong>{reach.outOfWindow}</strong>
                                                    <span>are outside that window — WhatsApp only allows an approved template.</span>
                                                </div>

                                                {reach.outOfWindow > 0 && (
                                                    templates.length > 0 ? (
                                                        <div className={styles.templatePicker}>
                                                            <label className={styles.label} htmlFor="fallbackTemplate">
                                                                <FileText size={13} /> Template for those {reach.outOfWindow} customers
                                                            </label>
                                                            <select
                                                                id="fallbackTemplate"
                                                                className={styles.templateSelect}
                                                                value={templateName}
                                                                onChange={(e) => setTemplateName(e.target.value)}
                                                            >
                                                                <option value="">Don&apos;t message them</option>
                                                                {templates.map(t => (
                                                                    <option key={t.template_name} value={t.template_name}>
                                                                        {t.template_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {selectedTemplate && (
                                                                <div className={styles.templatePreview}>
                                                                    {renderTemplatePreview()}
                                                                </div>
                                                            )}
                                                            {!templateName && (
                                                                <p className={styles.reachNote}>
                                                                    They&apos;ll be skipped. Nothing is sent and you won&apos;t be charged for them.
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className={styles.reachWarning}>
                                                            <AlertTriangle size={14} />
                                                            <span>
                                                                No approved templates yet, so these {reach.outOfWindow} customers
                                                                will be skipped. Submit a template in WhatsApp Manager and wait for
                                                                Meta&apos;s approval to reach them.
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </>
                                        ) : (
                                            <p className={styles.reachNote}>
                                                Couldn&apos;t check reach. The campaign will still send to customers inside the 24-hour window.
                                            </p>
                                        )}
                                    </div>
                                </>
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
