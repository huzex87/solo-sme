-- ═══════════════════════════════════════════════════════════════════════════
-- SOLO SME — Row Level Security (RLS) Migration
-- 
-- This migration enables RLS on all tables and creates policies that
-- restrict data access to the authenticated user's tenant only.
--
-- Strategy:
-- 1. profiles.tenant_id links to the auth.uid() → determines the user's tenant
-- 2. Most tables have a tenant_id column → filtered by tenant
-- 3. profiles and tenants use their own ID-based policies
-- 4. Public tables (marketplace_waitlist) have separate read policies
-- ═══════════════════════════════════════════════════════════════════════════
-- Helper function: get the current user's tenant_id from their profile
CREATE OR REPLACE FUNCTION public.get_my_tenant_id() RETURNS UUID AS $$
SELECT tenant_id
FROM public.profiles
WHERE id = auth.uid() $$ LANGUAGE sql SECURITY DEFINER STABLE;
-- ─── 1. PROFILES ───────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR
SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR
INSERT WITH CHECK (id = auth.uid());
-- ─── 2. TENANTS ────────────────────────────────────────────────────────────
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own tenant" ON public.tenants FOR
SELECT USING (id = public.get_my_tenant_id());
CREATE POLICY "Owners can update own tenant" ON public.tenants FOR
UPDATE USING (id = public.get_my_tenant_id());
CREATE POLICY "Anyone can insert tenant on signup" ON public.tenants FOR
INSERT WITH CHECK (true);
-- ─── 3. TENANT-SCOPED TABLES (bulk policy loop) ───────────────────────────
-- All of these tables have a `tenant_id` column
DO $$
DECLARE tbl TEXT;
BEGIN FOR tbl IN
SELECT unnest(
        ARRAY [
    'products', 'orders', 'customers', 'invoices', 'expenses',
    'ledger_entries', 'ledger_transactions', 'inventory_movements',
    'staff_members', 'store_locations', 'notifications', 'receipts',
    'blog_posts', 'loyalty_accounts', 'audit_logs', 'automation_sequences',
    'marketplace_channels', 'whatsapp_message_log', 'whatsapp_phone_bindings'
  ]
    ) LOOP -- Enable RLS
    EXECUTE format(
        'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
        tbl
    );
-- SELECT: only own tenant data
EXECUTE format(
    'CREATE POLICY "Tenant isolation: select" ON public.%I FOR SELECT USING (tenant_id = public.get_my_tenant_id())',
    tbl
);
-- INSERT: must match own tenant
EXECUTE format(
    'CREATE POLICY "Tenant isolation: insert" ON public.%I FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id())',
    tbl
);
-- UPDATE: only own tenant data
EXECUTE format(
    'CREATE POLICY "Tenant isolation: update" ON public.%I FOR UPDATE USING (tenant_id = public.get_my_tenant_id())',
    tbl
);
-- DELETE: only own tenant data
EXECUTE format(
    'CREATE POLICY "Tenant isolation: delete" ON public.%I FOR DELETE USING (tenant_id = public.get_my_tenant_id())',
    tbl
);
END LOOP;
END;
$$;
-- ─── 4. CHAT TABLES ───────────────────────────────────────────────────────
-- conversations and chat_messages may have tenant_id or user-based access
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation: select" ON public.conversations FOR
SELECT USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "Tenant isolation: insert" ON public.conversations FOR
INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation: select" ON public.chat_messages FOR
SELECT USING (
        conversation_id IN (
            SELECT id
            FROM public.conversations
            WHERE tenant_id = public.get_my_tenant_id()
        )
    );
CREATE POLICY "Tenant isolation: insert" ON public.chat_messages FOR
INSERT WITH CHECK (
        conversation_id IN (
            SELECT id
            FROM public.conversations
            WHERE tenant_id = public.get_my_tenant_id()
        )
    );
-- ─── 5. PUBLIC-READ TABLES ─────────────────────────────────────────────────
ALTER TABLE public.marketplace_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read waitlist" ON public.marketplace_waitlist FOR
SELECT USING (true);
CREATE POLICY "Anyone can join waitlist" ON public.marketplace_waitlist FOR
INSERT WITH CHECK (true);
-- ─── 6. MERCHANT FEEDBACK ─────────────────────────────────────────────────
ALTER TABLE public.merchant_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert feedback" ON public.merchant_feedback FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can read own feedback" ON public.merchant_feedback FOR
SELECT USING (tenant_id = public.get_my_tenant_id());
-- ─── 7. SERVICE ROLE BYPASS ───────────────────────────────────────────────
-- The service_role key bypasses RLS automatically.
-- Webhooks (Paystack, WhatsApp) use SUPABASE_SERVICE_ROLE_KEY and are unaffected.
-- This is by design — server-side operations need full table access.