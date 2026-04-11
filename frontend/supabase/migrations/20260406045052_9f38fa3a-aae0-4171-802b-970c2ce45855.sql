
-- Make avatars bucket private
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Drop the old public SELECT policy
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Add owner-scoped SELECT policy
CREATE POLICY "Users can view their own avatar"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
