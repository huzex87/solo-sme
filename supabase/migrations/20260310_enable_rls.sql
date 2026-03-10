-- ═══════════════════════════════════════════════════════════════════════════
-- SOLO SME — Row Level Security (RLS) Migration
-- 
-- This migration enables RLS on all tables and creates policies that
-- restrict data access to the authenticated user's tenant only.
--
-- Uses DROP POLICY IF EXISTS to be idempotent (safe to re-run).
-- ═══════════════════════════════════════════════════════════════════════════
-- Helper function: get the current user's tenant_id from their profile
CREATE OR REPLACE FUNCTION public.get_my_tenant_id() RETURNS UUID AS $$
SELECT tenant_id
FROM public.profiles
WHERE id = auth.uid() $$ LANGUAGE sql SECURITY DEFINER STABLE;
-- ─── 1. PROFILES ───────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR
SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR
INSERT WITH CHECK (id = auth.uid());
-- ─── 2. TENANTS ────────────────────────────────────────────────────────────
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own tenant" ON public.tenants;
CREATE POLICY "Users can read own tenant" ON public.tenants FOR
SELECT USING (id = public.get_my_tenant_id());
DROP POLICY IF EXISTS "Owners can update own tenant" ON public.tenants;
CREATE POLICY "Owners can update own tenant" ON public.tenants FOR
UPDATE USING (id = public.get_my_tenant_id());
DROP POLICY IF EXISTS "Anyone can insert tenant on signup" ON public.tenants;
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
    ) LOOP -- Skip tables that don't exist yet
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
            AND table_name = tbl
    ) THEN RAISE NOTICE 'Skipping table % (does not exist)',
    tbl;
CONTINUE;
END IF;
-- Enable RLS
EXECUTE format(
    'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
    tbl
);
-- Drop existing policies if any
EXECUTE format(
    'DROP POLICY IF EXISTS "Tenant isolation: select" ON public.%I',
    tbl
);
EXECUTE format(
    'DROP POLICY IF EXISTS "Tenant isolation: insert" ON public.%I',
    tbl
);
EXECUTE format(
    'DROP POLICY IF EXISTS "Tenant isolation: update" ON public.%I',
    tbl
);
EXECUTE format(
    'DROP POLICY IF EXISTS "Tenant isolation: delete" ON public.%I',
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
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name = 'conversations'
) THEN
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
EXECUTE 'DROP POLICY IF EXISTS "Tenant isolation: select" ON public.conversations';
EXECUTE 'CREATE POLICY "Tenant isolation: select" ON public.conversations FOR SELECT USING (tenant_id = public.get_my_tenant_id())';
EXECUTE 'DROP POLICY IF EXISTS "Tenant isolation: insert" ON public.conversations';
EXECUTE 'CREATE POLICY "Tenant isolation: insert" ON public.conversations FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id())';
ELSE RAISE NOTICE 'Skipping conversations (does not exist)';
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name = 'chat_messages'
) THEN
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
EXECUTE 'DROP POLICY IF EXISTS "Tenant isolation: select" ON public.chat_messages';
EXECUTE 'CREATE POLICY "Tenant isolation: select" ON public.chat_messages FOR SELECT USING (tenant_id = public.get_my_tenant_id())';
EXECUTE 'DROP POLICY IF EXISTS "Tenant isolation: insert" ON public.chat_messages';
EXECUTE 'CREATE POLICY "Tenant isolation: insert" ON public.chat_messages FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id())';
ELSE RAISE NOTICE 'Skipping chat_messages (does not exist)';
END IF;
END $$;
-- ─── 5. PUBLIC-READ TABLES ─────────────────────────────────────────────────
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_waitlist'
) THEN
ALTER TABLE public.marketplace_waitlist ENABLE ROW LEVEL SECURITY;
EXECUTE 'DROP POLICY IF EXISTS "Anyone can read waitlist" ON public.marketplace_waitlist';
EXECUTE 'CREATE POLICY "Anyone can read waitlist" ON public.marketplace_waitlist FOR SELECT USING (true)';
EXECUTE 'DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.marketplace_waitlist';
EXECUTE 'CREATE POLICY "Anyone can join waitlist" ON public.marketplace_waitlist FOR INSERT WITH CHECK (true)';
ELSE RAISE NOTICE 'Skipping marketplace_waitlist (does not exist)';
END IF;
END $$;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name = 'merchant_feedback'
) THEN
ALTER TABLE public.merchant_feedback ENABLE ROW LEVEL SECURITY;
EXECUTE 'DROP POLICY IF EXISTS "Users can insert feedback" ON public.merchant_feedback';
EXECUTE 'CREATE POLICY "Users can insert feedback" ON public.merchant_feedback FOR INSERT WITH CHECK (true)';
EXECUTE 'DROP POLICY IF EXISTS "Users can read own feedback" ON public.merchant_feedback';
EXECUTE 'CREATE POLICY "Users can read own feedback" ON public.merchant_feedback FOR SELECT USING (tenant_id = public.get_my_tenant_id())';
ELSE RAISE NOTICE 'Skipping merchant_feedback (does not exist)';
END IF;
END $$;
-- ─── 7. SERVICE ROLE BYPASS ───────────────────────────────────────────────
-- The service_role key bypasses RLS automatically.
-- Webhooks (Paystack, WhatsApp) use SUPABASE_SERVICE_ROLE_KEY and are unaffected.