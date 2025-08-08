export interface Customer {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  customer_street: string;
  customer_street_number: string;
  customer_interior_number: string;
  customer_colonia: string;
  customer_delegacion: string;
  customer_postal_code: string;
  customer_delivery_instructions: string;
  customer_restrictions: string[];
  customer_notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  customer_name: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  customer_street: string;
  customer_street_number: string;
  customer_interior_number?: string;
  customer_colonia: string;
  customer_delegacion: string;
  customer_postal_code: string;
  customer_delivery_instructions?: string;
  customer_restrictions?: string[];
  customer_notes?: string;
}

export interface UpdateCustomerData {
  customer_name?: string;
  customer_lastname?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_street?: string;
  customer_street_number?: string;
  customer_interior_number?: string;
  customer_colonia?: string;
  customer_delegacion?: string;
  customer_postal_code?: string;
  customer_delivery_instructions?: string;
  customer_restrictions?: string[];
  customer_notes?: string;
}

// Helper interface for displaying full customer name
export interface CustomerWithFullName extends Customer {
  full_name: string;
}