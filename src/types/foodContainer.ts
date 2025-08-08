export interface FoodContainer {
  id: string;
  food_containers_id: string;
  food_containers_name: string;
  food_containers_description: string;
  food_containers_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFoodContainerData {
  food_containers_name: string;
  food_containers_description: string;
  food_containers_cost: number;
}

export interface UpdateFoodContainerData {
  food_containers_name?: string;
  food_containers_description?: string;
  food_containers_cost?: number;
}