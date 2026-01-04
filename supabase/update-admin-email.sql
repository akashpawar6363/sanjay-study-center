-- Update Admin Email - Direct SQL Approach
-- Run this in Supabase SQL Editor

-- Step 1: Find your admin user ID
SELECT id, email, role FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%sanjay%';

-- Step 2: Update email in auth.users (replace the WHERE condition with your actual email)
UPDATE auth.users
SET 
  email = 'sanjay.study8814@gmail.com',
  raw_user_meta_data = raw_user_meta_data || '{"email": "sanjay.study8814@gmail.com"}'::jsonb,
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email ILIKE '%admin@sanjay-study-center%';

-- Step 3: Update profiles table
UPDATE public.profiles
SET 
  email = 'sanjay.study8814@gmail.com',
  updated_at = NOW()
WHERE email ILIKE '%admin@sanjay-study-center%';

-- Step 4: Verify both tables
SELECT 'auth.users' as table_name, id, email FROM auth.users WHERE email = 'sanjay.study8814@gmail.com'
UNION ALL
SELECT 'profiles' as table_name, id, email FROM public.profiles WHERE email = 'sanjay.study8814@gmail.com';
