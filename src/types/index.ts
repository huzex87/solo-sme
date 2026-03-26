export interface WhatsAppAccount {
    id: string;
    tenant_id: string;
    account_name: string;
    phone_number_id: string;
    waba_id?: string;
    access_token: string;
    verify_token?: string;
    app_secret?: string;
    is_default: boolean;
    created_at?: string;
}

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
        logoUrl?: string;
        hero?: {
            title?: string;
            subtitle?: string;
            ctaText?: string;
        };
        // Storefront content fields
        storefrontTitle?: string;
        storefrontDescription?: string;
        storefrontHeroImage?: string;
        checkoutBackgroundColor?: string;
        catalog_title?: string;
        features?: Array<{
            title: string;
            description: string;
            icon: string;
        }>;
    };
    business_config: {
        address?: string;
        phone?: string;
        email?: string;
        taxId?: string;
        supportLine?: string;
        whatsapp_phone_id?: string;
        instagram_page_id?: string;
        paystack_public_key?: string;
        paystack_secret_key?: string;
        flutterwave_public_key?: string;
        flutterwave_secret_key?: string;
        flutterwave_secret_hash?: string;
        preferred_payment_gateway?: 'paystack' | 'flutterwave';
        google_maps_key?: string;
        logistics_base_fee?: string;
        logistics_per_km_fee?: string;
        low_stock_threshold?: string;
        automation_abandoned_enabled?: boolean;
        automation_low_stock_enabled?: boolean;
        automation_digest_enabled?: boolean;
        // Storefront payment methods
        payment_methods?: ('bank_transfer' | 'pay_on_delivery')[];
        bank_name?: string;
        bank_account_number?: string;
        bank_account_name?: string;
        // Social media links
        whatsapp_number?: string;
        instagram_url?: string;
        facebook_url?: string;
        twitter_url?: string;
        tiktok_url?: string;
        // About / business info
        about?: string;
        business_type?: string;
        business_hours?: string;
        whatsapp_checkout_enabled?: boolean;
    };
    whatsapp_accounts?: WhatsAppAccount[];
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
    category?: string;
    phone?: string;
    email?: string;
    description?: string;
    currency: string;
    timezone: string;
    locale: string;
    whatsapp_phone?: string;
    ai_sales_enabled?: boolean;
    ai_receipts_enabled?: boolean;
    ai_reports_enabled?: boolean;
    ai_onboarding_completed: boolean;
    owner_id?: string;
    created_at?: string;
}

export type Permission =
    | 'orders:view' | 'orders:edit' | 'orders:dispatch'
    | 'products:view' | 'products:edit'
    | 'finance:view'
    | 'settings:view' | 'settings:edit'
    | 'staff:view' | 'staff:edit'
    | 'marketing:view' | 'marketing:edit'
    | 'customers:view' | 'customers:edit'
    | 'pos:access' | 'analytics:view';

export interface Profile {
    id: string;
    full_name: string;
    role: 'owner' | 'admin' | 'staff' | 'driver' | 'manager' | 'cashier' | 'analyst';
    permissions?: Permission[];
    avatar_url?: string;
    is_superadmin: boolean;
    created_at?: string;
}

export interface StaffMember {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'manager' | 'cashier' | 'dispatcher' | 'staff' | 'analyst';
    permissions?: Permission[];
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
    cost_price?: number;
    image_url?: string;
    sku?: string;
    barcode?: string;
    weight?: number;
    is_active: boolean;
    is_featured: boolean;
    variants?: Record<string, unknown>[];
    created_at?: string;
}
export interface SettingsConfig {
    paystackPublicKey: string;
    paystackSecretKey: string;
    flutterwavePublicKey: string;
    flutterwaveSecretKey: string;
    flutterwaveSecretHash: string;
    preferredPaymentGateway: 'paystack' | 'flutterwave';
    googleMapsKey: string;
    custom_domain: string;
    fullName: string;
    email: string;
    logisticsBaseFee: string;
    logisticsPerKmFee: string;
    lowStockThreshold: string;
    automationAbandonedEnabled: boolean;
    automationLowStockEnabled: boolean;
    automationDigestEnabled: boolean;
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    logoUrl: string;
    heroTitle: string;
    heroSubtitle: string;
    storeDescription: string;
    whatsappPhoneId: string;
    whatsappAccessToken: string;
    whatsappWabaId: string;
    whatsappVerifyToken: string;
    // Storefront payment
    paymentMethods: ('bank_transfer' | 'pay_on_delivery')[];
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    whatsappCheckoutEnabled: boolean;
}
