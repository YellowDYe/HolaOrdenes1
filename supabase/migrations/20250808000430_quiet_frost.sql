/*
  # Create discounts table

  1. New Tables
    - `discounts`
      - `id` (uuid, primary key)
      - `discount_id` (text, unique, auto-generated starting with "DES")
      - `discount_name` (text, required)
      - `discount_percentage` (numeric, required, percentage value)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `discounts` table
    - Add policy for authenticated users to manage discounts

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id text UNIQUE NOT NULL,
  discount_name text NOT NULL,
  discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage discounts"
  ON discounts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS discounts_discount_id_idx ON discounts(discount_id);
CREATE INDEX IF NOT EXISTS discounts_created_at_idx ON discounts(created_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();