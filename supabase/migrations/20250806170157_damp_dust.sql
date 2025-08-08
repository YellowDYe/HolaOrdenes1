/*
  # Remove cooking_steps_cost column

  1. Changes
    - Remove `cooking_steps_cost` column from `cooking_steps` table
    - This field is no longer needed for cooking process management

  2. Security
    - No changes to RLS policies needed
*/

-- Remove the cooking_steps_cost column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cooking_steps' AND column_name = 'cooking_steps_cost'
  ) THEN
    ALTER TABLE cooking_steps DROP COLUMN cooking_steps_cost;
  END IF;
END $$;