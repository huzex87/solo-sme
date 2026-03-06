export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    custom_domain?: string;
    branding_config: {
        primaryColor: string;
        accentColor: string;
        fontFamily: string;
        glassLevel?: 'none' | 'low' | 'high';
        borderRadius?: string;
        theme?: 'light' | 'dark' | 'glass';
        // Storefront content fields
        storefrontTitle?: string;
        storefrontDescription?: string;
        storefrontHeroImage?: string;
        checkoutBackgroundColor?: string; // Added based on instruction to update checkout styles to use primaryColor
        hero?: {
            title?: string;
            subtitle?: string;
            ctaText?: string;
        };
    };
    business_config: {
        address?: string;
        phone?: string;
        email?: string;
        taxId?: string;
        supportLine?: string;
        whatsapp_phone_id?: string;
        instagram_page_id?: string;
    };
    seo_config: {
        metaTitle?: string;
        metaDescription?: string;
        ogImage?: string;
        favicon?: string;
        keywords?: string[];
    };
    advanced_config: {
        googleAnalyticsId?: string;
        metaPixelId?: string;
        customScripts?: { tag: string; content: string; location: 'head' | 'body' }[];
    };
    logo_url?: string;
    currency: string;
    timezone: string;
    locale: string;
    ai_onboarding_completed: boolean;
    owner_id?: string;
    created_at?: string;
}

export interface StaffMember {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'manager' | 'cashier' | 'dispatcher' | 'staff';
    status: 'active' | 'inactive';
    lastActive: string;
}

export interface Product {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock_quantity: number;
    image_url?: string;
    sku?: string;
    barcode?: string;
    variants?: Record<string, unknown>[];
    created_at?: string;
}
