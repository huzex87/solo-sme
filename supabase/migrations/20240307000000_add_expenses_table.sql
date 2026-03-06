-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Tenants can view their own expenses"
    ON public.expenses FOR SELECT
    USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can insert their own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update their own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can delete their own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = tenant_id);
