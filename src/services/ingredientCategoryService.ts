import { supabase } from '../config/supabase';
import { IngredientCategory, CreateIngredientCategoryData, UpdateIngredientCategoryData } from '../types/ingredientCategory';

export class IngredientCategoryService {
  // Generate next category ID (IC1, IC2, IC3...)
  private async generateNextCategoryId(): Promise<string> {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('ingredient_category_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last category ID:', error);
      return 'IC1';
    }

    if (!data || data.length === 0) {
      return 'IC1';
    }

    const lastId = data[0].ingredient_category_id;
    const numericPart = parseInt(lastId.replace('IC', ''));
    return `IC${numericPart + 1}`;
  }

  // Create new ingredient category
  async createCategory(categoryData: CreateIngredientCategoryData): Promise<IngredientCategory> {
    const ingredient_category_id = await this.generateNextCategoryId();

    const { data, error } = await supabase
      .from('ingredient_categories')
      .insert([
        {
          ingredient_category_id,
          ...categoryData
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }

    return data;
  }

  // Get all ingredient categories
  async getCategories(): Promise<IngredientCategory[]> {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data || [];
  }

  // Get single ingredient category by ID
  async getCategoryById(id: string): Promise<IngredientCategory | null> {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching category: ${error.message}`);
    }

    return data;
  }

  // Update ingredient category
  async updateCategory(id: string, updateData: UpdateIngredientCategoryData): Promise<IngredientCategory> {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }

    return data;
  }

  // Delete ingredient category
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('ingredient_categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }
}

export const ingredientCategoryService = new IngredientCategoryService();