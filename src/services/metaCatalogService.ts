import { logger } from '@/lib/logger';

export interface MetaCatalog {
    id: string;
    name: string;
    vertical: string;
    product_count: number;
}

export interface MetaProduct {
    id: string;
    name: string;
    description: string;
    price: string;
    currency: string;
    image_url: string;
    availability: string;
    condition: string;
    brand: string;
    retailer_id: string;
}

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export class MetaCatalogService {
    /**
     * Lists catalogs owned by the user or business associated with the access token.
     */
    static async listCatalogs(accessToken: string): Promise<MetaCatalog[]> {
        try {
            // First get the business accounts the user has access to
            const businessRes = await fetch(`${META_GRAPH_URL}/me/businesses?access_token=${accessToken}`);
            const businessData = await businessRes.json();
            
            if (businessData.error) {
                logger.error('[MetaCatalogService] Failed to fetch businesses', businessData.error);
                throw new Error(businessData.error.message);
            }

            const catalogs: MetaCatalog[] = [];
            
            // Get catalogs for each business
            for (const business of (businessData.data || [])) {
                const catalogRes = await fetch(
                    `${META_GRAPH_URL}/${business.id}/owned_product_catalogs?fields=id,name,vertical,product_count&access_token=${accessToken}`
                );
                const catalogData = await catalogRes.json();
                
                if (catalogData.data) {
                    catalogs.push(...catalogData.data);
                }
            }

            // Also check for catalogs directly owned by the user (rare but possible)
            const userCatalogRes = await fetch(
                `${META_GRAPH_URL}/me/product_catalogs?fields=id,name,vertical,product_count&access_token=${accessToken}`
            );
            const userCatalogData = await userCatalogRes.json();
            if (userCatalogData.data) {
                userCatalogData.data.forEach((c: MetaCatalog) => {
                    if (!catalogs.find(exist => exist.id === c.id)) {
                        catalogs.push(c);
                    }
                });
            }

            return catalogs;
        } catch (error) {
            logger.error('[MetaCatalogService] Catalog listing failed', error);
            throw error;
        }
    }

    /**
     * Fetches products from a specific Meta Catalog.
     */
    static async getCatalogProducts(catalogId: string, accessToken: string, limit: number = 100): Promise<MetaProduct[]> {
        try {
            const url = `${META_GRAPH_URL}/${catalogId}/products?fields=id,name,description,price,currency,image_url,availability,condition,brand,retailer_id&limit=${limit}&access_token=${accessToken}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                logger.error('[MetaCatalogService] Failed to fetch products', data.error);
                throw new Error(data.error.message);
            }

            return (data.data || []) as MetaProduct[];
        } catch (error) {
            logger.error('[MetaCatalogService] Product fetch failed', error);
            throw error;
        }
    }
}
