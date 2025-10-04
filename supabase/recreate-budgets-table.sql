-- ============================================================================
-- IMPORTANT: Run this in Supabase SQL Editor
-- This will drop and recreate the budgets table with the new monthly schema
-- WARNING: This will delete all existing budget data!
-- ============================================================================

-- Step 1: Drop the old budgets table (this removes all data and constraints)
DROP TABLE IF EXISTS budgets CASCADE;

-- Step 2: Create new budgets table with monthly support
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  monthly_income DECIMAL(10, 2) NOT NULL DEFAULT 0,
  expenses_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.00,
  investments_percentage DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  savings_percentage DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  other_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint: one budget per user per month/year
  CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year),
  
  -- Check constraint: percentages must total 100
  CONSTRAINT valid_percentages CHECK (
    expenses_percentage + investments_percentage + savings_percentage + other_percentage = 100
  )
);

-- Step 3: Create indexes
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_user_date ON budgets(user_id, year, month);

-- Step 4: Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Users can view own budget"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Grant permissions
GRANT ALL ON budgets TO postgres, anon, authenticated, service_role;

-- Step 7: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'budgets' 
ORDER BY ordinal_position;

-- ============================================================================
-- Done! The budgets table now supports monthly budgets.
-- ============================================================================
