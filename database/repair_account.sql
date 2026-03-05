-- Database Repair Script for SOLO SME
-- This script provides utilities to fix accounts that were created but are missing profiles or tenants.
-- [UTILITY 1] Use this to manually create a profile and tenant for an existing auth user
-- Replace 'USER_ID_HERE', 'BUSINESS_NAME_HERE', and 'SUBDOMAIN_HERE' with actual values.
/*
 DO NOT RUN UNTIL YOU REPLACE THE PLACEHOLDERS BELOW
 */
/*
 WITH new_tenant AS (
 INSERT INTO tenants (name, subdomain, owner_id)
 VALUES ('BUSINESS_NAME_HERE', 'SUBDOMAIN_HERE', 'USER_ID_HERE')
 RETURNING id
 )
 INSERT INTO profiles (id, tenant_id, full_name, role)
 VALUES ('USER_ID_HERE', (SELECT id FROM new_tenant), 'Owner Full Name', 'owner')
 ON CONFLICT (id) DO UPDATE 
 SET tenant_id = EXCLUDED.tenant_id;
 */
-- [UTILITY 2] Check for users missing profiles
SELECT au.id as auth_user_id,
    au.email,
    p.id as profile_id
FROM auth.users au
    LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
-- [UTILITY 3] Check for profiles missing tenants
SELECT p.id as profile_id,
    p.tenant_id,
    t.id as actual_tenant_id
FROM profiles p
    LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE t.id IS NULL;