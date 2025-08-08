/*
  # Create suppliers table

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `supplier_id` (text, unique) - Auto-generated PV1, PV2, PV3...
      - `supplier_name` (text) - Name of the supplier
      - `contact_person` (text) - Contact person name
      - `email` (text) - Email address
      - `phone` (text) - Phone number
      - `address` (text) - Physical address
      - `description` (text) - Description of supplier
      - `is_active` (boolean) - Whether supplier is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `suppliers` table
    - Add policy for authenticated users to manage suppliers

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id text UNIQUE NOT NULL,
  supplier_name text NOT NULL,
  contact_person text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_suppliers_updated_at'
  ) THEN
    CREATE TRIGGER update_suppliers_updated_at
      BEFORE UPDATE ON suppliers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;