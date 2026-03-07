-- =============================================================================
-- Phase 2: Beta Hardening - Merchant Feedback & Security Audit
-- =============================================================================
-- 1. MERCHANT FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.merchant_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT CHECK (
        category IN ('bug', 'feature_request', 'improvement', 'other')
    ),
    rating INTEGER CHECK (
        rating >= 1
        AND rating <= 5
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ENABLE RLS
ALTER TABLE public.merchant_feedback ENABLE ROW LEVEL SECURITY;
-- POLICIES
CREATE POLICY "Tenants can only insert their own feedback" ON public.merchant_feedback FOR
INSERT WITH CHECK (tenant_id::text = auth.jwt()->>'tenant_id');
CREATE POLICY "Tenants can view their own feedback" ON public.merchant_feedback FOR
SELECT USING (tenant_id::text = auth.jwt()->>'tenant_id');
-- 2. SECURITY HARDENING - STRICTER RLS
-- Ensure that SELECT policies for sensitive tables use strict tenant_id matching from the JWT
-- LEDGER ENTRIES
DROP POLICY IF EXISTS "Tenant members can view ledger entries" ON public.ledger_entries;
CREATE POLICY "Tenant members can view ledger entries" ON public.ledger_entries FOR
SELECT USING (tenant_id::text = auth.jwt()->>'tenant_id');
-- CUSTOMERS
DROP POLICY IF EXISTS "Tenant members can view customers" ON public.customers;
CREATE POLICY "Tenant members can view customers" ON public.customers FOR
SELECT USING (tenant_id::text = auth.jwt()->>'tenant_id');
-- ORDERS
DROP POLICY IF EXISTS "Tenant members can view orders" ON public.orders;
CREATE POLICY "Tenant members can view orders" ON public.orders FOR
SELECT USING (tenant_id::text = auth.jwt()->>'tenant_id');
-- PRODUCTS (Update to ensure tenant-specific selection for management)
-- Note: 'Public read' might still be needed for storefront, but we need management policies
CREATE POLICY "Tenant members can manage products" ON public.products FOR ALL USING (tenant_id::text = auth.jwt()->>'tenant_id') WITH CHECK (tenant_id::text = auth.jwt()->>'tenant_id');
-- 3. RATE LIMITING HINTS (Postgres Level)
-- We'll implement middleware rate limiting as planned, but these indices help performance
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON public.orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_created ON public.merchant_feedback(tenant_id, created_at DESC);