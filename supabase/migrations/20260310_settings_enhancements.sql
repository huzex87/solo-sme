-- Add missing business profile columns to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT;
-- Add logo_url to profiles for user avatars
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
-- Ensure RLS policies allow authenticated users to update their own tenant
-- (This is a safety measure if they weren't explicitly added before)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'tenants'
        AND policyname = 'Owners can update own tenant'
) THEN CREATE POLICY "Owners can update own tenant" ON public.tenants FOR
UPDATE USING (owner_id = auth.uid());
END IF;
END $$;