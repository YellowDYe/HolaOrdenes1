/*
  # Create ingredients table

  1. New Tables
    - `ingredients`
      - `id` (uuid, primary key)
      - `ingredient_id` (text, unique, auto-generated IG1, IG2, etc.)
      - `ingredient_name` (text, required)
      - `ingredient_category_id` (text, foreign key reference)
      - `supplier_id` (text, foreign key reference)
      - `ingredient_restriction` (boolean, dietary restrictions)
      - `ingredient_spicy` (boolean, spicy indicator)
      - `ingredient_calories` (numeric, calories per 100g)
      - `ingredient_carbs` (numeric, carbohydrates per 100g)
      - `ingredient_protein` (numeric, protein per 100g)
      - `ingredient_fats` (numeric, fats per 100g)
      - `ingredient_cost` (numeric, cost per kg/liter)
      - `ingredient_shrinkage` (numeric, waste percentage)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ingredients` table
    - Add policy for authenticated users to manage ingredients

  3. Triggers
    - Add trigger to update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id text UNIQUE NOT NULL,
  ingredient_name text NOT NULL,
  ingredient_category_id text REFERENCES ingredient_categories(ingredient_category_id),
  supplier_id text REFERENCES suppliers(supplier_id),
  ingredient_restriction boolean DEFAULT false,
  ingredient_spicy boolean DEFAULT false,
  ingredient_calories numeric(8,2) DEFAULT 0,
  ingredient_carbs numeric(8,2) DEFAULT 0,
  ingredient_protein numeric(8,2) DEFAULT 0,
  ingredient_fats numeric(8,2) DEFAULT 0,
  ingredient_cost numeric(10,2) DEFAULT 0,
  ingredient_shrinkage numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ingredients"
  ON ingredients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();