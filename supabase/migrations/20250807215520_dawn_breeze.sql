/*
  # Create weeks table with RLS

  1. New Tables
    - `weeks`
      - `id` (uuid, primary key)
      - `week_id` (text, unique, auto-generated WK1, WK2, etc.)
      - `week_name` (text, required)
      - `weekly_menu` (text, foreign key to weekly_menus.menu_id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `weeks` table
    - Add policy for authenticated users to manage weeks

  3. Indexes
    - Add indexes for performance on commonly queried fields

  4. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create weeks table if it doesn't exist
CREATE TABLE IF NOT EXISTS weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id text UNIQUE NOT NULL,
  week_name text NOT NULL,
  weekly_menu text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to weekly_menus
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weeks_weekly_menu_fkey'
  ) THEN
    ALTER TABLE weeks 
    ADD CONSTRAINT weeks_weekly_menu_fkey 
    FOREIGN KEY (weekly_menu) REFERENCES weekly_menus(menu_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weeks' AND policyname = 'Users can manage weeks'
  ) THEN
    CREATE POLICY "Users can manage weeks"
      ON weeks
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS weeks_week_id_idx ON weeks(week_id);
CREATE INDEX IF NOT EXISTS weeks_weekly_menu_idx ON weeks(weekly_menu);
CREATE INDEX IF NOT EXISTS weeks_created_at_idx ON weeks(created_at);

-- Create trigger function for updating updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for weeks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_weeks_updated_at'
  ) THEN
    CREATE TRIGGER update_weeks_updated_at
      BEFORE UPDATE ON weeks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;