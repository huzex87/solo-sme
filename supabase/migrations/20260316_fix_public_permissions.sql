-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: Restore Permissions for Schema Public
-- 
-- Run this in the Supabase SQL Editor if you see 
-- "permission denied for schema public"
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Grant usage on schema public to all roles
GRANT USAGE ON SCHEMA public TO anon,
    authenticated,
    service_role;
-- 2. Grant access to all tables in public schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,
    authenticated,
    service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon,
    authenticated,
    service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon,
    authenticated,
    service_role;
-- 3. Specifically ensure profiles and tenants are accessible
GRANT SELECT,
    INSERT,
    UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE ON TABLE public.tenants TO authenticated;
-- 4. Re-grant search path usage
ALTER ROLE authenticator
SET search_path TO public,
    auth,
    extensions;