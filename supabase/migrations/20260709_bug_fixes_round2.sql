-- 1. Orders Guest Checkout RLS Policy
CREATE POLICY "Public guest checkout order creation" ON public.orders
    FOR INSERT WITH CHECK (true);

-- 2. Blog Posts Public RLS Policy
CREATE POLICY "Public read for published blog posts" ON public.blog_posts
    FOR SELECT USING (status = 'published');

-- 3. Driver columns on orders and ledger_entries
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Driver Task Board RLS Policies
CREATE POLICY "Drivers can view available and active deliveries" ON public.orders
    FOR SELECT USING (
        (delivery_method = 'delivery' AND status IN ('processing', 'dispatched', 'delivered'))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'driver'
        )
    );

CREATE POLICY "Drivers can claim and update active deliveries" ON public.orders
    FOR UPDATE USING (
        (delivery_method = 'delivery' AND status IN ('processing', 'dispatched'))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'driver'
        )
    ) WITH CHECK (
        status IN ('dispatched', 'delivered')
    );

-- 5. Superadmin Owner Foreign Key on Tenants
ALTER TABLE public.tenants ADD CONSTRAINT tenants_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
