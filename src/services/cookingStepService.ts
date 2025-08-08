import { supabase } from '../config/supabase';
import { CookingStep, CreateCookingStepData, UpdateCookingStepData } from '../types/cookingStep';

export class CookingStepService {
  // Generate next cooking step ID (CS1, CS2, CS3...)
  private async generateNextStepId(): Promise<string> {
    const { data, error } = await supabase
      .from('cooking_steps')
      .select('cooking_steps_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last cooking step ID:', error);
      return 'CS1';
    }

    if (!data || data.length === 0) {
      return 'CS1';
    }

    const lastId = data[0].cooking_steps_id;
    const numericPart = parseInt(lastId.replace('CS', ''));
    return `CS${numericPart + 1}`;
  }

  // Create new cooking step
  async createStep(stepData: CreateCookingStepData): Promise<CookingStep> {
    const cooking_steps_id = await this.generateNextStepId();

    const { data, error } = await supabase
      .from('cooking_steps')
      .insert([
        {
          cooking_steps_id,
          ...stepData
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating cooking step: ${error.message}`);
    }

    return data;
  }

  // Get all cooking steps
  async getSteps(): Promise<CookingStep[]> {
    const { data, error } = await supabase
      .from('cooking_steps')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching cooking steps: ${error.message}`);
    }

    return data || [];
  }

  // Get single cooking step by ID
  async getStepById(id: string): Promise<CookingStep | null> {
    const { data, error } = await supabase
      .from('cooking_steps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching cooking step: ${error.message}`);
    }

    return data;
  }

  // Update cooking step
  async updateStep(id: string, updateData: UpdateCookingStepData): Promise<CookingStep> {
    const { data, error } = await supabase
      .from('cooking_steps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating cooking step: ${error.message}`);
    }

    return data;
  }

  // Delete cooking step
  async deleteStep(id: string): Promise<void> {
    const { error } = await supabase
      .from('cooking_steps')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting cooking step: ${error.message}`);
    }
  }
}

export const cookingStepService = new CookingStepService();