import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ProductService } from './productService';
import { TenantService } from './tenantService';
import { AuditService } from './auditService';
import { logger } from '@/lib/logger';
import { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SocialAccount {
    id: string;
    tenant_id: string;
    platform: 'instagram' | 'whatsapp_business' | 'facebook';
    platform_user_id: string;
    access_token: string;
    account_name: string;
    profile_picture_url?: string;
    followers_count?: number;
    is_connected: boolean;
    last_synced_at?: string;
    created_at: string;
}

export interface InstagramProduct {
    id: string;
    media_id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    image_url: string;
    category: string;
    source_url: string;
    timestamp: string;
}

export interface WhatsAppCatalogItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    image_url: string;
    availability: 'in_stock' | 'out_of_stock';
    retailer_id?: string;
}

export interface SyncResult {
    added: number;
    updated: number;
    skipped: number;
    errors: string[];
    products: ImportedProduct[];
}

export interface ImportedProduct {
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    stock: number;
    source: 'instagram' | 'whatsapp_catalog' | 'ai_generated';
    source_id?: string;
}

export interface ConnectAccountResult {
    success: boolean;
    account?: SocialAccount;
    error?: string;
    authUrl?: string;
}

// ─── Meta Graph API Integration ──────────────────────────────────────────────

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export class SocialImportService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    // ── OAuth Flow ───────────────────────────────────────────────────────────

    /**
     * Generates the Meta OAuth URL for Instagram Business / WhatsApp Business login.
     * This starts the OAuth flow - user gets redirected to Meta to authorize.
     */
    static getInstagramAuthUrl(tenantId: string): string {
        const clientId = process.env.NEXT_PUBLIC_META_APP_ID || '';
        const redirectUri = `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/api/social/callback`;
        const scope = 'instagram_basic,instagram_manage_insights,pages_show_list,catalog_management,business_management';

        const state = btoa(JSON.stringify({ tenantId, platform: 'instagram' }));

        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
    }

    static getWhatsAppBusinessAuthUrl(tenantId: string): string {
        const clientId = process.env.NEXT_PUBLIC_META_APP_ID || '';
        const redirectUri = `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/api/social/callback`;
        const scope = 'whatsapp_business_management,whatsapp_business_messaging,business_management';

        const state = btoa(JSON.stringify({ tenantId, platform: 'whatsapp_business' }));

        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
    }

    /**
     * Exchanges the OAuth code for a long-lived access token and saves the connected account.
     */
    static async handleOAuthCallback(
        code: string,
        state: string,
        client?: SupabaseClient
    ): Promise<ConnectAccountResult> {
        try {
            const { tenantId, platform } = JSON.parse(atob(state));
            const supabase = this.getClient(client);

            // Exchange code for access token
            const tokenRes = await fetch(`${META_GRAPH_URL}/oauth/access_token?` + new URLSearchParams({
                client_id: process.env.META_APP_ID || '',
                client_secret: process.env.META_APP_SECRET || '',
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback`,
                code,
            }));

            const tokenData = await tokenRes.json();

            if (tokenData.error) {
                return { success: false, error: tokenData.error.message };
            }

            // Exchange for long-lived token (60 days)
            const longLivedRes = await fetch(`${META_GRAPH_URL}/oauth/access_token?` + new URLSearchParams({
                grant_type: 'fb_exchange_token',
                client_id: process.env.META_APP_ID || '',
                client_secret: process.env.META_APP_SECRET || '',
                fb_exchange_token: tokenData.access_token,
            }));

            const longLivedData = await longLivedRes.json();
            const accessToken = longLivedData.access_token || tokenData.access_token;

            // Fetch account details based on platform
            let accountInfo;
            if (platform === 'instagram') {
                accountInfo = await this.fetchInstagramAccountInfo(accessToken);
            } else {
                accountInfo = await this.fetchWhatsAppBusinessInfo(accessToken);
            }

            if (!accountInfo) {
                return { success: false, error: 'Failed to fetch account information' };
            }

            // Save to database
            const { data: account, error } = await supabase
                .from('social_accounts')
                .upsert({
                    tenant_id: tenantId,
                    platform,
                    platform_user_id: accountInfo.id,
                    access_token: accessToken,
                    account_name: accountInfo.name,
                    profile_picture_url: accountInfo.profile_picture_url,
                    followers_count: accountInfo.followers_count,
                    is_connected: true,
                    last_synced_at: new Date().toISOString(),
                }, { onConflict: 'tenant_id,platform' })
                .select()
                .single();

            if (error) {
                logger.error('Failed to save social account', error);
                return { success: false, error: 'Failed to save account connection' };
            }

            // Log the connection
            await AuditService.logAction({
                tenant_id: tenantId,
                action: 'social_account_connected',
                entity_type: 'social_account',
                entity_id: account.id,
                metadata: { platform, account_name: accountInfo.name }
            }, client);

            return { success: true, account: account as SocialAccount };
        } catch (err) {
            logger.error('OAuth callback failed', err);
            return { success: false, error: 'Authentication failed' };
        }
    }

    // ── Account Info Fetchers ────────────────────────────────────────────────

    private static async fetchInstagramAccountInfo(accessToken: string) {
        try {
            // Get Facebook pages first
            const pagesRes = await fetch(`${META_GRAPH_URL}/me/accounts?access_token=${accessToken}`);
            const pagesData = await pagesRes.json();

            if (!pagesData.data?.length) return null;

            const page = pagesData.data[0];
            const pageToken = page.access_token;

            // Get Instagram Business Account linked to the page
            const igRes = await fetch(
                `${META_GRAPH_URL}/${page.id}?fields=instagram_business_account&access_token=${pageToken}`
            );
            const igData = await igRes.json();

            if (!igData.instagram_business_account?.id) return null;

            const igId = igData.instagram_business_account.id;

            // Fetch Instagram profile details
            const profileRes = await fetch(
                `${META_GRAPH_URL}/${igId}?fields=username,name,profile_picture_url,followers_count,media_count,biography&access_token=${accessToken}`
            );
            const profile = await profileRes.json();

            return {
                id: igId,
                name: profile.username || profile.name,
                profile_picture_url: profile.profile_picture_url,
                followers_count: profile.followers_count || 0,
                biography: profile.biography,
                page_access_token: pageToken,
            };
        } catch (err) {
            logger.error('Instagram account fetch failed', err);
            return null;
        }
    }

    private static async fetchWhatsAppBusinessInfo(accessToken: string) {
        try {
            // Get WhatsApp Business Accounts
            const wabaRes = await fetch(
                `${META_GRAPH_URL}/me/businesses?access_token=${accessToken}`
            );
            const wabaData = await wabaRes.json();

            if (!wabaData.data?.length) return null;

            const business = wabaData.data[0];

            // Get WhatsApp Business Account under this business
            const waRes = await fetch(
                `${META_GRAPH_URL}/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
            );
            const waData = await waRes.json();

            const waba = waData.data?.[0];
            if (!waba) return null;

            return {
                id: waba.id,
                name: waba.name || business.name,
                profile_picture_url: undefined,
                followers_count: 0,
            };
        } catch (err) {
            logger.error('WhatsApp Business account fetch failed', err);
            return null;
        }
    }

    // ── Product Import from Instagram ────────────────────────────────────────

    /**
     * Fetches recent Instagram posts and uses AI to extract product data.
     * For accounts with Instagram Shopping, it also pulls catalog items.
     */
    static async importFromInstagram(
        tenantId: string,
        options: { limit?: number; useAI?: boolean } = {},
        client?: SupabaseClient
    ): Promise<SyncResult> {
        const { limit = 12, useAI = true } = options;
        const supabase = this.getClient(client);

        const result: SyncResult = { added: 0, updated: 0, skipped: 0, errors: [], products: [] };

        // 1. Get connected Instagram account
        const { data: account } = await supabase
            .from('social_accounts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('platform', 'instagram')
            .eq('is_connected', true)
            .single();

        if (!account) {
            result.errors.push('No connected Instagram account found');
            return result;
        }

        try {
            // 2. Fetch recent media from Instagram Graph API
            const mediaRes = await fetch(
                `${META_GRAPH_URL}/${account.platform_user_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=${limit}&access_token=${account.access_token}`
            );
            const mediaData = await mediaRes.json();

            if (mediaData.error) {
                result.errors.push(`Instagram API error: ${mediaData.error.message}`);
                return result;
            }

            const posts = (mediaData.data || []).filter(
                (m: any) => m.media_type === 'IMAGE' || m.media_type === 'CAROUSEL_ALBUM'
            );

            // 3. Process each post - extract product info using AI or caption parsing
            for (const post of posts) {
                try {
                    const product = useAI
                        ? await this.extractProductWithAI(post, tenantId)
                        : this.extractProductFromCaption(post);

                    if (product) {
                        result.products.push(product);
                        result.added++;
                    } else {
                        result.skipped++;
                    }
                } catch (err) {
                    result.skipped++;
                    logger.error('Failed to process Instagram post', { postId: post.id, err });
                }
            }

            // 4. Update last sync timestamp
            await supabase
                .from('social_accounts')
                .update({ last_synced_at: new Date().toISOString() })
                .eq('id', account.id);

        } catch (err) {
            result.errors.push('Failed to fetch Instagram media');
            logger.error('Instagram import failed', err);
        }

        return result;
    }

    /**
     * Uses Gemini AI to analyze Instagram post image + caption and extract product data.
     */
    private static async extractProductWithAI(
        post: { id: string; caption?: string; media_url?: string; thumbnail_url?: string; permalink: string; timestamp: string },
        tenantId: string
    ): Promise<ImportedProduct | null> {
        try {
            const response = await fetch('/api/ai/social-product-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: post.media_url || post.thumbnail_url,
                    caption: post.caption || '',
                    sourceUrl: post.permalink,
                    tenantId,
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            if (!data.isProduct) return null;

            return {
                name: data.name,
                description: data.description,
                price: data.price,
                category: data.category || 'General',
                image_url: post.media_url || post.thumbnail_url || '',
                stock: data.stock || 20,
                source: 'instagram',
                source_id: post.id,
            };
        } catch {
            return this.extractProductFromCaption(post);
        }
    }

    /**
     * Fallback: Extracts product info from Instagram caption using regex patterns.
     * Looks for price patterns (NGN, N, $), product names, and descriptions.
     */
    private static extractProductFromCaption(
        post: { id: string; caption?: string; media_url?: string; thumbnail_url?: string; permalink: string; timestamp: string }
    ): ImportedProduct | null {
        const caption = post.caption || '';
        if (!caption || caption.length < 10) return null;

        // Look for price patterns common in Nigerian Instagram commerce
        const pricePatterns = [
            /(?:NGN|N|₦)\s*([0-9,]+(?:\.[0-9]{2})?)/i,
            /([0-9,]+(?:\.[0-9]{2})?)\s*(?:naira|NGN)/i,
            /price[:\s]+(?:NGN|N|₦)?\s*([0-9,]+)/i,
            /\$\s*([0-9,]+(?:\.[0-9]{2})?)/,
        ];

        let price = 0;
        for (const pattern of pricePatterns) {
            const match = caption.match(pattern);
            if (match) {
                price = parseFloat(match[1].replace(/,/g, ''));
                break;
            }
        }

        // If no price found, it's probably not a product post
        if (price <= 0) return null;

        // Extract product name (first line or first sentence)
        const lines = caption.split('\n').filter(l => l.trim());
        const name = lines[0]
            ?.replace(/[#@].*/g, '')  // Remove hashtags/mentions
            ?.replace(/(?:NGN|N|₦)\s*[0-9,]+/gi, '') // Remove price
            ?.trim()
            ?.slice(0, 100) || 'Imported Product';

        // Extract description (remaining text without hashtags)
        const description = lines.slice(1, 3)
            .join(' ')
            .replace(/#\w+/g, '')
            .replace(/@\w+/g, '')
            .trim()
            .slice(0, 300) || name;

        // Try to detect category from hashtags
        const hashtags = caption.match(/#(\w+)/g) || [];
        const category = this.detectCategoryFromHashtags(hashtags);

        return {
            name,
            description,
            price,
            category,
            image_url: post.media_url || post.thumbnail_url || '',
            stock: 20, // Default stock
            source: 'instagram',
            source_id: post.id,
        };
    }

    private static detectCategoryFromHashtags(hashtags: string[]): string {
        const categoryMap: Record<string, string[]> = {
            'Fashion': ['fashion', 'style', 'clothing', 'dress', 'outfit', 'wear', 'aso', 'ankara', 'adire', 'agbada'],
            'Beauty': ['beauty', 'skincare', 'makeup', 'cosmetics', 'glow', 'haircare'],
            'Electronics': ['tech', 'gadgets', 'phones', 'electronics', 'laptop'],
            'Food': ['food', 'snacks', 'catering', 'baking', 'restaurant', 'drinks'],
            'Home': ['home', 'decor', 'furniture', 'interior', 'kitchen'],
            'Accessories': ['bags', 'shoes', 'jewelry', 'accessories', 'watches'],
            'Health': ['health', 'fitness', 'wellness', 'supplements', 'organic'],
        };

        const lower = hashtags.map(h => h.replace('#', '').toLowerCase());

        for (const [cat, keywords] of Object.entries(categoryMap)) {
            if (lower.some(h => keywords.some(k => h.includes(k)))) {
                return cat;
            }
        }

        return 'General';
    }

    // ── WhatsApp Business Catalog Import ─────────────────────────────────────

    /**
     * Imports products from a WhatsApp Business Catalog via the Meta Commerce API.
     */
    static async importFromWhatsAppCatalog(
        tenantId: string,
        client?: SupabaseClient
    ): Promise<SyncResult> {
        const supabase = this.getClient(client);
        const result: SyncResult = { added: 0, updated: 0, skipped: 0, errors: [], products: [] };

        // 1. Get connected WhatsApp Business account
        const { data: account } = await supabase
            .from('social_accounts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('platform', 'whatsapp_business')
            .eq('is_connected', true)
            .single();

        if (!account) {
            result.errors.push('No connected WhatsApp Business account found');
            return result;
        }

        try {
            // 2. Get the catalog ID for this WABA
            const catalogRes = await fetch(
                `${META_GRAPH_URL}/${account.platform_user_id}/product_catalogs?access_token=${account.access_token}`
            );
            const catalogData = await catalogRes.json();

            if (!catalogData.data?.length) {
                result.errors.push('No product catalog found on WhatsApp Business account');
                return result;
            }

            const catalogId = catalogData.data[0].id;

            // 3. Fetch products from the catalog
            const productsRes = await fetch(
                `${META_GRAPH_URL}/${catalogId}/products?fields=id,name,description,price,currency,image_url,availability,retailer_id&limit=100&access_token=${account.access_token}`
            );
            const productsData = await productsRes.json();

            if (productsData.error) {
                result.errors.push(`WhatsApp Catalog API error: ${productsData.error.message}`);
                return result;
            }

            // 4. Map catalog items to our product format
            for (const item of (productsData.data || [])) {
                const parsedPrice = typeof item.price === 'string'
                    ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                    : item.price || 0;

                result.products.push({
                    name: item.name,
                    description: item.description || item.name,
                    price: parsedPrice,
                    category: 'General',
                    image_url: item.image_url || '',
                    stock: item.availability === 'in_stock' ? 20 : 0,
                    source: 'whatsapp_catalog',
                    source_id: item.id,
                });
                result.added++;
            }

            // 5. Update last sync timestamp
            await supabase
                .from('social_accounts')
                .update({ last_synced_at: new Date().toISOString() })
                .eq('id', account.id);

        } catch (err) {
            result.errors.push('Failed to fetch WhatsApp Business catalog');
            logger.error('WhatsApp catalog import failed', err);
        }

        return result;
    }

    // ── Finalize Import (Save to DB) ─────────────────────────────────────────

    /**
     * Saves imported products to the store's product catalog.
     * Handles deduplication by checking source_id / name similarity.
     */
    static async finalizeImport(
        tenantId: string,
        products: ImportedProduct[],
        client?: SupabaseClient
    ): Promise<{ saved: number; skipped: number }> {
        let saved = 0;
        let skipped = 0;

        // Fetch existing products to check for duplicates
        const existing = await ProductService.getProducts(tenantId, client);
        const existingNames = new Set(existing.map(p => p.name.toLowerCase().trim()));

        for (const product of products) {
            // Skip duplicates by name
            if (existingNames.has(product.name.toLowerCase().trim())) {
                skipped++;
                continue;
            }

            const created = await ProductService.createProduct({
                tenant_id: tenantId,
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stock_quantity: product.stock,
                image_url: product.image_url,
                is_active: true,
                is_featured: false,
            }, client);

            if (created) {
                saved++;
                existingNames.add(product.name.toLowerCase().trim());
            } else {
                skipped++;
            }
        }

        // Log the import
        await AuditService.logAction({
            tenant_id: tenantId,
            action: 'social_import_completed',
            entity_type: 'product',
            entity_id: tenantId,
            metadata: { saved, skipped, source: products[0]?.source || 'unknown' }
        }, client);

        return { saved, skipped };
    }

    // ── Account Management ───────────────────────────────────────────────────

    /**
     * Gets all connected social accounts for a tenant.
     */
    static async getConnectedAccounts(tenantId: string, client?: SupabaseClient): Promise<SocialAccount[]> {
        if (!isSupabaseConfigured) return [];

        const supabase = this.getClient(client);
        const { data, error } = await supabase
            .from('social_accounts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('is_connected', true)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to fetch social accounts', error);
            return [];
        }

        return (data || []) as SocialAccount[];
    }

    /**
     * Disconnects a social account.
     */
    static async disconnectAccount(
        accountId: string,
        tenantId: string,
        client?: SupabaseClient
    ): Promise<boolean> {
        const supabase = this.getClient(client);

        const { error } = await supabase
            .from('social_accounts')
            .update({ is_connected: false, access_token: '' })
            .eq('id', accountId)
            .eq('tenant_id', tenantId);

        if (error) {
            logger.error('Failed to disconnect account', error);
            return false;
        }

        await AuditService.logAction({
            tenant_id: tenantId,
            action: 'social_account_disconnected',
            entity_type: 'social_account',
            entity_id: accountId,
        }, client);

        return true;
    }
}
