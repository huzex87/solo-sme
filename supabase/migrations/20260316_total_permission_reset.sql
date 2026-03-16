-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: Total Public Schema Reset & API Reload
-- 
-- Run this in the Supabase SQL Editor. 
-- It restores EVERY privilege and reloads the Supabase API cache.
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Ensure schema ownership and base usage
ALTER SCHEMA public OWNER TO postgres;
GRANT USAGE ON SCHEMA public TO anon,
    authenticated,
    service_role,
    postgres,
    supabase_admin;
GRANT ALL ON SCHEMA public TO postgres,
    supabase_admin;
-- 2. Grant ALL privileges on all objects to API roles
-- This is a brute-force restoration of the Supabase default state.
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated,
    anon,
    service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated,
    anon,
    service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated,
    anon,
    service_role;
-- 3. Ensure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO authenticated,
    anon,
    service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO authenticated,
    anon,
    service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO authenticated,
    anon,
    service_role;
-- 4. Fix search paths for all internal Supabase roles
ALTER ROLE authenticator
SET search_path TO public,
    auth,
    extensions;
ALTER ROLE authenticated
SET search_path TO public,
    auth,
    extensions;
ALTER ROLE anon
SET search_path TO public,
    auth,
    extensions;
ALTER ROLE service_role
SET search_path TO public,
    auth,
    extensions;
-- 5. CRITICAL: Reload the Supabase API (PostgREST) cache
-- This forces Supabase to recognize the new permissions immediately.
NOTIFY pgrst,
'reload schema';
-- 6. Verification check (should return 't' for has_usage)
SELECT has_schema_privilege('authenticated', 'public', 'USAGE') as authenticated_has_usage;