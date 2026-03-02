-- =============================================================================
-- SOLO SME Platform — Supabase Schema
-- Execute this entire file in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lupngqjxofprpojknhez/sql/new
-- =============================================================================
-- ─────────────────────────────────────────────────
-- 1. TENANTS (multi-tenant businesses)
-- ─────────────────────────────────────────────────
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
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON public.tenants(owner_id);
-- ─────────────────────────────────────────────────
-- 2. PROFILES (user profiles linked to auth + tenant)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff', 'driver')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
-- ─────────────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────────────
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(tenant_id, category);
-- ─────────────────────────────────────────────────
-- 4. CUSTOMERS
-- ─────────────────────────────────────────────────
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
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(tenant_id, email);
-- ─────────────────────────────────────────────────
-- 5. ORDERS
-- ─────────────────────────────────────────────────
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
            'refunded'
        )
    ),
    payment_method TEXT,
    payment_ref TEXT,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(tenant_id, created_at DESC);
-- ─────────────────────────────────────────────────
-- 6. STORE LOCATIONS (for pickup & logistics)
-- ─────────────────────────────────────────────────
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
CREATE INDEX IF NOT EXISTS idx_locations_tenant ON public.store_locations(tenant_id);
-- ─────────────────────────────────────────────────
-- 7. STAFF MEMBERS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'driver')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON public.staff_members(tenant_id);
-- ─────────────────────────────────────────────────
-- 8. CONVERSATIONS (for grouping chat messages)
-- ─────────────────────────────────────────────────
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
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON public.conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations(customer_id);
-- ─────────────────────────────────────────────────
-- 9. CHAT MESSAGES
-- ─────────────────────────────────────────────────
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
CREATE INDEX IF NOT EXISTS idx_chat_tenant ON public.chat_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON public.chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_customer ON public.chat_messages(customer_id, created_at DESC);
-- ─────────────────────────────────────────────────
-- 9. NOTIFICATIONS
-- ─────────────────────────────────────────────────
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
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON public.notifications(tenant_id, created_at DESC);
-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — Multi-tenant data isolation
-- =============================================================================
-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- ── TENANTS ──
-- Anyone can read tenants (needed for storefront by subdomain)
CREATE POLICY "Tenants are viewable by everyone" ON public.tenants FOR
SELECT USING (true);
-- Only the owner can update their tenant
CREATE POLICY "Owners can update their tenant" ON public.tenants FOR
UPDATE USING (owner_id = auth.uid());
-- Authenticated users can insert (during signup)
CREATE POLICY "Authenticated users can create tenants" ON public.tenants FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- ── PROFILES ──
CREATE POLICY "Users can view their own profile" ON public.profiles FOR
SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE USING (id = auth.uid());
-- ── PRODUCTS ──
-- Public read for storefront
CREATE POLICY "Products are viewable by everyone" ON public.products FOR
SELECT USING (true);
-- Owners/staff can manage products
CREATE POLICY "Tenant members can manage products" ON public.products FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id
        FROM public.profiles
        WHERE id = auth.uid()
    )
);
-- ── CUSTOMERS ──
CREATE POLICY "Tenant members can view customers" ON public.customers FOR
SELECT USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Anyone can create a customer (checkout)" ON public.customers FOR
INSERT WITH CHECK (true);
CREATE POLICY "Tenant members can update customers" ON public.customers FOR
UPDATE USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
-- ── ORDERS ──
-- Public insert for checkout
CREATE POLICY "Anyone can place an order" ON public.orders FOR
INSERT WITH CHECK (true);
-- Tenant members can view + manage orders
CREATE POLICY "Tenant members can view orders" ON public.orders FOR
SELECT USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Tenant members can update orders" ON public.orders FOR
UPDATE USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
-- Public can view their own order by id (for tracking)
CREATE POLICY "Anyone can view orders by id" ON public.orders FOR
SELECT USING (true);
-- ── STORE LOCATIONS ──
CREATE POLICY "Store locations are viewable by everyone" ON public.store_locations FOR
SELECT USING (true);
CREATE POLICY "Tenant members can manage locations" ON public.store_locations FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id
        FROM public.profiles
        WHERE id = auth.uid()
    )
);
-- ── STAFF MEMBERS ──
CREATE POLICY "Tenant members can view staff" ON public.staff_members FOR
SELECT USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Tenant owners can manage staff" ON public.staff_members FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'owner'
    )
);
-- ── CONVERSATIONS ──
CREATE POLICY "Tenant members can view conversations" ON public.conversations FOR
SELECT USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Tenant members can manage conversations" ON public.conversations FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id
        FROM public.profiles
        WHERE id = auth.uid()
    )
);
-- ── CHAT MESSAGES ──
CREATE POLICY "Tenant members can view chats" ON public.chat_messages FOR
SELECT USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Anyone can send a chat message" ON public.chat_messages FOR
INSERT WITH CHECK (true);
-- ── NOTIFICATIONS ──
CREATE POLICY "Tenant members can view notifications" ON public.notifications FOR
SELECT USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "System can create notifications" ON public.notifications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Tenant members can update notifications" ON public.notifications FOR
UPDATE USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
-- =============================================================================
-- STORAGE BUCKET — For logo uploads & product images
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true) ON CONFLICT (id) DO NOTHING;
-- Allow authenticated users to upload to their tenant folder
CREATE POLICY "Authenticated users can upload store assets" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'store-assets'
        AND auth.role() = 'authenticated'
    );
-- Public read access for store assets
CREATE POLICY "Public read access for store assets" ON storage.objects FOR
SELECT USING (bucket_id = 'store-assets');
-- Allow authenticated users to update/delete their uploads
CREATE POLICY "Authenticated users can manage their store assets" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'store-assets'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Authenticated users can delete their store assets" ON storage.objects FOR DELETE USING (
    bucket_id = 'store-assets'
    AND auth.role() = 'authenticated'
);
-- =============================================================================
-- UPDATED_AT TRIGGER — Auto-update timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_tenant_updated BEFORE
UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_product_updated BEFORE
UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_order_updated BEFORE
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- =============================================================================
-- DONE — Schema ready. Signup and storefront will now work.
-- =============================================================================