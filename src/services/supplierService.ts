import { supabase } from '../config/supabase';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '../types/supplier';

export class SupplierService {
  // Generate next supplier ID (PV1, PV2, PV3...)
  private async generateNextSupplierId(): Promise<string> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('supplier_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last supplier ID:', error);
      return 'PV1';
    }

    if (!data || data.length === 0) {
      return 'PV1';
    }

    const lastId = data[0].supplier_id;
    const numericPart = parseInt(lastId.replace('PV', ''));
    return `PV${numericPart + 1}`;
  }

  // Create new supplier
  async createSupplier(supplierData: CreateSupplierData): Promise<Supplier> {
    const supplier_id = await this.generateNextSupplierId();

    const { data, error } = await supabase
      .from('suppliers')
      .insert([
        {
          supplier_id,
          ...supplierData,
          is_active: supplierData.is_active ?? true
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating supplier: ${error.message}`);
    }

    return data;
  }

  // Get all suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching suppliers: ${error.message}`);
    }

    return data || [];
  }

  // Get single supplier by ID
  async getSupplierById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching supplier: ${error.message}`);
    }

    return data;
  }

  // Update supplier
  async updateSupplier(id: string, updateData: UpdateSupplierData): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating supplier: ${error.message}`);
    }

    return data;
  }

  // Delete supplier
  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting supplier: ${error.message}`);
    }
  }

  // Toggle supplier active status
  async toggleSupplierStatus(id: string, isActive: boolean): Promise<Supplier> {
    return this.updateSupplier(id, { is_active: isActive });
  }
}

export const supplierService = new SupplierService();