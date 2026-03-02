-- ─────────────────────────────────────────────────
-- 10. TRANSACTIONS (Financial Ledger)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE
    SET NULL,
        amount NUMERIC(12, 2) NOT NULL,
        type TEXT NOT NULL CHECK (
            type IN (
                'revenue',
                'delivery_fee',
                'tax',
                'payout',
                'adjustment'
            )
        ),
        status TEXT DEFAULT 'completed' CHECK (
            status IN ('pending', 'completed', 'failed', 'refunded')
        ),
        provider TEXT DEFAULT 'system',
        reference TEXT UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON public.transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(tenant_id, created_at DESC);
-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- Tenant members can view their own transactions
CREATE POLICY "Tenant members can view transactions" ON public.transactions FOR
SELECT USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
-- System/Service can record transactions
CREATE POLICY "System can record transactions" ON public.transactions FOR
INSERT WITH CHECK (true);