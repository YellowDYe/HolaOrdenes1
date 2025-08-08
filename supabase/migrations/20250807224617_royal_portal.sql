/*
  # Create taxes table

  1. New Tables
    - `taxes`
      - `id` (uuid, primary key)
      - `tax_id` (text, unique) - Auto-generated starting with TAX1
      - `tax_name` (text) - Name of the tax
      - `tax_percentage` (numeric) - Tax percentage
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `taxes` table
    - Add policy for authenticated users to manage taxes

  3. Indexes
    - Index on tax_id for faster lookups
    - Index on created_at for sorting

  4. Triggers
    - Auto-update updated_at timestamp
*/

-- Create taxes table
CREATE TABLE IF NOT EXISTS taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_id text UNIQUE NOT NULL,
  tax_name text NOT NULL,
  tax_percentage numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage taxes"
  ON taxes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS taxes_tax_id_idx ON taxes(tax_id);
CREATE INDEX IF NOT EXISTS taxes_created_at_idx ON taxes(created_at);

-- Create trigger for updating updated_at timestamp
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
    WHERE trigger_name = 'update_taxes_updated_at'
  ) THEN
    CREATE TRIGGER update_taxes_updated_at
      BEFORE UPDATE ON taxes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;