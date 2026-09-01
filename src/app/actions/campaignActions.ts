'use server';

import { CampaignService, CampaignData, CampaignDelivery, CampaignTemplate, ServiceWindowBreakdown } from '@/services/campaignService';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Campaign server actions.
 *
 * Campaign launching MUST run on the server: sending needs META_WHATSAPP_ACCESS_TOKEN,
 * the Meta Graph endpoint is not callable from a browser (CORS, and the token must
 * never reach the client), and the service-window lookup uses the Supabase admin
 * client. CampaignStudio previously called CampaignService directly from a client
 * component, so WhatsApp campaigns could never have delivered.
 */

export async function launchCampaignAction(
    tenantId: string,
    data: CampaignData
): Promise<{ success: boolean; campaignId?: string; delivery?: CampaignDelivery; error?: string }> {
    if (!tenantId) return { success: false, error: 'Missing tenant.' };
    if (!data?.recipients?.length) return { success: false, error: 'No recipients.' };

    try {
        const supabase = await createAdminClient();
        return await CampaignService.launchCampaign(tenantId, data, supabase);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Campaign launch failed.';
        console.error('[launchCampaignAction]', err);
        return { success: false, error: message };
    }
}

/**
 * Approved templates the merchant can pick as the out-of-window fallback.
 * Read live from Meta, so this must stay server-side — it needs the access token.
 */
export async function getApprovedTemplatesAction(tenantId?: string): Promise<CampaignTemplate[]> {
    try {
        return await CampaignService.getApprovedTemplates(tenantId);
    } catch (err) {
        console.error('[getApprovedTemplatesAction]', err);
        return [];
    }
}

/** How the recipient list splits across the 24h service window, for pre-launch display. */
export async function getServiceWindowBreakdownAction(
    recipients: string[],
    tenantId: string
): Promise<ServiceWindowBreakdown> {
    try {
        return await CampaignService.getServiceWindowBreakdown(recipients, tenantId);
    } catch (err) {
        console.error('[getServiceWindowBreakdownAction]', err);
        // Fail closed: assume nobody is reachable free-form.
        return { inWindow: 0, outOfWindow: recipients.length };
    }
}
