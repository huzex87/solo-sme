-- ═══════════════════════════════════════════════════════════════════════════
-- SOLO SME — Schema Structural Repair (Institutional V3.0 Alignment)
-- 
-- This migration ensures that the 'tenants' table has all modern configuration
-- columns required by the Storefront and Settings interfaces.
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TENANTS: Add institutional configuration columns
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS branding_config JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS business_config JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS advanced_config JSONB DEFAULT '{}'::jsonb;
-- 2. TENANTS: Add intelligence & feature flags
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS ai_sales_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_receipts_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_reports_enabled BOOLEAN DEFAULT FALSE;
-- 3. TENANTS: Ensure metadata type for products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
-- 4. REFRESH CACHE: Notify PostgREST that schema has changed
-- Supabase automatically reloads the schema cache after migrations, 
-- but this comment serves as a reminder to run this in the SQL Editor if needed.
-- NOTIFY pgrst, 'reload schema';
COMMENT ON COLUMN public.tenants.branding_config IS 'Stores institutional visual identity, colors, and typography settings.';
COMMENT ON COLUMN public.tenants.business_config IS 'Stores operational settings like tax IDs, support lines, and API configurations.';