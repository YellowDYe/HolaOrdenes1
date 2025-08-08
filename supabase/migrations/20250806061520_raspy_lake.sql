/*
  # Create ingredient categories table

  1. New Tables
    - `ingredient_categories`
      - `id` (uuid, primary key)
      - `ingredient_category_id` (text, unique custom ID starting with IC1)
      - `ingredient_category` (text, category name)
      - `description` (text, category description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ingredient_categories` table
    - Add policy for authenticated users to manage categories
*/

CREATE TABLE IF NOT EXISTS ingredient_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_category_id text UNIQUE NOT NULL,
  ingredient_category text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ingredient_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ingredient categories"
  ON ingredient_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ingredient_categories_updated_at
    BEFORE UPDATE ON ingredient_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();