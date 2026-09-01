import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './baseService';
import { WhatsAppService } from './whatsappService';
import { EmailService } from './emailService';
import { logger } from '@/lib/logger';
import { normalisePhone } from '@/lib/phone';

/** An approved template the merchant can pick as the out-of-window fallback. */
export interface CampaignTemplate {
    template_name: string;
    body_text: string | null;
    param_count: number;
    language: string;
}

/** How a recipient list splits across Meta's 24h service window. */
export interface ServiceWindowBreakdown {
    /** Will receive the custom campaign copy. */
    inWindow: number;
    /** Reachable only via an approved template. */
    outOfWindow: number;
}

export interface CampaignData {
    title: string;
    channel: 'email' | 'whatsapp' | 'sms';
    content: {
        subject?: string;
        body: string;
        imageUrl?: string;
        ctaLabel?: string;
        ctaUrl?: string;
    };
    recipients: string[];
    /**
     * Meta-approved template used for WhatsApp recipients who are outside the 24h
     * service window. Without it, those recipients are skipped — Meta rejects
     * free-form marketing sends to anyone who hasn't messaged in the last 24h.
     */
    templateName?: string;
    templateParams?: string[];
}

export interface CampaignDelivery {
    sent: number;
    failed: number;
    /** Recipients deliberately not messaged (outside service window, no template, bad number). */
    skipped: number;
}

export class CampaignService extends BaseService {
    protected static serviceName = 'CampaignService';

    /**
     * Approved templates available as an out-of-window fallback.
     *
     * Read live from Meta rather than from whatsapp_templates: Meta owns the review
     * outcome and nothing syncs it back into our table, so trusting the local
     * `status` column would mean the picker never populates. Anything still pending
     * review would be rejected at send time anyway.
     */
    static async getApprovedTemplates(tenantId?: string): Promise<CampaignTemplate[]> {
        const approved = await WhatsAppService.listApprovedTemplates(tenantId);
        return [...approved].sort((a, b) => a.template_name.localeCompare(b.template_name));
    }

    /**
     * Splits a recipient list by whether Meta's 24h service window is open, so the
     * merchant can see before launching how many customers need a template.
     */
    static async getServiceWindowBreakdown(
        recipients: string[],
        tenantId: string
    ): Promise<ServiceWindowBreakdown> {
        const open = await WhatsAppService.filterWithinServiceWindow(recipients, tenantId);
        const inWindow = recipients.filter(p => open.has(normalisePhone(p))).length;
        return { inWindow, outOfWindow: recipients.length - inWindow };
    }

