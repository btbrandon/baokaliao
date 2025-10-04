-- ============================================================================
-- Migration: Budget schema to support monthly budgets with recurring
-- ============================================================================

-- Step 1: Add new columns to budgets table
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS month INTEGER;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Step 2: Set default values for existing records (current month/year)
UPDATE budgets 
SET 
  month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  is_recurring = false
WHERE month IS NULL OR year IS NULL;

-- Step 3: Make columns NOT NULL after setting defaults
ALTER TABLE budgets ALTER COLUMN month SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN year SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN is_recurring SET NOT NULL;

-- Step 4: Drop old unique constraint on user_id only
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_key;

-- Step 5: Add new unique constraint on (user_id, month, year)
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS unique_user_month_year;
ALTER TABLE budgets ADD CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year);

-- Step 6: Create new indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_date ON budgets(user_id, year, month);

-- Step 7: Add check constraint for valid month
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS check_valid_month;
ALTER TABLE budgets ADD CONSTRAINT check_valid_month CHECK (month >= 1 AND month <= 12);

-- Step 8: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'budgets' 
ORDER BY ordinal_position;

-- Show constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'budgets'::regclass;

-- ============================================================================
-- To verify everything works:
-- ============================================================================

-- Check existing budgets
SELECT id, user_id, month, year, monthly_income, is_recurring 
FROM budgets 
ORDER BY year DESC, month DESC;
