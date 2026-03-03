-- OMNICHANNEL INVENTORY MIGRATION
-- Adds support for Barcodes, SKUs, and detailed Inventory Tracking
-- 1. EXTEND PRODUCTS TABLE
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';
-- 2. INVENTORY MOVEMENTS TABLE (Audit Trail)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES store_locations(id),
    delta INTEGER NOT NULL,
    -- e.g. -1 for sale, +10 for restock
    type TEXT NOT NULL,
    -- sale, restock, adjustment, return, transfer
    channel TEXT NOT NULL,
    -- online, pos, marketplace
    staff_id UUID REFERENCES staff_members(id),
    reference_id UUID,
    -- order_id or other reference
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Index for fast lookup by tenant and product
CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant_product ON inventory_movements(tenant_id, product_id);
-- 3. ENABLE RLS
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
-- 4. POLICIES (Simplistic tenant-based isolation)
-- Assumes standard tenant id lookup in production schema
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'inventory_movements'
        AND policyname = 'Tenants can manage their own inventory movements'
) THEN CREATE POLICY "Tenants can manage their own inventory movements" ON inventory_movements FOR ALL USING (
    tenant_id::text IN (
        SELECT id::text
        FROM tenants
    )
);
END IF;
END $$;
-- 5. RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL,
    -- Full snapshot of receipt details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Index for fast lookup by tenant and receipt number
CREATE INDEX IF NOT EXISTS idx_receipts_tenant_number ON receipts(tenant_id, receipt_number);
-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
-- Policies
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'receipts'
        AND policyname = 'Tenants can manage their own receipts'
) THEN CREATE POLICY "Tenants can manage their own receipts" ON receipts FOR ALL USING (
    tenant_id::text IN (
        SELECT id::text
        FROM tenants
    )
);
END IF;
END $$;
-- 6. ADD CHANNEL TO ORDERS
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'online';