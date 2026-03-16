-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: Repair Supabase Core Roles & Permissions
-- 
-- Run this in the Supabase SQL Editor.
-- This ensures the internal "authenticator" role can access your data.
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Reset public schema usage to factory defaults
GRANT USAGE ON SCHEMA public TO anon,
    authenticated,
    service_role,
    authenticator;
ALTER SCHEMA public OWNER TO postgres;
-- 2. Grant all privileges on the schema itself
GRANT ALL ON SCHEMA public TO postgres,
    supabase_admin;
-- 3. Reset table permissions for the authenticated roles
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON ALL TABLES IN SCHEMA public TO authenticated,
    service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
-- 4. Reset sequence and function permissions
GRANT USAGE,
    SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated,
    service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated,
    service_role;
-- 5. Fix the search path for the internal Supabase authenticator role
-- This is often the root cause of "permission denied for schema public"
ALTER ROLE authenticator
SET search_path TO public,
    auth,
    extensions;
ALTER ROLE authenticated
SET search_path TO public,
    auth,
    extensions;
-- 6. Force the internal cache to reload
NOTIFY pgrst,
'reload schema';
NOTIFY pgrst,
'reload config';
-- 7. Verification: Run this and see the results
SELECT current_setting('search_path') as current_search_path,
    has_schema_privilege('authenticated', 'public', 'USAGE') as auth_usage,
    has_schema_privilege('authenticator', 'public', 'USAGE') as authenticator_usage;