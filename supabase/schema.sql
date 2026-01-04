-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'coordinator')) DEFAULT 'coordinator',
  profile_photo_url TEXT,
  digital_signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admissions table
CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seat_no INTEGER NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  receipt_no TEXT UNIQUE NOT NULL,
  admission_date DATE NOT NULL,
  duration_months INTEGER NOT NULL,
  renewal_date DATE NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  fees DECIMAL(10, 2) NOT NULL,
  mobile_number TEXT NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online')) NOT NULL,
  digital_signature_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'expired', 'renewed')) DEFAULT 'active'
);

-- Settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE,
  email_type TEXT CHECK (email_type IN ('admission_receipt', 'renewal_reminder', 'admin_report')),
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent', 'failed')) DEFAULT 'sent'
);

-- Insert default categories
INSERT INTO categories (name, rate, is_default) VALUES
  ('Reserved', 1300.00, true),
  ('Non-Reserved', 1100.00, true),
  ('Reserved with Locker', 1600.00, true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('total_seats', '50'),
  ('current_receipt_number', '1000');

-- Create default admin user (run this after setting up Supabase Auth)
-- The user needs to be created through Supabase Dashboard or Auth API first
-- Then run this to create profile:
-- INSERT INTO profiles (id, email, full_name, role) 
-- VALUES ('user-id-from-auth', 'admin@sanjay-study-center.com', 'Admin', 'admin');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- RLS Policies for categories
CREATE POLICY "Everyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage categories" ON categories
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- RLS Policies for admissions
CREATE POLICY "All users can view admissions" ON admissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and coordinator can create admissions" ON admissions
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'coordinator'))
  );

CREATE POLICY "Only admin can update admissions" ON admissions
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Only admin can delete admissions" ON admissions
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- RLS Policies for settings
CREATE POLICY "Everyone can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage settings" ON settings
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- RLS Policies for email_logs
CREATE POLICY "Admin can view email logs" ON email_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "System can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- Create storage buckets (run these in Supabase Dashboard > Storage)
-- Bucket name: profile-photos
-- Public: false
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max file size: 2MB

-- Bucket name: digital-signatures
-- Public: false
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max file size: 1MB

-- Storage policies for profile-photos
-- CREATE POLICY "Users can view own photo" ON storage.objects
--   FOR SELECT USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can upload own photo" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update own photo" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own photo" ON storage.objects
--   FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for digital-signatures (similar to profile-photos)
