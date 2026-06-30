-- =============================================================================
-- SOLO SME Platform — Supabase Schema
-- =============================================================================
-- 1. TENANTS
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT NOT NULL UNIQUE,
    brand_color TEXT DEFAULT '#6366f1',
    accent_color TEXT DEFAULT '#14b8a6',
    logo_url TEXT,
    logo_file_path TEXT,
    font_family TEXT DEFAULT 'Inter',
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_cta_text TEXT DEFAULT 'Explore Collection',
    layout_style TEXT DEFAULT 'grid' CHECK (layout_style IN ('grid', 'list', 'masonry')),
    store_description TEXT,
    currency TEXT DEFAULT 'NGN',
    timezone TEXT DEFAULT 'Africa/Lagos',
    locale TEXT DEFAULT 'en-NG',
    ai_onboarding_completed BOOLEAN DEFAULT FALSE,
    owner_id UUID,
    branding_config JSONB DEFAULT '{}'::jsonb,
    business_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    platform_tier TEXT DEFAULT 'starter',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff', 'driver')),
    avatar_url TEXT,
    is_superadmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'General',
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    sku TEXT,
    barcode TEXT,
    cost_price NUMERIC(12, 2) DEFAULT 0,
    weight NUMERIC(10, 2) DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spend NUMERIC(12, 2) DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 5. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    delivery_method TEXT DEFAULT 'delivery' CHECK (delivery_method IN ('delivery', 'pickup')),
    delivery_fee NUMERIC(12, 2) DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 4) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'paid',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
            'abandoned'
        )
    ),
    channel TEXT DEFAULT 'online' CHECK (channel IN ('online', 'pos', 'marketplace')),
    payment_method TEXT,
    payment_ref TEXT,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 6. STORE LOCATIONS
CREATE TABLE IF NOT EXISTS public.store_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_pickup BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 7. STAFF MEMBERS
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'cashier', 'dispatcher', 'staff', 'analyst', 'driver')),
    is_active BOOLEAN DEFAULT TRUE,
    permissions TEXT[] DEFAULT '{}',
    invitation_token TEXT,
    invited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 8. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (
        channel IN ('web', 'whatsapp', 'instagram', 'email')
    ),
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 9. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id),
    channel TEXT DEFAULT 'web',
    sender TEXT DEFAULT 'customer' CHECK (sender IN ('customer', 'owner', 'ai')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info' CHECK (
        type IN ('info', 'warning', 'success', 'error', 'order')
    ),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 11. AUTOMATION SEQUENCES
CREATE TABLE IF NOT EXISTS public.automation_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (
        trigger_type IN (
            'abandoned_cart',
            'recall_dormant',
            'vip_thank_you'
        )
    ),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    total_sent INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    last_ran_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 12. INVENTORY MOVEMENTS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.store_locations(id),
    delta INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    -- 'sale', 'restock', 'adjustment', 'return', 'transfer'
    channel VARCHAR(50) NOT NULL,
    -- 'online', 'pos', 'marketplace'
    staff_id UUID,
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 13. LOYALTY ACCOUNTS
CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    points INTEGER DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'Bronze',
    history JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, customer_id)
);
-- 14. LEDGER ENTRIES (FINANCIAL TRACEABILITY)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id),
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    -- 'revenue', 'expense', 'delivery_fee', 'commission', 'payout'
    status VARCHAR(20) DEFAULT 'pending',
    provider VARCHAR(50),
    reference TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 15. MARKETPLACE CHANNELS
CREATE TABLE IF NOT EXISTS public.marketplace_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'disconnected',
    last_sync TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(tenant_id, type)
);
-- 16. BLOG POSTS (DYNAMIC CONTENT)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT,
    excerpt TEXT,
    category VARCHAR(50),
    featured_image TEXT,
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);
-- 18. WHATSAPP LAYER
CREATE TABLE IF NOT EXISTS public.whatsapp_phone_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    bound_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.whatsapp_message_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    intent VARCHAR(50),
    message_preview TEXT,
    action_taken VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 17. MERCHANT AUDIT LOGS (OBSERVABILITY)
CREATE TABLE IF NOT EXISTS public.merchant_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_id UUID,
    -- Staff or Owner ID
    action VARCHAR(100) NOT NULL,
    -- 'update_price', 'change_role', 'delete_product'
    entity_type VARCHAR(50) NOT NULL,
    -- 'product', 'staff', 'config'
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 18. TAX RULES (DYNAMIC COMPLIANCE)
CREATE TABLE IF NOT EXISTS public.tax_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC(5, 4) NOT NULL,
    -- e.g. 0.0750 for 7.5%
    is_active BOOLEAN DEFAULT TRUE,
    country_code TEXT DEFAULT 'NG',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 19. MARKETING CAMPAIGNS (TRACKING & ANALYTICS)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'scheduled',
            'sending',
            'sent',
            'failed'
        )
    ),
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 20. LOGISTICS PROVIDERS (EXTERNAL INTEGRATION)
CREATE TABLE IF NOT EXISTS public.logistics_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider_key TEXT NOT NULL,
    -- e.g. 'gigl', 'sendbox', 'fedex'
    provider_name TEXT NOT NULL,
    api_key TEXT,
    webhook_secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, provider_key)
);
--- 21. SOCIAL ACCOUNTS (INSTAGRAM / WHATSAPP / FACEBOOK)
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'whatsapp_business', 'facebook')),
    platform_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    account_name TEXT NOT NULL,
    profile_picture_url TEXT,
    followers_count INTEGER DEFAULT 0,
    is_connected BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, platform)
);

