-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: Nuclear Schema Permissions Restore
-- 
-- Run this in the Supabase SQL Editor to fully restore API access
-- to the public schema.
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Grant base usage to all API roles
GRANT USAGE ON SCHEMA public TO anon,
    authenticated,
    service_role,
    postgres,
    supabase_admin;
-- 2. Grant all privileges on all tables/sequences/functions to API roles
DO $$
DECLARE role_name TEXT;
BEGIN FOR role_name IN
SELECT unnest(ARRAY ['anon', 'authenticated', 'service_role']) LOOP EXECUTE format(
        'GRANT ALL ON ALL TABLES IN SCHEMA public TO %I',
        role_name
    );
EXECUTE format(
    'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO %I',
    role_name
);
EXECUTE format(
    'GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO %I',
    role_name
);
EXECUTE format(
    'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %I',
    role_name
);
EXECUTE format(
    'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %I',
    role_name
);
EXECUTE format(
    'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO %I',
    role_name
);
END LOOP;
END $$;
-- 3. Fix the "authenticator" role search path (Critical for Supabase REST API)
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
-- 4. Verify profiles and tenants specifically
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.profiles TO authenticated,
    service_role;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.tenants TO authenticated,
    service_role;
-- 5. If using get_my_tenant_id(), ensure it has execution rights
GRANT EXECUTE ON FUNCTION public.get_my_tenant_id() TO authenticated;