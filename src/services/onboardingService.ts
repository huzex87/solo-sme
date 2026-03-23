import { ProductService } from './productService';
import { TenantService } from './tenantService';
import { logger } from '@/lib/logger';

export interface AIImportResult {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
}

export interface OnboardingState {
    business_name: string;
    subdomain: string;
    products: AIImportResult[];
    branding: {
        primary: string;
        secondary: string;
    };
}

import { getBaseUrl } from '@/lib/baseUrl';

export class OnboardingService {
    /**
     * Extracts product data from a social media profile using AI.
     * In production, this hits an internal AI microservice.
     */
    static async importFromSocial(socialUrl: string): Promise<OnboardingState> {
        logger.info('AI Profile analysis started', { socialUrl });

        try {
            const url = `${getBaseUrl()}/api/ai/instagram-import`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socialUrl })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.error || `Server responded with ${response.status}`;
                throw new Error(message);
            }

            const data = await response.json();
            if (data.fallback) {
                throw new Error("AI analysis triggered a fallback. Please ensure the link is a public profile or try again later.");
            }

            return data as OnboardingState;
        } catch (error: any) {
            logger.error('AI Onboarding import failed', error);
            throw error; // Propagate the error so the UI can show it
        }
    }

    static async finalizeOnboarding(tenantId: string, state: OnboardingState): Promise<boolean> {
        // 1. Update Tenant Basic Info & Branding (Aligning with new JSONB schema)
        await TenantService.updateTenant(tenantId, {
            name: state.business_name || undefined,
            subdomain: state.subdomain || undefined,
            branding_config: {
                primaryColor: state.branding?.primary || '#00798C',
                accentColor: state.branding?.secondary || '#10b981',
                fontFamily: 'Inter',
                borderRadius: '12px',
                hero: {
                    title: state.business_name,
                    subtitle: `Welcome to ${state.business_name}. Shop our curated collection.`,
                    ctaText: 'View Products'
                }
            }
        });

        // 2. Create Products
        for (const p of state.products) {
            await ProductService.createProduct({
                tenant_id: tenantId,
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                stock_quantity: p.stock,
                image_url: p.image
            });
        }
        return true;
    }

    static async syncCatalog(): Promise<{ added: number; updated: number }> {
        return { added: 0, updated: 0 }; // Start fresh
    }
}
