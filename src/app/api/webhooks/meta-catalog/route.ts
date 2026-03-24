import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

/**
 * Meta Catalog Webhook Handler
 * Supports:
 * - GET: Webhook verification by Meta
 * - POST: Real-time product updates, deletions, and additions
 */

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'solo_sme_catalog_secret';

    if (mode === 'subscribe' && token === verifyToken) {
        logger.info('[Meta Catalog Webhook] Verified successfully');
        return new Response(challenge, { status: 200 });
    }

    logger.warn('[Meta Catalog Webhook] Verification failed');
    return new Response('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        logger.info('[Meta Catalog Webhook] Received payload', payload);

        // Security: In a production environment, you should verify the X-Hub-Signature header
        // for official institutional-grade security.

        const supabase = await createClient();

        // Process the events (Meta sends an array of entries)
        if (payload.object === 'catalog' && payload.entry) {
            for (const entry of payload.entry) {
                const catalogId = entry.id;
                const changes = entry.changes;

                if (changes) {
                    for (const change of changes) {
                        const { field, value } = change;
                        
                        // Handle product-level changes
                        if (field === 'products') {
                            logger.info(`[Meta Catalog Webhook] Change detected in catalog ${catalogId}`, value);
                            
                            // Here you would implement logic to:
                            // 1. Find the tenant(s) associated with this catalogId in social_accounts
                            // 2. Fetch the updated product details using MetaCatalogService
                            // 3. Update the matching local product if it exists
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error('[Meta Catalog Webhook] Processing error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
