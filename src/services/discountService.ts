import { supabase } from '../config/supabase';
import { Discount, CreateDiscountData, UpdateDiscountData } from '../types/discount';
import { errorLogger } from '../utils/errorLogger';

export class DiscountService {
  // Generate next discount ID (DES1, DES2, DES3...)
  private async generateNextDiscountId(): Promise<string> {
    const { data, error } = await supabase
      .from('discounts')
      .select('discount_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last discount ID:', error);
      return 'DES1';
    }

    if (!data || data.length === 0) {
      return 'DES1';
    }

    const lastId = data[0].discount_id;
    const numericPart = parseInt(lastId.replace('DES', ''));
    return `DES${numericPart + 1}`;
  }

  // Create new discount
  async createDiscount(discountData: CreateDiscountData): Promise<Discount> {
    const discount_id = await this.generateNextDiscountId();

    try {
      const { data, error } = await supabase
        .from('discounts')
        .insert([
          {
            discount_id,
            ...discountData
          }
        ])
        .select()
        .single();

      if (error) {
        errorLogger.logApiError('discounts', 'POST', new Error(error.message), undefined, error);
        throw new Error(`Error creating discount: ${error.message}`);
      }

      return data;
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'createDiscount', discountData });
      throw err;
    }
  }

  // Get all discounts
  async getDiscounts(): Promise<Discount[]> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        errorLogger.logApiError('discounts', 'GET', new Error(error.message), undefined, error);
        throw new Error(`Error fetching discounts: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'getDiscounts' });
      throw err;
    }
  }

  // Get single discount by ID
  async getDiscountById(id: string): Promise<Discount | null> {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching discount: ${error.message}`);
    }

    return data;
  }

  // Update discount
  async updateDiscount(id: string, updateData: UpdateDiscountData): Promise<Discount> {
    const { data, error } = await supabase
      .from('discounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating discount: ${error.message}`);
    }

    return data;
  }

  // Delete discount
  async deleteDiscount(id: string): Promise<void> {
    const { error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting discount: ${error.message}`);
    }
  }
}

export const discountService = new DiscountService();