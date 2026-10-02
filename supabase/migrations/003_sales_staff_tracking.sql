-- Add staff attribution columns to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS staff_user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS staff_name TEXT;

-- Create an index for fast lookups by staff member
CREATE INDEX IF NOT EXISTS idx_sales_staff_user_id ON public.sales(staff_user_id);
