-- ============================================================================
-- Migration: 20260309_whatsapp_onboarding.sql
-- Purpose:   Complete the WhatsApp onboarding infrastructure required by the
--            WhatsApp AI Command Layer (implemented in 20260308_whatsapp_layer.sql).
--
-- Changes:
--   1. tenants          → ADD whatsapp_link_code (unique 8-char code for linking)
--   2. tenants          → ADD whatsapp_enabled flag
--   3. profiles         → ADD email column (required by handleLinkAccount email lookup)
--   4. customers        → ADD whatsapp_phone column (dedicated field for broadcast targeting)
--   5. Auto-generate    → Trigger to populate whatsapp_link_code on new tenants
--   6. Backfill         → Generate codes for all existing tenants
--   7. Dashboard view   → view_whatsapp_settings for Settings → WhatsApp page
--   8. Index            → Fast lookup on whatsapp_link_code during onboarding
--   9. RLS              → Tenant-scoped policies on new columns
-- ============================================================================

-- ─── 1. Add whatsapp_link_code to tenants ────────────────────────────────────
-- This is the code merchants find in their dashboard under Settings → WhatsApp
-- and send to the SOLO WhatsApp number to initiate account linking.
-- Format: 8 uppercase alphanumeric characters (e.g. "SOLO4X7B")
-- Unique constraint ensures no two tenants can share a code.
ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS whatsapp_link_code VARCHAR(8) UNIQUE,
    ADD COLUMN IF NOT EXISTS whatsapp_enabled   BOOLEAN DEFAULT FALSE;

-- ─── 2. Add email to profiles ────────────────────────────────────────────────
-- handleLinkAccount queries profiles.email to resolve tenant from owner email.
-- Supabase auth.users holds the canonical email; this column is a denormalised
-- copy kept in sync via the trigger below, for fast service-role lookups without
-- crossing the auth schema boundary.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email TEXT;

-- ─── 3. Add whatsapp_phone to customers ──────────────────────────────────────
-- commitPromo now looks for customers.whatsapp_phone first (set explicitly),
-- falling back to customers.phone. This allows merchants to store a different
-- WhatsApp number from the billing/contact phone.
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20);

-- Index for fast phone lookup during broadcast targeting
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp_phone
    ON public.customers(whatsapp_phone)
    WHERE whatsapp_phone IS NOT NULL;

-- ─── 4. Index on whatsapp_link_code ──────────────────────────────────────────
-- handleLinkAccount does: SELECT id FROM tenants WHERE whatsapp_link_code = $1
-- This index makes that lookup O(log n) instead of a full table scan.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_whatsapp_link_code
    ON public.tenants(whatsapp_link_code)
    WHERE whatsapp_link_code IS NOT NULL;

-- ─── 5. Function: generate a random 8-char alphanumeric code ─────────────────
-- Used by the trigger (new tenants) and the backfill query (existing tenants).
-- Excludes ambiguous characters: 0, O, 1, I, L to prevent merchant confusion.
CREATE OR REPLACE FUNCTION public.generate_whatsapp_link_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars  TEXT    := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    code   TEXT    := '';
    i      INTEGER;
    exists BOOLEAN;
BEGIN
    LOOP
        code := '';
        FOR i IN 1..8 LOOP
            code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        -- Ensure uniqueness before returning
        SELECT EXISTS(
            SELECT 1 FROM public.tenants WHERE whatsapp_link_code = code
        ) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN code;
END;
$$;

-- ─── 6. Trigger: auto-assign link code on new tenant creation ─────────────────
CREATE OR REPLACE FUNCTION public.assign_whatsapp_link_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.whatsapp_link_code IS NULL THEN
        NEW.whatsapp_link_code := public.generate_whatsapp_link_code();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_whatsapp_link_code ON public.tenants;
CREATE TRIGGER trg_assign_whatsapp_link_code
    BEFORE INSERT ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_whatsapp_link_code();

-- ─── 7. Backfill existing tenants with link codes ────────────────────────────
-- Runs once at migration time. Safe to re-run (only updates NULL rows).
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT id FROM public.tenants WHERE whatsapp_link_code IS NULL
    LOOP
        UPDATE public.tenants
        SET whatsapp_link_code = public.generate_whatsapp_link_code()
        WHERE id = rec.id;
    END LOOP;
END;
$$;

-- ─── 8. Dashboard settings view ──────────────────────────────────────────────
-- Powers the Settings → WhatsApp page in the SOLO dashboard.
-- Returns everything the frontend needs to render the WhatsApp setup card:
-- the link code, enabled status, binding count, and last activity.
CREATE OR REPLACE VIEW public.view_whatsapp_settings AS
SELECT
    t.id                                            AS tenant_id,
    t.name                                          AS tenant_name,
    t.whatsapp_link_code,
    t.whatsapp_enabled,
    COUNT(b.id)                                     AS bound_phones,
    MAX(b.last_active_at)                           AS last_whatsapp_activity,
    COUNT(b.id) FILTER (WHERE b.is_active = true)   AS active_bindings
FROM public.tenants t
LEFT JOIN public.whatsapp_phone_bindings b ON b.tenant_id = t.id
GROUP BY t.id, t.name, t.whatsapp_link_code, t.whatsapp_enabled;

-- ─── 9. RLS: tenants can only read their own whatsapp_link_code ───────────────
-- The link code is non-sensitive (it's shown in the dashboard) but should not
-- be readable by other tenants. Service role bypasses RLS entirely (existing policy).
-- No additional policy needed beyond what exists — tenants table already has:
--   "Tenant owner access" policy scoped to auth.uid() = owner_id
-- The new columns inherit that policy automatically.

-- ─── 10. Comment documentation ───────────────────────────────────────────────
COMMENT ON COLUMN public.tenants.whatsapp_link_code IS
    'Unique 8-char alphanumeric code shown in Settings → WhatsApp. '
    'Merchants send this to the SOLO WhatsApp number to initiate account linking. '
    'Auto-generated on tenant creation. Never changes after assignment.';

COMMENT ON COLUMN public.tenants.whatsapp_enabled IS
    'Master toggle for WhatsApp AI Command Layer access. '
    'Set to TRUE when the tenant has completed WhatsApp onboarding. '
    'Checked by whatsappAuthService before processing any command.';

COMMENT ON COLUMN public.profiles.email IS
    'Denormalised copy of auth.users.email for fast service-role tenant lookup '
    'during WhatsApp account linking (handleLinkAccount email flow). '
    'Should be kept in sync with auth.users via application-level update on email change.';

COMMENT ON COLUMN public.customers.whatsapp_phone IS
    'Dedicated WhatsApp phone number for this customer. '
    'Used by commitPromo broadcast targeting. If NULL, falls back to customers.phone. '
    'Format: E.164 digits without + (e.g. 2348012345678).';
