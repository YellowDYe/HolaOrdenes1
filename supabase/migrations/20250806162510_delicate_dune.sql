/*
  # Create food containers table

  1. New Tables
    - `food_containers`
      - `id` (uuid, primary key)
      - `food_containers_id` (text, unique) - Auto-generated starting with "FC1"
      - `food_containers_name` (text, required)
      - `food_containers_description` (text, required)
      - `food_containers_cost` (numeric, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `food_containers` table
    - Add policy for authenticated users to manage containers
    
  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS food_containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_containers_id text UNIQUE NOT NULL,
  food_containers_name text NOT NULL,
  food_containers_description text NOT NULL DEFAULT '',
  food_containers_cost numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE food_containers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage food containers"
  ON food_containers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_food_containers_updated_at
  BEFORE UPDATE ON food_containers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();