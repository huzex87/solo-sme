import { ProductService } from './productService';
import { TenantService } from './tenantService';

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

export class OnboardingService {
    /**
     * Extracts product data from a social media profile using AI.
     * In production, this hits an internal AI microservice.
     */
    static async importFromSocial(socialUrl: string): Promise<OnboardingState> {
        console.log(`[SOLO AI] Analyzing profile: ${socialUrl}`);

        try {
            const response = await fetch('/api/ai/instagram-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socialUrl })
            });

            if (response.ok) {
                const data = await response.json();
                if (!data.fallback) {
                    return data as OnboardingState;
                }
            }
        } catch (error) {
            console.error('[OnboardingService] Failed to fetch AI import', error);
        }

        // Fallback for demo or when API is unavailable
        if (socialUrl.includes('instagram.com/demo') || socialUrl.includes('artisan')) {
            return {
                business_name: 'Artisan Soul',
                subdomain: 'artisan-soul',
                products: [
                    {
                        name: 'Midnight Silk Scarf',
                        description: 'Hand-dyed 100% silk scarf with traditional patterns.',
                        price: 15500,
                        category: 'Accessories',
                        stock: 15,
                        image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800'
                    }
                ],
                branding: { primary: '#1A1A1A', secondary: '#D4AF37' }
            };
        }

        return {
            business_name: '',
            subdomain: '',
            products: [],
            branding: { primary: '#00798C', secondary: '#10b981' }
        };
    }

    static async finalizeOnboarding(tenantId: string, state: OnboardingState): Promise<boolean> {
        // 1. Update Tenant Basic Info & Branding
        await TenantService.updateTenant(tenantId, {
            name: state.business_name || undefined,
            subdomain: state.subdomain || undefined,
            // @ts-expect-error - branding_config is partially defined here
            branding_config: {
                primaryColor: state.branding?.primary || '#00798C',
                borderRadius: '12px',
                hero: {
                    title: state.business_name,
                    subtitle: `Welcome to ${state.business_name}. Shop our curated collection.`,
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

    static async syncCatalog(socialUrl: string): Promise<{ added: number; updated: number }> {
        return { added: 0, updated: 0 }; // Start fresh
    }
}
