-- Table 1: Phone number to tenant binding
-- Maps WhatsApp phone numbers to SOLO tenants for secure conversational access.
CREATE TABLE IF NOT EXISTS public.whatsapp_phone_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    bound_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for fast lookup during webhook handling
CREATE INDEX IF NOT EXISTS idx_whatsapp_phone_number ON public.whatsapp_phone_bindings(phone_number);
-- Table 2: WhatsApp message log (audit trail)
-- Stores a sanitized trace of interactions for debugging and analytics.
CREATE TABLE IF NOT EXISTS public.whatsapp_message_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    intent VARCHAR(50),
    message_preview TEXT,
    action_taken VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for session/history retrieval
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_tenant_phone ON public.whatsapp_message_log(tenant_id, phone_number);
-- Table 3: WhatsApp message templates registry
-- Tracks Meta-approved templates and their current status.
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending_review',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS Policies
ALTER TABLE public.whatsapp_phone_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
-- Service Role policies (Backend access)
CREATE POLICY "Service role full access on bindings" ON public.whatsapp_phone_bindings USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role full access on logs" ON public.whatsapp_message_log USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role full access on templates" ON public.whatsapp_templates USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- Logging Dashboard View
-- Provides a high-level overview of beta activity for the Huzex team.
CREATE OR REPLACE VIEW public.view_whatsapp_beta_stats AS
SELECT l.tenant_id,
    t.name as tenant_name,
    COUNT(*) FILTER (
        WHERE l.direction = 'inbound'
    ) as inbound_messages,
    COUNT(*) FILTER (
        WHERE l.direction = 'outbound'
    ) as outbound_messages,
    COUNT(DISTINCT l.intent) as unique_intents_used,
    MAX(l.created_at) as last_activity
FROM public.whatsapp_message_log l
    JOIN public.tenants t ON l.tenant_id = t.id
GROUP BY l.tenant_id,
    t.name;