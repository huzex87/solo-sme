-- Migration: Allow public tenant resolution for storefront subdomain routing
-- Without this, anonymous visitors cannot resolve teststore.solosme.ng → tenant
-- because RLS blocks unauthenticated reads on the tenants table.

-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Public can resolve tenants by subdomain or domain" ON tenants;

-- Allow anyone to SELECT from tenants (public storefront info only)
CREATE POLICY "Public can resolve tenants by subdomain or domain"
ON tenants FOR SELECT
USING (true);
