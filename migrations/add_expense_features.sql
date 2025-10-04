-- Migration: Add new expense features
-- Features: Recurring expenses, receipts, notes
-- Date: 2025-10-04

-- Add new columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_day INTEGER;

-- Add comment to columns for documentation
COMMENT ON COLUMN expenses.notes IS 'Additional notes or details about the expense';
COMMENT ON COLUMN expenses.receipt_url IS 'URL or base64 data of the receipt image';
COMMENT ON COLUMN expenses.is_recurring IS 'Whether this expense repeats monthly';
COMMENT ON COLUMN expenses.recurring_day IS 'Day of month (1-31) when recurring expense occurs';

-- Create index for efficient recurring expense queries
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(user_id, is_recurring);

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'expenses' 
ORDER BY ordinal_position;
