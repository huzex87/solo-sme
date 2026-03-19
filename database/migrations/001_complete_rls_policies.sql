-- SOLO SME: Complete RLS Policies
-- Run this migration against your Supabase database to secure all tables.

-- ============================================================
-- TENANTS TABLE
-- ============================================================

-- Authenticated users can read their own tenant
CREATE POLICY "Users can read own tenant" ON tenants
    FOR SELECT USING (
        id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Public can read basic tenant info (for storefront resolution)
CREATE POLICY "Public can read tenant storefronts" ON tenants
    FOR SELECT USING (true);

-- Only the tenant owner can update their tenant
CREATE POLICY "Owners can update own tenant" ON tenants
    FOR UPDATE USING (
        id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Superadmins can do anything on tenants
CREATE POLICY "Superadmins full access on tenants" ON tenants
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
    );

-- ============================================================
-- PROFILES TABLE
-- ============================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users within same tenant can see each other (for team features)
CREATE POLICY "Tenant members can see each other" ON profiles
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Allow insert on signup (user creates own profile)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Superadmins can read all profiles
CREATE POLICY "Superadmins full access on profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
    );

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================

-- Drop the old overly-broad policy
DROP POLICY IF EXISTS "Users can only access their tenant's products" ON products;

-- Authenticated tenant members can manage their products
CREATE POLICY "Tenant members can manage products" ON products
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Public can view active products (for storefronts)
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

-- ============================================================
-- ORDERS TABLE
-- ============================================================

-- Drop the old overly-broad policy
DROP POLICY IF EXISTS "Users can only access their tenant's orders" ON orders;

-- Tenant members can manage their orders
CREATE POLICY "Tenant members can manage orders" ON orders
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Public can insert orders (customers placing orders on storefront)
CREATE POLICY "Public can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- Add is_superadmin column to profiles if not exists
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_superadmin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_superadmin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ============================================================
-- Add is_active column to products if not exists
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- ============================================================
-- Useful indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON products(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
