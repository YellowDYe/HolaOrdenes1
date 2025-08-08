/*
  # Create meal plans table

  1. New Tables
    - `meal_plans`
      - `id` (uuid, primary key)
      - `meal_plans_id` (text, unique) - Auto-generated ID starting with "MP1"
      - `meal_plans_name` (text) - Plan name
      - `meal_plans_description` (text) - Plan description
      - `meal_plans_price` (numeric) - Plan price in MXN
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `meal_plans` table
    - Add policy for authenticated users to manage meal plans

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create the meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plans_id text UNIQUE NOT NULL,
  meal_plans_name text NOT NULL,
  meal_plans_description text NOT NULL DEFAULT '',
  meal_plans_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage meal plans
CREATE POLICY "Users can manage meal plans"
  ON meal_plans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger function for updating updated_at timestamp (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();