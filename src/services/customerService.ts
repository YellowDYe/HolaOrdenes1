import { supabase } from '../config/supabase';
import { Customer, CreateCustomerData, UpdateCustomerData, CustomerWithFullName } from '../types/customer';
import { errorLogger } from '../utils/errorLogger';

export class CustomerService {
  // Generate next customer ID (CL1, CL2, CL3...)
  private async generateNextCustomerId(): Promise<string> {
    const { data, error } = await supabase
      .from('customers')
      .select('customer_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last customer ID:', error);
      return 'CL1';
    }

    if (!data || data.length === 0) {
      return 'CL1';
    }

    const lastId = data[0].customer_id;
    const numericPart = parseInt(lastId.replace('CL', ''));
    return `CL${numericPart + 1}`;
  }

  // Create new customer
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    const customer_id = await this.generateNextCustomerId();

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            customer_id,
            ...customerData,
            customer_interior_number: customerData.customer_interior_number || '',
            customer_delivery_instructions: customerData.customer_delivery_instructions || '',
            customer_restrictions: customerData.customer_restrictions || [],
            customer_notes: customerData.customer_notes || ''
          }
        ])
        .select()
        .single();

      if (error) {
        errorLogger.logApiError('customers', 'POST', new Error(error.message), undefined, error);
        throw new Error(`Error creating customer: ${error.message}`);
      }

      return data;
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'createCustomer', customerData });
      throw err;
    }
  }

  // Get all customers with full name
  async getCustomers(): Promise<CustomerWithFullName[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        errorLogger.logApiError('customers', 'GET', new Error(error.message), undefined, error);
        throw new Error(`Error fetching customers: ${error.message}`);
      }

      // Add full name for display purposes
      return (data || []).map(customer => ({
        ...customer,
        full_name: `${customer.customer_name} ${customer.customer_lastname}`
      }));
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'getCustomers' });
      throw err;
    }
  }

  // Get single customer by ID
  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching customer: ${error.message}`);
    }

    return data;
  }

  // Update customer
  async updateCustomer(id: string, updateData: UpdateCustomerData): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }

    return data;
  }

  // Delete customer
  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }

  // Get ingredients with restrictions for dropdown
  async getRestrictedIngredients(): Promise<Array<{ id: string; name: string; type: 'restriction' | 'spicy' }>> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('ingredient_id, ingredient_name, ingredient_restriction, ingredient_spicy')
      .or('ingredient_restriction.eq.true,ingredient_spicy.eq.true');

    if (error) {
      throw new Error(`Error fetching restricted ingredients: ${error.message}`);
    }

    // Transform data to include restriction type
    const restrictedIngredients = (data || []).flatMap(ingredient => {
      const results = [];
      if (ingredient.ingredient_restriction) {
        results.push({
          id: `${ingredient.ingredient_id}_restriction`,
          name: `${ingredient.ingredient_name} (Restricción dietética)`,
          type: 'restriction' as const
        });
      }
      if (ingredient.ingredient_spicy) {
        results.push({
          id: `${ingredient.ingredient_id}_spicy`,
          name: `${ingredient.ingredient_name} (Picante)`,
          type: 'spicy' as const
        });
      }
      return results;
    });

    return restrictedIngredients;
  }

  // Search customers by name, email, or phone
  async searchCustomers(searchTerm: string): Promise<CustomerWithFullName[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`customer_name.ilike.%${searchTerm}%,customer_lastname.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error searching customers: ${error.message}`);
    }

    return (data || []).map(customer => ({
      ...customer,
      full_name: `${customer.customer_name} ${customer.customer_lastname}`
    }));
  }
}

export const customerService = new CustomerService();