    /**
     * Persists and launches a marketing campaign across selected channels.
     *
     * Must run server-side: WhatsApp sending needs the Meta access token and the
     * Supabase admin client. Call it through launchCampaignAction, not from a
     * client component.
     */
    static async launchCampaign(
        tenantId: string,
        data: CampaignData,
        client?: SupabaseClient
    ): Promise<{ success: boolean; campaignId?: string; delivery?: CampaignDelivery }> {
        logger.info('Launching marketing campaign', { tenantId, channel: data.channel });

        const supabase = await this.getClient(client);

        // 1. Create campaign record
        const { data: campaign, error: createError } = await supabase
            .from('marketing_campaigns')
            .insert({
                tenant_id: tenantId,
                title: data.title,
                channel: data.channel,
                content: data.content,
                status: 'sending',
                recipient_count: data.recipients.length
            })
            .select()
            .single();

        if (createError) {
            logger.error('Failed to create campaign record', createError);
            return { success: false };
        }

        const campaignId = campaign.id;

        // 2. Execute broadcast (Async-ish)
        try {
            let result: CampaignDelivery | undefined;
            if (data.channel === 'whatsapp') {
                const message = `${data.content.body}${data.content.ctaUrl ? `\n\n${data.content.ctaLabel}: ${data.content.ctaUrl}` : ''}`;

                // Marketing sends are business-initiated. Recipients inside the 24h
                // service window get the custom AI copy; everyone else needs the
                // pre-approved template, because Meta rejects free-form re-engagement.
                // One bulk window lookup — per-recipient checks would be N round-trips.
                const openWindows = await WhatsAppService.filterWithinServiceWindow(data.recipients, tenantId);

                let sent = 0, failed = 0, skipped = 0;
                await Promise.all(data.recipients.map(async to => {
                    const phone = normalisePhone(to);
                    if (!phone) { skipped++; return; }

                    try {
                        if (openWindows.has(phone)) {
                            if (data.content.imageUrl) {
                                await WhatsAppService.sendImage(to, data.content.imageUrl, message, tenantId);
                            } else {
                                await WhatsAppService.sendText(to, message, tenantId);
                            }
                            sent++;
                        } else if (data.templateName) {
                            await WhatsAppService.sendTemplate(
                                to,
                                data.templateName,
                                'en',
                                WhatsAppService.buildBodyParams(data.templateParams || []),
                                tenantId
                            );
                            sent++;
                        } else {
                            skipped++;
                        }
                    } catch {
                        failed++;
                    }
                }));

                result = { sent, failed, skipped };

                if (skipped > 0 && !data.templateName) {
                    logger.warn('Campaign recipients skipped — outside 24h window with no approved template', {
                        tenantId, campaignId, skipped, total: data.recipients.length
                    });
                }
            } else if (data.channel === 'email') {
                const emailResult = await EmailService.sendBroadcast(
                    data.recipients,
                    data.content.subject || data.title,
                    this.wrapEmailContent(data.content.body, data.content.ctaUrl, data.content.ctaLabel)
                );
                result = { sent: emailResult.sent, failed: emailResult.failed, skipped: 0 };
            }

            // 3. Record the real outcome — a campaign that reached nobody is not 'sent'
            await supabase
                .from('marketing_campaigns')
                .update({
                    status: result && result.sent === 0 ? 'failed' : 'sent',
                    sent_at: new Date().toISOString(),
                    recipient_count: data.recipients.length
                })
                .eq('id', campaignId);

            // 4. Record Audit Log
            const { AuditService } = await import('./auditService');
            await AuditService.logAction({
                tenant_id: tenantId,
                action: 'campaign_launched',
                entity_type: 'campaign',
                entity_id: campaignId,
                metadata: {
                    title: data.title,
                    channel: data.channel,
                    recipient_count: data.recipients.length,
                    sent: result?.sent ?? 0,
                    failed: result?.failed ?? 0,
                    skipped: result?.skipped ?? 0
                }
            });

            return { success: (result?.sent ?? 0) > 0, campaignId, delivery: result };
        } catch (error) {
            logger.error('Campaign glass broadcast failure', error);
            await supabase
                .from('marketing_campaigns')
                .update({ status: 'failed' })
                .eq('id', campaignId);
            return { success: false, campaignId };
        }
    }

    private static wrapEmailContent(body: string, ctaUrl?: string, ctaLabel?: string): string {
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <p style="font-size: 16px; line-height: 1.6; color: #333;">${body.replace(/\n/g, '<br>')}</p>
                ${ctaUrl ? `
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="${ctaUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            ${ctaLabel || 'Learn More'}
                        </a>
                    </div>
                ` : ''}
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                    Sent via SOLO SME Marketing Engine.
                </div>
            </div>
        `;
    }

    static async getCampaigns(tenantId: string, client?: SupabaseClient) {
        const supabase = await this.getClient(client);
        const { data } = await supabase
            .from('marketing_campaigns')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });
        return data || [];
    }

    /**
     * Updates real-time interaction metrics for a campaign.
     */
    static async updateCampaignMetrics(campaignId: string, metric: 'open' | 'click', client?: SupabaseClient) {
        const supabase = await this.getClient(client);
        const column = metric === 'open' ? 'open_count' : 'click_count';
        await supabase.rpc('increment_campaign_metric', { 
            campaign_id: campaignId, 
            column_name: column 
        });
    }

    /**
     * Fetches detailed performance metrics for a specific campaign.
     */
    static async getCampaignAnalytics(campaignId: string, client?: SupabaseClient) {
        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .select('recipient_count, open_count, click_count, status, sent_at')
            .eq('id', campaignId)
            .single();

        if (error || !data) return null;

        const ctr = data.recipient_count > 0 ? (data.click_count / data.recipient_count) * 100 : 0;
        const openRate = data.recipient_count > 0 ? (data.open_count / data.recipient_count) * 100 : 0;

        return {
            ...data,
            ctr,
            openRate
        };
    }
}
