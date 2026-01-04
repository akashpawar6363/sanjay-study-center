-- Add discount column to admissions table
-- Run this in Supabase SQL Editor

ALTER TABLE public.admissions
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0 NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.admissions.discount IS 'Discount amount applied to the admission fees';
