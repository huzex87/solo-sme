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
    ai_onboarding_completed BOOLEAN DEFAULT FALSE,
    owner_id UUID,
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
    is_active BOOLEAN DEFAULT TRUE,
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
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'driver')),
    is_active BOOLEAN DEFAULT TRUE,
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
-- RLS CONFIGURATION
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
-- POLICIES (Simplified for Master Execution)
CREATE POLICY "Public read for core schema" ON public.tenants FOR
SELECT USING (true);
CREATE POLICY "Public read for products" ON public.products FOR
SELECT USING (true);
CREATE POLICY "Public read for locations" ON public.store_locations FOR
SELECT USING (true);
CREATE POLICY "Public read for blog" ON public.blog_posts FOR
SELECT USING (true);
-- =============================================================================
-- DONE — FULL INSTITUTIONAL SCHEMA READY.
-- =============================================================================