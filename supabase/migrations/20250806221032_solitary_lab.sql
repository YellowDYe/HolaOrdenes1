/*
  # Create recipes table and related structures

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `recipe_id` (text, unique, auto-generated RE1, RE2, etc.)
      - `recipe_name` (text, required)
      - `recipe_plan` (text, foreign key to meal_plans)
      - `recipe_container` (text, foreign key to food_containers)
      - `recipe_ingredients` (jsonb, array of ingredient objects)
      - `recipe_cooking_steps` (jsonb, array of cooking step objects)
      - `recipe_total_cost` (numeric, calculated)
      - `recipe_total_calories` (numeric, calculated)
      - `recipe_total_carbohydrate` (numeric, calculated)
      - `recipe_total_proteins` (numeric, calculated)
      - `recipe_total_fats` (numeric, calculated)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `recipes` table
    - Add policy for authenticated users to manage recipes

  3. Triggers
    - Add trigger to update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id text UNIQUE NOT NULL,
  recipe_name text NOT NULL,
  recipe_plan text,
  recipe_container text,
  recipe_ingredients jsonb DEFAULT '[]'::jsonb,
  recipe_cooking_steps jsonb DEFAULT '[]'::jsonb,
  recipe_total_cost numeric(10,2) DEFAULT 0,
  recipe_total_calories numeric(8,2) DEFAULT 0,
  recipe_total_carbohydrate numeric(8,2) DEFAULT 0,
  recipe_total_proteins numeric(8,2) DEFAULT 0,
  recipe_total_fats numeric(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE recipes 
ADD CONSTRAINT recipes_recipe_plan_fkey 
FOREIGN KEY (recipe_plan) REFERENCES meal_plans(meal_plans_id);

ALTER TABLE recipes 
ADD CONSTRAINT recipes_recipe_container_fkey 
FOREIGN KEY (recipe_container) REFERENCES food_containers(food_containers_id);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage recipes"
  ON recipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();