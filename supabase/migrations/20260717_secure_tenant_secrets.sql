-- =============================================================================
-- MIGRATION: Secure tenant payment secrets against anonymous exposure
-- Date: 2026-07-17
-- Severity: P0 (payment integrity / secret exposure)
-- =============================================================================
--
-- PROBLEM
-- -------
-- The `tenants` table carries a `business_config` JSONB column that stores
-- MERCHANT-HELD SECRETS: paystack_secret_key, flutterwave_secret_key,
-- flutterwave_secret_hash, meta_access_token, meta_app_secret, google_maps_key,
-- whatsapp_access_token, etc.
--
-- Prior migrations created permissive anon SELECT policies on `tenants`
-- (`USING (true)` and `USING (is_active = true)`) and `GRANT SELECT ON tenants
-- TO anon`. Because the Supabase anon key ships in the browser bundle, ANY
-- anonymous visitor could issue `select('*')` against `tenants` and read every
-- merchant's live payment secret keys. This is the exact vulnerability flagged
-- in previous audits, re-introduced.
--
-- Postgres RLS is row-level, not column-level, so we cannot hide a single JSONB
-- column with a policy. The fix is to (1) revoke anon access to the base table,
-- and (2) expose a purpose-built VIEW that projects only non-secret fields
-- (with secret keys stripped out of business_config) to the anon role.
--
-- Server-side code that legitimately needs the secrets (payment initialization,
-- payment verification, refunds, webhook signature checks) uses the
-- service-role admin client, which bypasses RLS and reads the base table.
--
-- =============================================================================

-- 1. Redacted public projection of tenants.
--    Runs with the view owner's privileges (security_invoker is intentionally
--    NOT set) so the anon role can read the safe columns without being granted
--    access to the underlying `tenants` table.
--    business_config keeps PUBLIC keys (paystack_public_key,
--    flutterwave_public_key, preferred_payment_gateway, branding, phone, …) but
--    every secret/credential key is stripped with the jsonb `-` operator.
-- NOTE: column list matches the canonical supabase_schema.sql (no custom_domain).
-- If your database has additional public columns (e.g. custom_domain), add them
-- here; adding a column that does not exist will fail with 42703.
CREATE OR REPLACE VIEW public.public_tenants AS
SELECT
    id,
    name,
    subdomain,
    logo_url,
    currency,
    is_active,
    owner_id,
    created_at,
    branding_config,
    (
        COALESCE(business_config, '{}'::jsonb)
        - 'paystack_secret_key'
        - 'flutterwave_secret_key'
        - 'flutterwave_secret_hash'
        - 'meta_access_token'
        - 'meta_app_secret'
        - 'whatsapp_access_token'
        - 'google_maps_key'
        - 'resend_api_key'
        - 'gemini_api_key'
        - 'smtp_password'
        - 'instagram_access_token'
        - 'vercel_token'
    ) AS business_config
FROM public.tenants;

-- 2. Remove the permissive anon-facing SELECT policies on the base table.
DROP POLICY IF EXISTS "Public can resolve tenants by subdomain or domain" ON public.tenants;
DROP POLICY IF EXISTS "Public read for active tenants" ON public.tenants;
DROP POLICY IF EXISTS "Public can read tenant storefronts" ON public.tenants;

-- 3. Revoke direct anon access to the base table; grant it only on the view.
REVOKE SELECT ON public.tenants FROM anon;
GRANT SELECT ON public.public_tenants TO anon;
GRANT SELECT ON public.public_tenants TO authenticated;

-- 4. Ensure authenticated merchants can still read their OWN full tenant row
--    (dashboard/settings) through the existing owner + superadmin RLS policies.
GRANT SELECT ON public.tenants TO authenticated;

-- RLS stays enabled on the base table; the owner/superadmin policies from
-- 001_complete_rls_policies.sql continue to gate authenticated row access.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DRY-RUN VERIFICATION (run manually against a copy before/after)
-- =============================================================================
-- As anon, the base table must be denied and the view must never contain
-- secrets:
--
--   SET ROLE anon;
--   SELECT * FROM public.tenants LIMIT 1;                    -- expect: permission denied
--   SELECT business_config ? 'paystack_secret_key'
--     FROM public.public_tenants LIMIT 1;                    -- expect: false (or no rows)
--   RESET ROLE;
--
-- Confirm no secret keys survive the projection across all rows:
--
--   SELECT count(*) FROM public.public_tenants
--   WHERE business_config ?| array[
--     'paystack_secret_key','flutterwave_secret_key','flutterwave_secret_hash',
--     'meta_access_token','meta_app_secret','whatsapp_access_token','google_maps_key'
--   ];                                                       -- expect: 0
--
-- =============================================================================
-- ROLLBACK (only if this migration must be reverted)
-- =============================================================================
--   DROP VIEW IF EXISTS public.public_tenants;
--   REVOKE SELECT ON public.public_tenants FROM anon;   -- no-op if view dropped
--   GRANT SELECT ON public.tenants TO anon;
--   CREATE POLICY "Public read for active tenants" ON public.tenants
--       FOR SELECT USING (is_active = true);
-- (Reverting re-opens the P0 secret-exposure hole — do not ship reverted.)
