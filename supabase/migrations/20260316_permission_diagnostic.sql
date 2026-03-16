-- ═══════════════════════════════════════════════════════════════════════════
-- Diagnostic: Database Permissions & Path Verification
-- 
-- Run this in the Supabase SQL Editor and tell me the results.
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Check if the roles have USAGE on public schema
SELECT r.rolname as role_name,
    has_schema_privilege(r.rolname, 'public', 'USAGE') as has_usage,
    has_schema_privilege(r.rolname, 'public', 'CREATE') as has_create
FROM pg_roles r
WHERE r.rolname IN (
        'anon',
        'authenticated',
        'service_role',
        'authenticator'
    );
-- 2. Check the default search path for the authenticator role
SHOW search_path;
SELECT rolname,
    rolconfig
FROM pg_roles
WHERE rolname IN ('authenticator', 'authenticated');
-- 3. Check who owns the public schema
SELECT nspname,
    rolname as owner_name
FROM pg_namespace n
    JOIN pg_roles r ON n.nspowner = r.oid
WHERE nspname = 'public';
-- 4. Check if we can see the tables at all
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
LIMIT 5;