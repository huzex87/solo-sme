-- Migration to ensure staff_members table and all required columns exist
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.staff_members
    ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS invitation_token TEXT,
    ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;

-- Drop check constraint and recreate it to support cashier, manager, analyst, dispatcher, and owner roles
ALTER TABLE public.staff_members DROP CONSTRAINT IF EXISTS staff_members_role_check;
ALTER TABLE public.staff_members ADD CONSTRAINT staff_members_role_check CHECK (role IN ('owner', 'admin', 'manager', 'cashier', 'dispatcher', 'staff', 'analyst', 'driver'));
