/*
  # Create cooking steps table

  1. New Tables
    - `cooking_steps`
      - `id` (uuid, primary key)
      - `cooking_steps_id` (text, unique) - Auto-generated starting with "CS1"
      - `cooking_steps_name` (text, not null)
      - `cooking_steps_description` (text, not null)
      - `cooking_steps_cost` (numeric, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `cooking_steps` table
    - Add policy for authenticated users to manage cooking steps

  3. Functions
    - Add trigger for automatic `updated_at` timestamp
*/

-- Create cooking_steps table
CREATE TABLE IF NOT EXISTS cooking_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooking_steps_id text UNIQUE NOT NULL,
  cooking_steps_name text NOT NULL,
  cooking_steps_description text NOT NULL DEFAULT '',
  cooking_steps_cost numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cooking_steps ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage cooking steps"
  ON cooking_steps
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_cooking_steps_updated_at
  BEFORE UPDATE ON cooking_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();