export interface Tax {
  id: string;
  tax_id: string;
  tax_name: string;
  tax_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaxData {
  tax_name: string;
  tax_percentage: number;
}

export interface UpdateTaxData {
  tax_name?: string;
  tax_percentage?: number;
}