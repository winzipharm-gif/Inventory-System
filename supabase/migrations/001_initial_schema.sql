-- Create app_settings table for global configurations
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_contact JSONB NOT NULL DEFAULT '{"address": "123 Health Ave, Medical District", "phone": "+233 24 000 0000", "email": "info@winzipharmacy.com"}',
    categories TEXT[] NOT NULL DEFAULT '{"Pain Relief", "Antibiotics", "Antihistamine", "Vitamins", "Cardiovascular", "Diabetes", "First Aid"}',
    units TEXT[] NOT NULL DEFAULT '{"pcs", "boxes", "bags", "bottles", "vials"}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pcs',
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    expiry_date DATE NOT NULL,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    min_stock INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id BIGSERIAL PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    items_count INTEGER NOT NULL DEFAULT 0,
    buyer_details JSONB NOT NULL DEFAULT '{"name": "Cash Customer", "address": "N/A"}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sale_items table (junction table for products in sales)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.inventory(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL, -- Snapshot name in case product is deleted
    quantity INTEGER NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial app settings if not exists
INSERT INTO public.app_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
