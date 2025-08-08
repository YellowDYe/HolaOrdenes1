/*
  # Create Weekly Menus System

  1. New Tables
    - `weekly_menus`
      - `id` (uuid, primary key)
      - `menu_id` (text, unique, format: M1, M2, M3...)
      - `menu_name` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `weekly_menu_plans`
      - `id` (uuid, primary key)
      - `plan_id` (text, unique, format: WP1, WP2, WP3...)
      - `menu_id` (text, foreign key to weekly_menus.menu_id)
      - `meal_plan_id` (text, foreign key to meal_plans.meal_plans_id)
      - `day_of_week` (text, enum: Lunes, Martes, Miércoles, Jueves, Viernes)
      - `desayuno_recipe_id` (text, foreign key to recipes.recipe_id)
      - `colacion_am_recipe_id` (text, foreign key to recipes.recipe_id)
      - `comida_recipe_id` (text, foreign key to recipes.recipe_id)
      - `colacion_pm_recipe_id` (text, foreign key to recipes.recipe_id)
      - `cena_recipe_id` (text, foreign key to recipes.recipe_id)
      - `weekly_menu_plan_cost` (numeric, calculated field)
      - `weekly_menu_plan_calories` (numeric, calculated field)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage weekly menus
    - Add update triggers for updated_at columns

  3. Functions
    - Create update_updated_at_column function if not exists
*/

-- Create update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create weekly_menus table
CREATE TABLE IF NOT EXISTS weekly_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id text UNIQUE NOT NULL,
  menu_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create weekly_menu_plans table
CREATE TABLE IF NOT EXISTS weekly_menu_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text UNIQUE NOT NULL,
  menu_id text NOT NULL,
  meal_plan_id text NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')),
  desayuno_recipe_id text,
  colacion_am_recipe_id text,
  comida_recipe_id text,
  colacion_pm_recipe_id text,
  cena_recipe_id text,
  weekly_menu_plan_cost numeric(10,2) DEFAULT 0,
  weekly_menu_plan_calories numeric(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
DO $$
BEGIN
  -- Add foreign key to weekly_menus
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_menu_plans_menu_id_fkey'
  ) THEN
    ALTER TABLE weekly_menu_plans 
    ADD CONSTRAINT weekly_menu_plans_menu_id_fkey 
    FOREIGN KEY (menu_id) REFERENCES weekly_menus(menu_id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to meal_plans
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_menu_plans_meal_plan_id_fkey'
  ) THEN
    ALTER TABLE weekly_menu_plans 
    ADD CONSTRAINT weekly_menu_plans_meal_plan_id_fkey 
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(meal_plans_id);
  END IF;

  -- Add foreign keys to recipes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_menu_plans_desayuno_recipe_id_fkey'
  ) THEN
    ALTER TABLE weekly_menu_plans 
    ADD CONSTRAINT weekly_menu_plans_desayuno_recipe_id_fkey 
    FOREIGN KEY (desayuno_recipe_id) REFERENCES recipes(recipe_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_menu_plans_colacion_am_recipe_id_fkey'
  ) THEN
    ALTER TABLE weekly_menu_plans 
    ADD CONSTRAINT weekly_menu_plans_colacion_am_recipe_id_fkey 
    FOREIGN KEY (colacion_am_recipe_id) REFERENCES recipes(recipe_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_menu_plans_comida_recipe_id_fkey'
  ) THEN
    ALTER TABLE weekly_menu_plans 
    ADD CONSTRAINT weekly_menu_plans_comida_recipe_id_fkey 
    FOREIGN KEY (comida_recipe_id) REFERENCES recipes(recipe_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_menu_plans_colacion_pm_recipe_id_fkey'
  ) THEN
    ALTER TABLE weekly_menu_plans 
    ADD CONSTRAINT weekly_menu_plans_colacion_pm_recipe_id_fkey 
    FOREIGN KEY (colacion_pm_recipe_id) REFERENCES recipes(recipe_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_menu_plans_cena_recipe_id_fkey'
  ) THEN
    ALTER TABLE weekly_menu_plans 
    ADD CONSTRAINT weekly_menu_plans_cena_recipe_id_fkey 
    FOREIGN KEY (cena_recipe_id) REFERENCES recipes(recipe_id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menu_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_menus
CREATE POLICY "Users can manage weekly menus"
  ON weekly_menus
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for weekly_menu_plans
CREATE POLICY "Users can manage weekly menu plans"
  ON weekly_menu_plans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_weekly_menus_updated_at
  BEFORE UPDATE ON weekly_menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_menu_plans_updated_at
  BEFORE UPDATE ON weekly_menu_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS weekly_menus_menu_id_idx ON weekly_menus(menu_id);
CREATE INDEX IF NOT EXISTS weekly_menus_created_at_idx ON weekly_menus(created_at);
CREATE INDEX IF NOT EXISTS weekly_menu_plans_menu_id_idx ON weekly_menu_plans(menu_id);
CREATE INDEX IF NOT EXISTS weekly_menu_plans_meal_plan_id_idx ON weekly_menu_plans(meal_plan_id);
CREATE INDEX IF NOT EXISTS weekly_menu_plans_day_of_week_idx ON weekly_menu_plans(day_of_week);