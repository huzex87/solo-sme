-- Run this in Supabase SQL Editor to apply Super Admin Governance Schema

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS platform_tier TEXT DEFAULT 'starter';

CREATE TABLE IF NOT EXISTS public.platform_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation" ON public.platform_tickets;
CREATE POLICY "Tenant isolation" ON public.platform_tickets FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- NOTE: Super Admins bypass RLS using the service role key on the backend endpoints.
