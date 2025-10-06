# Supabase Storage Bucket Setup Guide

## Issue: Photo Upload Error

**Error Message:** `StorageApiError: Bucket not found (404)`

This error occurs because the Supabase storage bucket for food review photos hasn't been created yet.

---

## Solution: Create Storage Bucket

### Steps to Create the Bucket:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Sign in and navigate to your project

2. **Navigate to Storage**
   - In the left sidebar, click on **Storage**

3. **Create New Bucket**
   - Click **"New bucket"** button
   - Enter the following details:
     - **Name**: `food-review-photos`
     - **Public bucket**: ✅ **Enable** (so photos can be accessed publicly)
     - **File size limit**: Set to a reasonable limit (e.g., 50MB per file)
     - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif` (or leave empty for all)

4. **Configure Bucket Settings**
   - Click **Create bucket**

5. **Set Up Storage Policies (Optional but Recommended)**

   After creating the bucket, set up Row Level Security (RLS) policies:

   **Policy for Upload (INSERT)**

   ```sql
   -- Allow authenticated users to upload their own photos
   CREATE POLICY "Users can upload their own photos"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'food-review-photos'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **Policy for Read (SELECT)**

   ```sql
   -- Allow everyone to view photos (public bucket)
   CREATE POLICY "Anyone can view photos"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'food-review-photos');
   ```

   **Policy for Delete**

   ```sql
   -- Allow users to delete only their own photos
   CREATE POLICY "Users can delete their own photos"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'food-review-photos'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

---

## Alternative: Using Supabase CLI

If you prefer using the CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create the bucket
supabase storage create food-review-photos --public
```

---

## Verify Setup

After creating the bucket, test the photo upload:

1. Open your application
2. Navigate to "Add Food Review"
3. Try uploading a photo
4. If successful, you should see the photo appear in the preview

---

## Troubleshooting

### Still getting 404 error?

- Double-check the bucket name is exactly `food-review-photos`
- Verify the bucket is set to **Public**
- Check your Supabase project URL and anon key in `.env.local`

### Photos uploading but not displaying?

- Verify the bucket is set to **Public**
- Check the RLS policies allow SELECT for public users

### File size errors?

- Increase the file size limit in bucket settings
- Default limit might be too small for high-resolution photos

---

## Current Implementation

The upload route (`app/api/upload/food-photos/route.ts`) expects:

- Bucket name: `food-review-photos`
- File structure: `{user_id}/{timestamp}.{extension}`
- Public access enabled for viewing photos

---

## Security Considerations

✅ **What's Protected:**

- Only authenticated users can upload
- Files are organized by user ID
- Users can only delete their own photos

⚠️ **What's Public:**

- All photos are publicly viewable (by design for sharing reviews)
- Photo URLs are public once uploaded

If you need private photos, change the bucket to **Private** and implement signed URLs in the API.

---

## Quick Checklist

- [ ] Supabase project created
- [ ] Storage bucket `food-review-photos` created
- [ ] Bucket set to **Public**
- [ ] RLS policies configured (optional)
- [ ] Environment variables set correctly
- [ ] Test upload works

Once completed, photo uploads should work without errors! 📸
