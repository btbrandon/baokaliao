-- ============================================================================
-- EXPENSES TABLE (Dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notes TEXT,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_day INTEGER
);

-- Create indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(user_id, is_recurring);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- BUDGETS TABLE (Dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  monthly_income DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  expenses_percentage DECIMAL(5, 2) DEFAULT 50.00 NOT NULL,
  investments_percentage DECIMAL(5, 2) DEFAULT 20.00 NOT NULL,
  savings_percentage DECIMAL(5, 2) DEFAULT 20.00 NOT NULL,
  other_percentage DECIMAL(5, 2) DEFAULT 10.00 NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, month, year)
);

-- Create indexes for budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_date ON budgets(user_id, year, month);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budgets
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOOD REVIEWS SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS food_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_name TEXT NOT NULL,
  place_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id TEXT,
  overall_rating DECIMAL(2, 1) NOT NULL,
  notes TEXT,
  visit_date DATE DEFAULT CURRENT_DATE NOT NULL,
  expense_id UUID REFERENCES expenses(id),
  bill_adjustments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for food_reviews
CREATE INDEX IF NOT EXISTS idx_food_reviews_user_id ON food_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_food_reviews_date ON food_reviews(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_food_reviews_expense_id ON food_reviews(expense_id);

-- Enable Row Level Security
ALTER TABLE food_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for food_reviews
CREATE POLICY "Users can view own food reviews"
  ON food_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food reviews"
  ON food_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food reviews"
  ON food_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food reviews"
  ON food_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Dishes table (related to food reviews)
CREATE TABLE IF NOT EXISTS dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES food_reviews(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  rating DECIMAL(2, 1),
  expense_id UUID REFERENCES expenses(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for dishes
CREATE INDEX IF NOT EXISTS idx_dishes_review_id ON dishes(review_id);

-- Enable Row Level Security
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dishes
CREATE POLICY "Users can view dishes for their reviews"
  ON dishes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND auth.uid() = food_reviews.user_id
  ));

CREATE POLICY "Users can insert dishes for their reviews"
  ON dishes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND auth.uid() = food_reviews.user_id
  ));

CREATE POLICY "Users can update dishes for their reviews"
  ON dishes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND auth.uid() = food_reviews.user_id
  ));

CREATE POLICY "Users can delete dishes for their reviews"
  ON dishes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = dishes.review_id
    AND auth.uid() = food_reviews.user_id
  ));

-- Review ratings table (related to food reviews)
CREATE TABLE IF NOT EXISTS review_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES food_reviews(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(2, 1) NOT NULL
);

-- Create indexes for review_ratings
CREATE INDEX IF NOT EXISTS idx_review_ratings_review_id ON review_ratings(review_id);

-- Enable Row Level Security
ALTER TABLE review_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for review_ratings
CREATE POLICY "Users can view ratings for their reviews"
  ON review_ratings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND auth.uid() = food_reviews.user_id
  ));

CREATE POLICY "Users can insert ratings for their reviews"
  ON review_ratings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND auth.uid() = food_reviews.user_id
  ));

CREATE POLICY "Users can update ratings for their reviews"
  ON review_ratings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND auth.uid() = food_reviews.user_id
  ));

CREATE POLICY "Users can delete ratings for their reviews"
  ON review_ratings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM food_reviews
    WHERE food_reviews.id = review_ratings.review_id
    AND auth.uid() = food_reviews.user_id
  ));

-- Review photos table (related to food reviews)
CREATE TABLE IF NOT EXISTS review_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES food_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for review_photos
CREATE INDEX IF NOT EXISTS idx_review_photos_review_id ON review_photos(review_id);
CREATE INDEX IF NOT EXISTS idx_review_photos_user_id ON review_photos(user_id);

-- Enable Row Level Security
ALTER TABLE review_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for review_photos
CREATE POLICY "Users can view photos for their reviews"
  ON review_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert photos for their reviews"
  ON review_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update photos for their reviews"
  ON review_photos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete photos for their reviews"
  ON review_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOOD TO TRY SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS food_to_try (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cuisine TEXT NOT NULL,
  location TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id TEXT,
  tiktok_url TEXT,
  video_url TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'to_try' CHECK (status IN ('to_try', 'visited', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for food_to_try
CREATE INDEX IF NOT EXISTS idx_food_to_try_user_id ON food_to_try(user_id);
CREATE INDEX IF NOT EXISTS idx_food_to_try_cuisine ON food_to_try(cuisine);
CREATE INDEX IF NOT EXISTS idx_food_to_try_location ON food_to_try(location);
CREATE INDEX IF NOT EXISTS idx_food_to_try_status ON food_to_try(status);

-- Enable Row Level Security
ALTER TABLE food_to_try ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for food_to_try
CREATE POLICY "Users can view their own food to try"
  ON food_to_try FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food to try"
  ON food_to_try FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food to try"
  ON food_to_try FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food to try"
  ON food_to_try FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_reviews_updated_at
  BEFORE UPDATE ON food_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_to_try_updated_at
  BEFORE UPDATE ON food_to_try
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
