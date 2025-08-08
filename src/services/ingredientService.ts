import { supabase } from '../config/supabase';
import { Ingredient, CreateIngredientData, UpdateIngredientData, IngredientWithDetails } from '../types/ingredient';

export class IngredientService {
  // Generate next ingredient ID (IG1, IG2, IG3...)
  private async generateNextIngredientId(): Promise<string> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('ingredient_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last ingredient ID:', error);
      return 'IG1';
    }

    if (!data || data.length === 0) {
      return 'IG1';
    }

    const lastId = data[0].ingredient_id;
    const numericPart = parseInt(lastId.replace('IG', ''));
    return `IG${numericPart + 1}`;
  }

  // Create new ingredient
  async createIngredient(ingredientData: CreateIngredientData): Promise<Ingredient> {
    const ingredient_id = await this.generateNextIngredientId();

    const { data, error } = await supabase
      .from('ingredients')
      .insert([
        {
          ingredient_id,
          ...ingredientData
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating ingredient: ${error.message}`);
    }

    return data;
  }

  // Get all ingredients with category and supplier details
  async getIngredients(): Promise<IngredientWithDetails[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        *,
        ingredient_categories!inner(ingredient_category),
        suppliers!inner(supplier_name)
      `)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching ingredients: ${error.message}`);
    }

    // Transform the data to include category and supplier names
    return (data || []).map(item => ({
      ...item,
      category_name: item.ingredient_categories?.ingredient_category,
      supplier_name: item.suppliers?.supplier_name
    }));
  }

  // Get single ingredient by ID
  async getIngredientById(id: string): Promise<Ingredient | null> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching ingredient: ${error.message}`);
    }

    return data;
  }

  // Update ingredient
  async updateIngredient(id: string, updateData: UpdateIngredientData): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating ingredient: ${error.message}`);
    }

    return data;
  }

  // Delete ingredient
  async deleteIngredient(id: string): Promise<void> {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting ingredient: ${error.message}`);
    }
  }
}

export const ingredientService = new IngredientService();