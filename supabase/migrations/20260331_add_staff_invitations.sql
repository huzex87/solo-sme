-- Migration to add invitation and permissions columns to staff_members
ALTER TABLE public.staff_members
    ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS invitation_token TEXT,
    ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;

-- Drop check constraint and recreate it to support cashier, manager, analyst, dispatcher, and owner roles
ALTER TABLE public.staff_members DROP CONSTRAINT IF EXISTS staff_members_role_check;
ALTER TABLE public.staff_members ADD CONSTRAINT staff_members_role_check CHECK (role IN ('owner', 'admin', 'manager', 'cashier', 'dispatcher', 'staff', 'analyst', 'driver'));
