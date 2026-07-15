-- Migration to fix orders table check constraints:
-- 1. Allow 'whatsapp' in channel column
-- 2. Allow 'dispatched' and 'partially_refunded' in status column

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_channel_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_channel_check CHECK (channel IN ('online', 'pos', 'marketplace', 'whatsapp'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
    'pending',
    'confirmed',
    'paid',
    'processing',
    'shipped',
    'dispatched',
    'delivered',
    'cancelled',
    'refunded',
    'partially_refunded',
    'abandoned'
));
