-- =============================================================================
-- MIGRATION: Fix storefront RLS + add cost_price to products
-- Date: 2026-03-30
-- =============================================================================

-- 1. Add cost_price column (was missing from original schema but used by frontend)
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0;

-- 2. Fix public storefront read policies
--    Supabase evaluates multiple permissive policies with OR logic,
--    but re-running the schema without DROP causes duplicate policy errors.
--    Ensure the public read policies exist cleanly.

DROP POLICY IF EXISTS "Public read for active products" ON public.products;
CREATE POLICY "Public read for active products"
    ON public.products
    FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Public read for active categories" ON public.categories;
CREATE POLICY "Public read for active categories"
    ON public.categories
    FOR SELECT
    USING (true);

-- 3. Ensure storefront can read tenant info (name, logo, subdomain)
--    Unauthenticated users need this to render the store page.
DROP POLICY IF EXISTS "Public read for active tenants" ON public.tenants;
CREATE POLICY "Public read for active tenants"
    ON public.tenants
    FOR SELECT
    USING (is_active = true);

-- 4. Grant anon role SELECT on the tables used by the storefront
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.tenants TO anon;
