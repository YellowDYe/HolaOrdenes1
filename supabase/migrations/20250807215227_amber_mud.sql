/*
  # Create weeks table

  1. New Tables
    - `weeks`
      - `id` (uuid, primary key)
      - `week_id` (text, unique) - Auto-generated starting with "WK1"
      - `week_name` (text, required) - Name of the week
      - `weekly_menu` (text, foreign key) - References weekly_menus.menu_id
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `weeks` table
    - Add policy for authenticated users to manage weeks

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create weeks table
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
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_menus') THEN
    ALTER TABLE weeks ADD CONSTRAINT weeks_weekly_menu_fkey 
    FOREIGN KEY (weekly_menu) REFERENCES weekly_menus(menu_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage weeks"
  ON weeks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS weeks_week_id_idx ON weeks(week_id);
CREATE INDEX IF NOT EXISTS weeks_weekly_menu_idx ON weeks(weekly_menu);
CREATE INDEX IF NOT EXISTS weeks_created_at_idx ON weeks(created_at);