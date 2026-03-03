-- SOLO SME PLATFORM - PRODUCTION SETUP MIGRATIONS
-- This script adds the necessary tables for advanced features (Loyalty, Automation, Notifications)
-- 1. LOYALTY ACCOUNTS
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'Bronze',
    history JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(customer_id, tenant_id)
);
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can manage their customers' loyalty accounts" ON loyalty_accounts FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id
        FROM profiles
        WHERE id = auth.uid()
    )
);
-- 2. AUTOMATION SEQUENCES
CREATE TABLE IF NOT EXISTS automation_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    last_ran TIMESTAMP WITH TIME ZONE,
    total_sent INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE automation_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can manage their automation sequences" ON automation_sequences FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id
        FROM profiles
        WHERE id = auth.uid()
    )
);
-- 3. STORE LOCATIONS (for Pickup & Logistics)
CREATE TABLE IF NOT EXISTS store_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can manage their store locations" ON store_locations FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id
        FROM profiles
        WHERE id = auth.uid()
    )
);