/*
  # Add image field to recipes table

  1. Schema Changes
    - Add `recipe_image_url` column to `recipes` table
    - Column stores the URL/path to the uploaded image
    - Optional field with default empty string

  2. Notes
    - Images will be stored as URLs (can be external URLs or file paths)
    - Field is optional to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'recipe_image_url'
  ) THEN
    ALTER TABLE recipes ADD COLUMN recipe_image_url text DEFAULT '' NOT NULL;
  END IF;
END $$;