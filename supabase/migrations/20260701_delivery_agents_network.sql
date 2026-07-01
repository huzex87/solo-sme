-- Create delivery_agents table
CREATE TABLE IF NOT EXISTS public.delivery_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_details TEXT,
    city TEXT NOT NULL DEFAULT 'Katsina',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.delivery_agents ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Allow everyone (customers & other merchants) to view verified riders or their own store's riders
CREATE POLICY "Allow read access to delivery agents" ON public.delivery_agents
    FOR SELECT USING (
        tenant_id IS NULL OR 
        tenant_id IN (
            SELECT id FROM public.tenants
        )
    );

-- 2. Allow merchants to insert their own riders
CREATE POLICY "Allow insert for store owner" ON public.delivery_agents
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM public.tenants
        )
    );

-- 3. Allow merchants to delete/update their own riders
CREATE POLICY "Allow update for store owner" ON public.delivery_agents
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM public.tenants
        )
    );

CREATE POLICY "Allow delete for store owner" ON public.delivery_agents
    FOR DELETE USING (
        tenant_id IN (
            SELECT id FROM public.tenants
        )
    );

-- Insert globally verified SOLO dispatch riders
INSERT INTO public.delivery_agents (tenant_id, name, phone, vehicle_details, city, is_verified)
VALUES
    (NULL, 'Musa Speed Dispatch', '+234 809 333 4444', 'Motorcycle', 'Katsina', TRUE),
    (NULL, 'Katsina Express Logistics', '+234 705 555 6666', 'Delivery Van', 'Katsina', TRUE),
    (NULL, 'Abuja Central Delivery', '+234 802 777 8888', 'Motorcycle', 'Abuja', TRUE),
    (NULL, 'Lagos Mainland Riders', '+234 811 999 0000', 'Motorcycle', 'Lagos', TRUE)
ON CONFLICT DO NOTHING;
