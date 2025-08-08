export interface Supplier {
  id: string;
  supplier_id: string;
  supplier_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  supplier_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  is_active?: boolean;
}

export interface UpdateSupplierData {
  supplier_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  is_active?: boolean;
}