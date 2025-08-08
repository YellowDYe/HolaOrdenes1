import { supabase } from '../config/supabase';
import { Tax, CreateTaxData, UpdateTaxData } from '../types/tax';
import { errorLogger } from '../utils/errorLogger';

export class TaxService {
  // Generate next tax ID (TAX1, TAX2, TAX3...)
  private async generateNextTaxId(): Promise<string> {
    const { data, error } = await supabase
      .from('taxes')
      .select('tax_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last tax ID:', error);
      return 'TAX1';
    }

    if (!data || data.length === 0) {
      return 'TAX1';
    }

    const lastId = data[0].tax_id;
    const numericPart = parseInt(lastId.replace('TAX', ''));
    return `TAX${numericPart + 1}`;
  }

  // Create new tax
  async createTax(taxData: CreateTaxData): Promise<Tax> {
    const tax_id = await this.generateNextTaxId();

    try {
      const { data, error } = await supabase
        .from('taxes')
        .insert([
          {
            tax_id,
            ...taxData
          }
        ])
        .select()
        .single();

      if (error) {
        errorLogger.logApiError('taxes', 'POST', new Error(error.message), undefined, error);
        throw new Error(`Error creating tax: ${error.message}`);
      }

      return data;
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'createTax', taxData });
      throw err;
    }
  }

  // Get all taxes
  async getTaxes(): Promise<Tax[]> {
    try {
      const { data, error } = await supabase
        .from('taxes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        errorLogger.logApiError('taxes', 'GET', new Error(error.message), undefined, error);
        throw new Error(`Error fetching taxes: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'getTaxes' });
      throw err;
    }
  }

  // Get single tax by ID
  async getTaxById(id: string): Promise<Tax | null> {
    const { data, error } = await supabase
      .from('taxes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching tax: ${error.message}`);
    }

    return data;
  }

  // Update tax
  async updateTax(id: string, updateData: UpdateTaxData): Promise<Tax> {
    const { data, error } = await supabase
      .from('taxes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating tax: ${error.message}`);
    }

    return data;
  }

  // Delete tax
  async deleteTax(id: string): Promise<void> {
    const { error } = await supabase
      .from('taxes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting tax: ${error.message}`);
    }
  }
}

export const taxService = new TaxService();