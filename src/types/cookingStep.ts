export interface CookingStep {
  id: string;
  cooking_steps_id: string;
  cooking_steps_name: string;
  cooking_steps_description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCookingStepData {
  cooking_steps_name: string;
  cooking_steps_description: string;
}

export interface UpdateCookingStepData {
  cooking_steps_name?: string;
  cooking_steps_description?: string;
}