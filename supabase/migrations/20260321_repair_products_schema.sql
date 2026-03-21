-- =============================================================================
-- SQL MIGRATION: Repair Products Schema (Institutional Alignment)
-- =============================================================================

-- 1. Add missing columns to 'products' table
-- weight (numeric): Supports precise physical inventory management
-- is_featured (boolean): Supports storefront highlighting and AI promotions
-- cost_price (numeric): Supports margin analysis and institutional reporting
-- variants (jsonb): Supports complex product variations (size, color, etc.)

DO $$ 
BEGIN 
    -- Add 'weight' if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='weight') THEN
        ALTER TABLE public.products ADD COLUMN weight numeric DEFAULT 0;
    END IF;

    -- Add 'is_featured' if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_featured') THEN
        ALTER TABLE public.products ADD COLUMN is_featured boolean DEFAULT false;
    END IF;

    -- Add 'cost_price' if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price numeric DEFAULT 0;
    END IF;

    -- Add 'variants' if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='variants') THEN
        ALTER TABLE public.products ADD COLUMN variants jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Performance & Search Optimization
-- Add index for featured products search
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;

-- 3. Storage Bucket Finalization
-- Ensure the product-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for public viewing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
    END IF;
END $$;
