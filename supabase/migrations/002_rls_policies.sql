-- Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Authenticated only for CRUD)
-- In a real app, these would be more granular based on roles.

CREATE POLICY "Allow authenticated full access to app_settings" ON public.app_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to suppliers" ON public.suppliers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to inventory" ON public.inventory
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to sales" ON public.sales
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to sale_items" ON public.sale_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
