-- =============================================================================
-- SQL MIGRATION: Ensure Product Columns (Institutional Consistency)
-- =============================================================================

-- 1. Add 'is_active' and 'updated_at' if they don't exist
DO $$ 
BEGIN 
    -- is_active (boolean): Supports soft-deletion and visibility control
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_active') THEN
        ALTER TABLE public.products ADD COLUMN is_active boolean DEFAULT true;
    END IF;

    -- updated_at (timestamptz): Supports sync tracking and audit trails
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='updated_at') THEN
        ALTER TABLE public.products ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 2. Audit Trail & Auto-update for 'updated_at'
-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_products_updated_at') THEN
        CREATE TRIGGER tr_products_updated_at
        BEFORE UPDATE ON public.products
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 3. Redundancy Check: Ensure 'weight', 'is_featured', 'cost_price', 'variants' exist
-- These might have been missed if partial migrations were run.
DO $$ 
BEGIN 
    -- weight
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='weight') THEN
        ALTER TABLE public.products ADD COLUMN weight numeric DEFAULT 0;
    END IF;

    -- is_featured
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_featured') THEN
        ALTER TABLE public.products ADD COLUMN is_featured boolean DEFAULT false;
    END IF;

    -- cost_price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price numeric DEFAULT 0;
    END IF;

    -- variants
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='variants') THEN
        ALTER TABLE public.products ADD COLUMN variants jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 4. Search Optimization
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON public.products(tenant_id, is_active);
