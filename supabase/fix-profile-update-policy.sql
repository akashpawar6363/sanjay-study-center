-- Check and fix profile update policies
-- Run this in Supabase SQL Editor

-- Step 1: Check current policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Step 2: Drop and recreate the user update policy to ensure it works
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 3: Ensure admin can also update
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;

CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 4: Test the update (replace with your actual user ID)
-- SELECT id, email, full_name, role FROM profiles WHERE id = auth.uid();
