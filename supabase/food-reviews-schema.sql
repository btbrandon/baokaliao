-- Create food_reviews table
CREATE TABLE IF NOT EXISTS food_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  place_name TEXT NOT NULL,
  place_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id TEXT,
  overall_rating DECIMAL(2, 1) NOT NULL,
  notes TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES food_reviews(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  rating DECIMAL(2, 1),
  expense_id UUID,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Create review_ratings table
CREATE TABLE IF NOT EXISTS review_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES food_reviews(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  rating DECIMAL(2, 1) NOT NULL
);

-- Create review_photos table
CREATE TABLE IF NOT EXISTS review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES food_reviews(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_food_reviews_user_id ON food_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_food_reviews_date ON food_reviews(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_dishes_review_id ON dishes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_ratings_review_id ON review_ratings(review_id);
CREATE INDEX IF NOT EXISTS idx_review_photos_review_id ON review_photos(review_id);

-- Create storage bucket for food review photos (if using Supabase)
-- This needs to be run separately in Supabase dashboard or via SQL editor
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('food-review-photos', 'food-review-photos', true)
-- ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for food_reviews
ALTER TABLE food_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own food reviews"
  ON food_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food reviews"
  ON food_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food reviews"
  ON food_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food reviews"
  ON food_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Set up RLS policies for dishes
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dishes from their reviews"
  ON dishes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert dishes to their reviews"
  ON dishes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can update dishes from their reviews"
  ON dishes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete dishes from their reviews"
  ON dishes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND food_reviews.user_id = auth.uid()
  ));

-- Set up RLS policies for review_ratings
ALTER TABLE review_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings from their reviews"
  ON review_ratings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert ratings to their reviews"
  ON review_ratings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can update ratings from their reviews"
  ON review_ratings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete ratings from their reviews"
  ON review_ratings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND food_reviews.user_id = auth.uid()
  ));

-- Set up RLS policies for review_photos
ALTER TABLE review_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos from their reviews"
  ON review_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_photos.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert photos to their reviews"
  ON review_photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_photos.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can update photos from their reviews"
  ON review_photos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_photos.review_id
    AND food_reviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete photos from their reviews"
  ON review_photos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_photos.review_id
    AND food_reviews.user_id = auth.uid()
  ));
