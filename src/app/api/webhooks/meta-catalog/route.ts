import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import redis from '@/lib/redis';

/**
 * Meta Catalog Webhook Handler (Institutional v3.0)
 * Supports:
 * - GET: Webhook verification by Meta
 * - POST: Real-time product updates with Signature Verification & Redis De-duplication
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
        const payloadText = await req.text();
        const signature = req.headers.get('x-hub-signature-256');
        const payload = JSON.parse(payloadText);
        
        logger.info('[Meta Catalog Webhook] Received payload', { object: payload.object });

        // 1. Signature Verification for Institutional Security
        const appSecret = process.env.META_APP_SECRET;
        if (signature && appSecret) {
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', appSecret)
                .update(payloadText)
                .digest('hex');

            const sigBuffer = Buffer.from(signature);
            const expectedBuffer = Buffer.from(expectedSignature);
            
            if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
                logger.warn('[Meta Catalog Webhook] Invalid signature rejected');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const supabase = await createClient();

        // 2. Process the events
        if (payload.object === 'catalog' && payload.entry) {
            for (const entry of payload.entry) {
                const entryId = entry.id;
                
                // Redis De-duplication
                const dedupKey = `meta_catalog:webhook:${entryId}:${payload.time || Date.now()}`;
                try {
                    const alreadySeen = await redis.get(dedupKey);
                    if (alreadySeen) return NextResponse.json({ success: true, status: 'deduplicated' });
                    await redis.set(dedupKey, '1', { ex: 3600 }); // Cache for 1 hour
                } catch (err) {
                    logger.warn('[Meta Catalog Webhook] Redis dedup unavailable', err);
                }

                const changes = entry.changes;
                if (changes) {
                    for (const change of changes) {
                        const { field, value } = change;
                        
                        // Handle product-level changes (Sovereign Sync)
                        if (field === 'products' || field === 'items_batch' || field === 'product_feed') {
                            logger.info(`[Meta Catalog Webhook] Catalog ${entryId} update detected`, { field, value });

                            // Find the tenant linked to this catalog via social_accounts
                            const { data: account } = await supabase
                                .from('social_accounts')
                                .select('tenant_id, access_token')
                                .eq('platform_user_id', String(entryId))
                                .eq('is_connected', true)
                                .single();

                            if (!account) {
                                logger.warn(`[Meta Catalog Webhook] No tenant found for catalog ${entryId}`);
                                continue;
                            }

                            // Process individual product updates from the webhook value
                            const items = Array.isArray(value) ? value : (value?.items || value?.data || []);
                            for (const item of items) {
                                if (!item.id) continue;

                                const productData = {
                                    tenant_id: account.tenant_id,
                                    name: item.name || item.title || 'Untitled Product',
                                    description: item.description || '',
                                    price: typeof item.price === 'string'
                                        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
                                        : (item.price || 0),
                                    image_url: item.image_url || item.image_link || '',
                                    category: item.category || item.product_type || 'General',
                                    is_active: item.availability !== 'out of stock',
                                };

                                // Upsert: update if exists (by name + tenant), insert otherwise
                                const { data: existing } = await supabase
                                    .from('products')
                                    .select('id')
                                    .eq('tenant_id', account.tenant_id)
                                    .eq('name', productData.name)
                                    .single();

                                if (existing) {
                                    await supabase
                                        .from('products')
                                        .update(productData)
                                        .eq('id', existing.id);
                                    logger.info(`[Meta Catalog Webhook] Updated product ${existing.id}`);
                                } else {
                                    await supabase
                                        .from('products')
                                        .insert({ ...productData, stock_quantity: 20 });
                                    logger.info(`[Meta Catalog Webhook] Created product from catalog ${entryId}`);
                                }
                            }
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
