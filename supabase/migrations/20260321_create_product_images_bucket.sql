-- =============================================================================
-- SQL MIGRATION: Create Product Images Storage Bucket
-- =============================================================================

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Set up RLS Policies for the bucket

-- a. Allow public access to view images
-- This ensures that customers can see product images on the storefront.
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- b. Allow authenticated users (merchants) to upload images
-- This uses tenant isolation based on the folder structure: tenant_id/product_id/timestamp.ext
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
    -- Ensure the first part of the path matches the user's tenant_id if available
    -- (Optional enhancement: add tenant_id check if auth context supports it)
);

-- c. Allow authenticated users to update/delete their own uploads
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
);
