export interface Discount {
  id: string;
  discount_id: string;
  discount_name: string;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDiscountData {
  discount_name: string;
  discount_percentage: number;
}

export interface UpdateDiscountData {
  discount_name?: string;
  discount_percentage?: number;
}