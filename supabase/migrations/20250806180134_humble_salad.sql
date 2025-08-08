/*
  # Create protein plans table

  1. New Tables
    - `protein_plans`
      - `id` (uuid, primary key)
      - `protein_plans_id` (text, unique) - Auto-generated ID starting with "PP1"
      - `protein_plans_name` (text) - Plan name
      - `protein_plans_description` (text) - Plan description
      - `protein_plans_price` (numeric) - Plan price
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `protein_plans` table
    - Add policy for authenticated users to manage protein plans

  3. Functions
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS protein_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protein_plans_id text UNIQUE NOT NULL,
  protein_plans_name text NOT NULL,
  protein_plans_description text NOT NULL DEFAULT '',
  protein_plans_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE protein_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage protein plans"
  ON protein_plans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_protein_plans_updated_at
  BEFORE UPDATE ON protein_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();