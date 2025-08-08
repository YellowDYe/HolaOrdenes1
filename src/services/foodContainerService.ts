import { supabase } from '../config/supabase';
import { FoodContainer, CreateFoodContainerData, UpdateFoodContainerData } from '../types/foodContainer';

export class FoodContainerService {
  // Generate next container ID (FC1, FC2, FC3...)
  private async generateNextContainerId(): Promise<string> {
    const { data, error } = await supabase
      .from('food_containers')
      .select('food_containers_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last container ID:', error);
      return 'FC1';
    }

    if (!data || data.length === 0) {
      return 'FC1';
    }

    const lastId = data[0].food_containers_id;
    const numericPart = parseInt(lastId.replace('FC', ''));
    return `FC${numericPart + 1}`;
  }

  // Create new food container
  async createContainer(containerData: CreateFoodContainerData): Promise<FoodContainer> {
    const food_containers_id = await this.generateNextContainerId();

    const { data, error } = await supabase
      .from('food_containers')
      .insert([
        {
          food_containers_id,
          ...containerData
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating container: ${error.message}`);
    }

    return data;
  }

  // Get all food containers
  async getContainers(): Promise<FoodContainer[]> {
    const { data, error } = await supabase
      .from('food_containers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching containers: ${error.message}`);
    }

    return data || [];
  }

  // Get single food container by ID
  async getContainerById(id: string): Promise<FoodContainer | null> {
    const { data, error } = await supabase
      .from('food_containers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching container: ${error.message}`);
    }

    return data;
  }

  // Update food container
  async updateContainer(id: string, updateData: UpdateFoodContainerData): Promise<FoodContainer> {
    const { data, error } = await supabase
      .from('food_containers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating container: ${error.message}`);
    }

    return data;
  }

  // Delete food container
  async deleteContainer(id: string): Promise<void> {
    const { error } = await supabase
      .from('food_containers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting container: ${error.message}`);
    }
  }
}

export const foodContainerService = new FoodContainerService();