-- 22. PLATFORM TICKETS (SUPER ADMIN SUPPORT)
CREATE TABLE IF NOT EXISTS public.platform_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS CONFIGURATION
ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view audit logs" ON public.merchant_audit_log FOR
SELECT USING (tenant_id::text = auth.jwt()->>'tenant_id');
-- RLS CONFIGURATION (Existing)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
-- RLS CONFIGURATION (Hardened Phase II)
-- Helper function: get the current user's tenant_id from their profile
CREATE OR REPLACE FUNCTION public.get_my_tenant_id() RETURNS UUID AS $$
SELECT tenant_id
FROM public.profiles
WHERE id = auth.uid() $$ LANGUAGE sql SECURITY DEFINER STABLE;
-- Enable RLS on ALL tables
DO $$
DECLARE tbl TEXT;
BEGIN FOR tbl IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE' LOOP 
        BEGIN
            EXECUTE format(
                'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
                tbl
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not enable RLS on table %', tbl;
        END;
    END LOOP;
END;
$$;
-- Global Policies (Tenant Isolation)
-- Note: These policies ensure that users can only interact with data belonging to their own tenant.
-- Profiles: Users see only their own
CREATE POLICY "Users can read own profile" ON public.profiles FOR
SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Allow signup insert" ON public.profiles;
CREATE POLICY "Allow signup insert" ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- Tenants: Public can see core info (for storefronts), but only owners update
DROP POLICY IF EXISTS "Public read for core schema" ON public.tenants;
CREATE POLICY "Public read for core schema" ON public.tenants FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Allow signup insert" ON public.tenants;
CREATE POLICY "Allow signup insert" ON public.tenants FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Owners can update their own tenant" ON public.tenants;
CREATE POLICY "Owners can update their own tenant" ON public.tenants FOR
UPDATE USING (id = public.get_my_tenant_id());
-- Standard Policy Template for Tenant Tables (Products, Orders, Customers, etc.)
-- These policies ensure absolute data isolation between tenants.
DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'products', 'orders', 'customers', 'categories', 'coupons', 
        'tax_rules', 'loyalty_accounts', 'automation_sequences', 
        'marketplace_channels', 'social_accounts', 'store_locations', 
        'staff_members', 'conversations', 'chat_messages', 'notifications', 
        'inventory_movements', 'ledger_entries', 'blog_posts', 
        'whatsapp_phone_bindings', 'whatsapp_message_log', 'logistics_providers',
        'marketing_campaigns', 'platform_tickets'
    ];
BEGIN 
    FOR t IN SELECT unnest(tables) LOOP 
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('DROP POLICY IF EXISTS "Tenant isolation" ON public.%I', t);
            EXECUTE format('CREATE POLICY "Tenant isolation" ON public.%I FOR ALL USING (tenant_id = public.get_my_tenant_id())', t);
        EXCEPTION WHEN OTHERS THEN
            -- Skip if table does not exist in the database
            RAISE NOTICE 'Skipping tenant isolation policy for non-existent table: %', t;
        END;
    END LOOP; 
END; 
$$;

-- Specialized Public Policies for Storefront Discovery
-- DROP first so schema can be re-applied idempotently.
DROP POLICY IF EXISTS "Public read for active products" ON public.products;
CREATE POLICY "Public read for active products" ON public.products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public read for active tenants" ON public.tenants;
CREATE POLICY "Public read for active tenants" ON public.tenants FOR SELECT USING (is_active = true);
-- Grant anon role SELECT for storefront rendering
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.tenants TO anon;

-- Apply categories policies conditionally if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public read for active categories" ON public.categories';
        EXECUTE 'CREATE POLICY "Public read for active categories" ON public.categories FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.categories TO anon';
    END IF;
END;
$$;

-- =============================================================================
-- ATOMIC FUNCTIONS (INSTITUTIONAL GRADE)
-- =============================================================================
-- Atomic Loyalty Point Update
CREATE OR REPLACE FUNCTION public.add_loyalty_points(
        p_tenant_id UUID,
        p_customer_id UUID,
        p_points INTEGER,
        p_action_type TEXT,
        p_description TEXT,
        p_tier TEXT
    ) RETURNS VOID AS $$ BEGIN
INSERT INTO public.loyalty_accounts (
        tenant_id,
        customer_id,
        points,
        tier,
        history,
        updated_at
    )
VALUES (
        p_tenant_id,
        p_customer_id,
        p_points,
        p_tier,
        jsonb_build_array(
            jsonb_build_object(
                'id',
                'act-' || extract(
                    epoch
                    from now()
                )::text || '-' || floor(random() * 1000)::text,
                'type',
                p_action_type,
                'points',
                p_points,
                'description',
                p_description,
                'date',
                now()
            )
        ),
        now()
    ) ON CONFLICT (tenant_id, customer_id) DO
UPDATE
SET points = public.loyalty_accounts.points + p_points,
    tier = p_tier,
    history = jsonb_build_array(
        jsonb_build_object(
            'id',
            'act-' || extract(
                epoch
                from now()
            )::text || '-' || floor(random() * 1000)::text,
            'type',
            p_action_type,
            'points',
            p_points,
            'description',
            p_description,
            'date',
            now()
        )
    ) || public.loyalty_accounts.history,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================================================
-- DONE — FULL INSTITUTIONAL SCHEMA (HARDENED v3.0) READY.
-- =============================================================================