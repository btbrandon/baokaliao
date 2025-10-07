-- Migration: Add expense_id and bill_adjustments to food_reviews
-- Also add user_id to review_photos for direct user queries
-- Run this against your Supabase database

BEGIN;

-- 1. Add expense_id to food_reviews to track the linked expense
ALTER TABLE food_reviews
ADD COLUMN IF NOT EXISTS expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL;

-- 2. Add bill_adjustments as JSONB to store GST, service charge, split info
ALTER TABLE food_reviews
ADD COLUMN IF NOT EXISTS bill_adjustments JSONB;

-- 3. Create index for expense lookups
CREATE INDEX IF NOT EXISTS idx_food_reviews_expense_id ON food_reviews(expense_id);

-- 4. Add user_id to review_photos for direct user queries (optional but recommended)
ALTER TABLE review_photos
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 5. Backfill user_id from food_reviews for existing photos
UPDATE review_photos rp
SET user_id = fr.user_id
FROM food_reviews fr
WHERE rp.review_id = fr.id
AND rp.user_id IS NULL;

-- 6. Make user_id NOT NULL after backfill
ALTER TABLE review_photos
ALTER COLUMN user_id SET NOT NULL;

-- Note: We're not adding a foreign key constraint to auth.users to avoid cross-schema references
-- RLS policies and application logic will ensure data integrity

-- 7. Create index for user photo queries
CREATE INDEX IF NOT EXISTS idx_review_photos_user_id ON review_photos(user_id);

-- 8. Add RLS policy for direct user photo queries
DROP POLICY IF EXISTS "Users can view their own photos direct" ON review_photos;
CREATE POLICY "Users can view their own photos direct"
  ON review_photos FOR SELECT
  USING (auth.uid() = user_id);

COMMIT;

-- Example bill_adjustments structure:
-- {
--   "apply_gst": true,
--   "apply_service_charge": true,
--   "split_bill": true,
--   "number_of_people": 2
-- }
