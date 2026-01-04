-- Clean up old profile photo and digital signature URLs
-- Run this in Supabase SQL Editor to remove old incorrect URLs

UPDATE profiles
SET 
  profile_photo_url = NULL,
  digital_signature_url = NULL,
  updated_at = NOW()
WHERE 
  profile_photo_url LIKE '%profile_photos/%'
  OR digital_signature_url LIKE '%digital_signatures/%';

-- Alternatively, if you want to clear ALL photo/signature URLs:
-- UPDATE profiles SET profile_photo_url = NULL, digital_signature_url = NULL, updated_at = NOW();
