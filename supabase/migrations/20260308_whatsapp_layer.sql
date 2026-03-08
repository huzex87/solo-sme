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
-- ─── IMPROVEMENTS (feature/whatsapp-layer-improvements) ────────────────────

-- FIX 15: Add 'whatsapp' as a valid order channel for cross-channel tracking
DO $$ BEGIN
    ALTER TYPE order_channel ADD VALUE IF NOT EXISTS 'whatsapp';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- If channel is a VARCHAR (not enum), add a source column instead:
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'dashboard'
    CHECK (source IN ('dashboard', 'whatsapp', 'api', 'pos'));

-- Index for channel-based analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_source ON public.orders(source);

-- FIX: Add OTP attempts counter support (already in code, document here)
COMMENT ON TABLE public.whatsapp_phone_bindings IS
    'Maps WhatsApp phone numbers to SOLO tenants. OTP brute-force protected (max 3 attempts).';

-- FIX: Add error_message column to message log for better debugging
ALTER TABLE public.whatsapp_message_log
    ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Improved beta stats view with intent breakdown
CREATE OR REPLACE VIEW public.view_whatsapp_beta_stats AS
SELECT
    l.tenant_id,
    t.name AS tenant_name,
    COUNT(*) FILTER (WHERE l.direction = 'inbound') AS inbound_messages,
    COUNT(*) FILTER (WHERE l.direction = 'outbound') AS outbound_messages,
    COUNT(*) FILTER (WHERE l.intent = 'RECORD_SALE') AS sales_recorded,
    COUNT(*) FILTER (WHERE l.intent = 'CHECK_BALANCE') AS balance_checks,
    COUNT(*) FILTER (WHERE l.intent = 'GET_REVENUE_SUMMARY') AS report_requests,
    COUNT(*) FILTER (WHERE l.intent = 'UNKNOWN') AS failed_classifications,
    COUNT(*) FILTER (WHERE l.success = false) AS error_count,
    COUNT(DISTINCT l.phone_number) AS unique_users,
    MAX(l.created_at) AS last_activity,
    MIN(l.created_at) AS first_activity
FROM public.whatsapp_message_log l
JOIN public.tenants t ON l.tenant_id = t.id
GROUP BY l.tenant_id, t.name;

-- Intent accuracy view for beta monitoring (H2 hypothesis tracking)
CREATE OR REPLACE VIEW public.view_whatsapp_intent_accuracy AS
SELECT
    intent,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE success = true) AS successful,
    ROUND(COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*) * 100, 1) AS accuracy_pct
FROM public.whatsapp_message_log
WHERE direction = 'inbound'
  AND intent != 'PROCESSING'
GROUP BY intent
ORDER BY total DESC;
