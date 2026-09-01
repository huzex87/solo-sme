-- Durable webhook de-duplication
--
-- Inbound de-duplication lived only in Redis. When the Upstash database was
-- reaped (2026-07-27: crucial-mouse-77823.upstash.io stopped resolving), the
-- lookup threw, the handler caught it and continued "best effort", and every
-- Meta webhook retry re-processed the same message — the bot sent each reply
-- three or more times, continuously.
--
-- Redis remains the fast path. This table is the durable backstop: a primary
-- key on message_id makes the claim atomic, so a duplicate delivery loses the
-- insert race and is dropped even with no cache at all.

CREATE TABLE IF NOT EXISTS public.whatsapp_processed_messages (
    -- Meta's wamid. The PK is the de-dup mechanism, not just an identifier.
    message_id   VARCHAR(128) PRIMARY KEY,
    phone_number VARCHAR(20),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supports the retention sweep below.
CREATE INDEX IF NOT EXISTS idx_whatsapp_processed_at
    ON public.whatsapp_processed_messages (processed_at);

ALTER TABLE public.whatsapp_processed_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on processed messages"
    ON public.whatsapp_processed_messages;
CREATE POLICY "Service role full access on processed messages"
    ON public.whatsapp_processed_messages
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Meta retries a webhook for a limited window, so rows older than a day carry
-- no information. Call periodically (cron or the webhook's own sweep) to stop
-- the table growing without bound.
CREATE OR REPLACE FUNCTION public.prune_whatsapp_processed_messages()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    removed integer;
BEGIN
    DELETE FROM public.whatsapp_processed_messages
    WHERE processed_at < NOW() - INTERVAL '24 hours';
    GET DIAGNOSTICS removed = ROW_COUNT;
    RETURN removed;
END;
$$;

COMMENT ON TABLE public.whatsapp_processed_messages IS
    'Durable inbound de-duplication keyed on Meta wamid. Backstop for the Redis fast path, which cannot be relied on — see 20260727_webhook_dedup.sql.';
