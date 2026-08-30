-- WhatsApp service-window support
--
-- Meta only accepts free-form messages within 24 hours of the recipient's last
-- inbound message. Outside that window a business-initiated message MUST use a
-- pre-approved template. Solo's automations and campaigns were sending free-form
-- text, so they failed silently for exactly the audience they targeted.
--
-- This migration:
--   1. Indexes the message log for the service-window lookup.
--   2. Extends the template registry so the code can carry body text + params.
--   3. Registers the templates the app now depends on.

-- 1. Service-window lookup: "latest inbound from this number in the last 24h".
--    The existing idx_whatsapp_log_tenant_phone doesn't cover direction/created_at.
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_service_window
    ON public.whatsapp_message_log (phone_number, direction, created_at DESC);

-- 1b. Backfill from 20260308_whatsapp_layer.sql, whose trailing ALTERs never reached
--     the live database (verified 2026-07-27: the column was absent in production).
ALTER TABLE public.whatsapp_message_log
    ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. The registry only tracked a name and status — not enough to submit or audit
--    a template, or to know how many variables the code must supply.
ALTER TABLE public.whatsapp_templates
    ADD COLUMN IF NOT EXISTS body_text TEXT,
    ADD COLUMN IF NOT EXISTS param_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Widen the status vocabulary to mirror Meta's own template states.
ALTER TABLE public.whatsapp_templates
    DROP CONSTRAINT IF EXISTS whatsapp_templates_status_check;
ALTER TABLE public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_status_check
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'paused', 'disabled'));

-- 3. Templates the code references. These must be submitted in WhatsApp Manager
--    (Message templates -> Manage templates) and approved by Meta before the
--    out-of-window path will deliver. body_text below is what to submit.
INSERT INTO public.whatsapp_templates (template_name, category, language, status, param_count, body_text, description)
VALUES
    (
        'abandoned_cart_recovery',
        'MARKETING',
        'en',
        'pending_review',
        3,
        'Hi {{1}}, you left some items in your cart at {{2}}. Your order is still saved and you can complete your checkout here: {{3}} Thank you for shopping with us.',
        'Sent by AutomationService.processAbandonedCarts when the customer is outside the 24h service window. Body text must match Meta template id 1382764656697301 exactly. Note the trailing sentence: Meta rejects templates whose body ends with a variable.'
    ),
    (
        'store_announcement',
        'MARKETING',
        'en',
        'pending_review',
        2,
        'Hello! Here is the latest update from {{1}}: {{2}} Reply to this message if you have any questions or would like to place an order.',
        'Fallback for CampaignService marketing sends to customers outside the 24h service window. Params are campaign-level ({{1}} store name, {{2}} campaign message), so this template is deliberately NOT personalised per recipient — personalised marketing requires the recipient to be inside the service window. Body text must match Meta template id 894219899939709 exactly. The surrounding fixed text is required: Meta rejected the shorter "An update from {{1}}: {{2}}" as having too many variables for its length.'
    )
ON CONFLICT (template_name) DO UPDATE
    SET body_text   = EXCLUDED.body_text,
        param_count = EXCLUDED.param_count,
        category    = EXCLUDED.category,
        description = EXCLUDED.description;

COMMENT ON TABLE public.whatsapp_templates IS
    'Meta-approved message templates. Required for any business-initiated message sent outside the 24h customer service window.';
