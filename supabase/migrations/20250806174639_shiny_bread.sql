/*
  # Create delivery options table

  1. New Tables
    - `delivery_options`
      - `id` (uuid, primary key)
      - `delivery_options_id` (text, unique) - Auto-generated ID starting with "DO1"
      - `delivery_options_name` (text) - Name of the delivery option
      - `delivery_options_description` (text) - Description of the delivery option
      - `delivery_options_price` (numeric) - Price of the delivery option
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `delivery_options` table
    - Add policy for authenticated users to manage delivery options

  3. Functions
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS delivery_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_options_id text UNIQUE NOT NULL,
  delivery_options_name text NOT NULL,
  delivery_options_description text NOT NULL DEFAULT '',
  delivery_options_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage delivery options"
  ON delivery_options
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at column
CREATE TRIGGER update_delivery_options_updated_at
  BEFORE UPDATE ON delivery_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();