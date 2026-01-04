# Supabase Database Setup Instructions

## Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project named "Sanjay Study Center"
4. Set database password: `Sanjay@008814`
5. Choose region closest to Pune, India
6. Wait for project to be ready

## Step 2: Run SQL Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `schema.sql`
4. Click **Run** to execute

## Step 3: Create Default Admin User
1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Fill in:
   - Email: `admin@sanjay-study-center.com`
   - Password: `Sanjay@008814`
   - Auto Confirm User: ✓ (checked)
4. Click **Create user**
5. Copy the User ID (UUID)

## Step 4: Create Admin Profile
1. Go back to **SQL Editor**
2. Run this query (replace USER_ID with the copied UUID):

```sql
INSERT INTO profiles (id, email, full_name, role) 
VALUES ('USER_ID', 'admin@sanjay-study-center.com', 'Admin', 'admin');
```

## Step 5: Create Storage Buckets
1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**

### Create profile-photos bucket:
- Name: `profile-photos`
- Public: ❌ (unchecked)
- File size limit: 2 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### Create digital-signatures bucket:
- Name: `digital-signatures`
- Public: ❌ (unchecked)
- File size limit: 1 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

## Step 6: Configure Storage Policies
For each bucket, add these policies:

### For profile-photos:
```sql
-- SELECT policy
CREATE POLICY "Users can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- INSERT policy
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

-- UPDATE policy
CREATE POLICY "Users can update photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

-- DELETE policy
CREATE POLICY "Users can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');
```

### For digital-signatures:
```sql
-- SELECT policy
CREATE POLICY "Users can view signatures"
ON storage.objects FOR SELECT
USING (bucket_id = 'digital-signatures');

-- INSERT policy
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'digital-signatures' AND auth.role() = 'authenticated');

-- UPDATE policy
CREATE POLICY "Users can update signatures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'digital-signatures' AND auth.role() = 'authenticated');

-- DELETE policy
CREATE POLICY "Users can delete signatures"
ON storage.objects FOR DELETE
USING (bucket_id = 'digital-signatures' AND auth.role() = 'authenticated');
```

## Step 7: Get API Credentials
1. Go to **Project Settings** > **API**
2. Copy:
   - Project URL
   - anon (public) key
   - service_role key (keep this secret!)

## Step 8: Update .env.local
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@sanjay-study-center.com

CRON_SECRET=generate_a_random_secret_here
```

## Step 9: Test Database Connection
Run in SQL Editor:
```sql
SELECT * FROM profiles;
SELECT * FROM categories;
SELECT * FROM settings;
```

You should see:
- 1 admin profile
- 3 default categories
- 2 default settings

## Verification Checklist
- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Default admin user created
- [ ] Admin profile created
- [ ] Storage buckets created
- [ ] Storage policies configured
- [ ] API credentials copied to .env.local
- [ ] Test queries executed successfully

## Next Steps
After completing all steps:
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open http://localhost:3000
4. Login with admin@sanjay-study-center.com / Sanjay@008814

## Troubleshooting

### Cannot login
- Verify user was created in Authentication > Users
- Check that profile exists in profiles table
- Ensure RLS policies are enabled

### Storage upload fails
- Check bucket exists
- Verify storage policies are created
- Check file size and MIME type restrictions

### Database errors
- Check RLS policies are enabled for all tables
- Verify foreign key relationships
- Ensure default data was inserted
