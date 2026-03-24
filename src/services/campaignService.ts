import { createClient } from '@/lib/supabase/client';
import { WhatsAppService } from './whatsappService';
import { EmailService } from './emailService';
import { logger } from '@/lib/logger';

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
}

export class CampaignService {
    private static supabase = createClient();

    /**
     * Persists and launches a marketing campaign across selected channels.
     */
    static async launchCampaign(tenantId: string, data: CampaignData): Promise<{ success: boolean; campaignId?: string }> {
        logger.info('Launching marketing campaign', { tenantId, channel: data.channel });

        // 1. Create campaign record
        const { data: campaign, error: createError } = await this.supabase
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
            let result;
            if (data.channel === 'whatsapp') {
                // If template-based, we'd use sendBroadcast; currently using text/image for custom AI content
                // Mapping custom AI content to standard message
                const message = `${data.content.body}${data.content.ctaUrl ? `\n\n${data.content.ctaLabel}: ${data.content.ctaUrl}` : ''}`;

                const broadcastResults = await Promise.all(
                    data.recipients.map(to =>
                        data.content.imageUrl
                            ? WhatsAppService.sendImage(to, data.content.imageUrl, message)
                            : WhatsAppService.sendText(to, message)
                    )
                );
                result = { sent: broadcastResults.length, failed: 0 };
            } else if (data.channel === 'email') {
                result = await EmailService.sendBroadcast(
                    data.recipients,
                    data.content.subject || data.title,
                    this.wrapEmailContent(data.content.body, data.content.ctaUrl, data.content.ctaLabel)
                );
            }

            // 3. Update status to sent
            await this.supabase
                .from('marketing_campaigns')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    recipient_count: result?.sent || data.recipients.length
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
                    recipient_count: data.recipients.length
                }
            });

            return { success: true, campaignId };
        } catch (error) {
            logger.error('Campaign glass broadcast failure', error);
            await this.supabase
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

    static async getCampaigns(tenantId: string) {
        const { data, error } = await this.supabase
            .from('marketing_campaigns')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });
        return data || [];
    }

    /**
     * Updates real-time interaction metrics for a campaign.
     */
    static async updateCampaignMetrics(campaignId: string, metric: 'open' | 'click') {
        const column = metric === 'open' ? 'open_count' : 'click_count';
        await this.supabase.rpc('increment_campaign_metric', { 
            campaign_id: campaignId, 
            column_name: column 
        });
    }

    /**
     * Fetches detailed performance metrics for a specific campaign.
     */
    static async getCampaignAnalytics(campaignId: string) {
        const { data, error } = await this.supabase
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
