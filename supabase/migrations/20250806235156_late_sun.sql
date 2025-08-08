/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `customer_id` (text, unique, auto-generated)
      - `customer_name` (text, required)
      - `customer_lastname` (text, required)
      - `customer_email` (text, required, unique)
      - `customer_phone` (text, required)
      - `customer_street` (text, required)
      - `customer_street_number` (text, required)
      - `customer_interior_number` (text, optional)
      - `customer_colonia` (text, required)
      - `customer_delegacion` (text, required)
      - `customer_postal_code` (text, required)
      - `customer_delivery_instructions` (text, optional)
      - `customer_restrictions` (jsonb, optional)
      - `customer_notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `customers` table
    - Add policy for authenticated users to manage customer data

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_lastname text NOT NULL,
  customer_email text UNIQUE NOT NULL,
  customer_phone text NOT NULL,
  customer_street text NOT NULL,
  customer_street_number text NOT NULL,
  customer_interior_number text DEFAULT '',
  customer_colonia text NOT NULL,
  customer_delegacion text NOT NULL,
  customer_postal_code text NOT NULL,
  customer_delivery_instructions text DEFAULT '',
  customer_restrictions jsonb DEFAULT '[]'::jsonb,
  customer_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage customers
CREATE POLICY "Users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS customers_customer_id_idx ON customers(customer_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers(customer_email);
CREATE INDEX IF NOT EXISTS customers_created_at_idx ON customers(created_at);