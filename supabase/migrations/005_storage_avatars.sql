-- Migration: 005_storage_avatars.sql
-- Description: Public avatars bucket + strict write policies
-- Notes:
-- - Bucket is public (avatars are meant to be visible in leaderboards/profile).
-- - Upload/write is restricted to the owner folder: `avatars/{userId}/...`

-- Create the bucket if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

-- RLS policies on storage.objects
-- Allow anyone (anon/auth) to read avatar objects.
CREATE POLICY "Public can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Only the authenticated user can write to their own folder.
-- Objects must be stored under `{auth.uid()}/...`
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

