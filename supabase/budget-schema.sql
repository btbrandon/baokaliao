-- Create budget table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_income DECIMAL(10, 2) NOT NULL DEFAULT 0,
  expenses_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.00,
  investments_percentage DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  savings_percentage DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  other_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_percentages CHECK (
    expenses_percentage + investments_percentage + savings_percentage + other_percentage = 100
  )
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own budget
CREATE POLICY "Users can view own budget"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own budget
CREATE POLICY "Users can insert own budget"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own budget
CREATE POLICY "Users can update own budget"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own budget
CREATE POLICY "Users can delete own budget"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
