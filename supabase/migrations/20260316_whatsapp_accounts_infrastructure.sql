-- Create whatsapp_accounts table to store per-tenant Meta API credentials
CREATE TABLE IF NOT EXISTS public.whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    phone_number_id VARCHAR(100) NOT NULL,
    waba_id VARCHAR(100),
    access_token TEXT NOT NULL,
    verify_token TEXT,
    app_secret TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add account_id to whatsapp_phone_bindings to link phone numbers to specific API credentials
ALTER TABLE public.whatsapp_phone_bindings 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.whatsapp_accounts(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;

-- Service Role policies
CREATE POLICY "Service role full access on whatsapp_accounts" 
ON public.whatsapp_accounts 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_whatsapp_account_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_whatsapp_account_update
    BEFORE UPDATE ON public.whatsapp_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_whatsapp_account_update();

-- Index for tenant lookup
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_tenant ON public.whatsapp_accounts(tenant_id);
