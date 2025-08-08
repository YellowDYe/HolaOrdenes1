export interface Recipe {
  id: string;
  recipe_id: string;
  recipe_name: string;
  recipe_image_url: string;
  recipe_plan: string;
  recipe_container: string;
  recipe_ingredients: RecipeIngredient[];
  recipe_cooking_steps: RecipeCookingStep[];
  recipe_total_cost: number;
  recipe_total_calories: number;
  recipe_total_carbohydrate: number;
  recipe_total_proteins: number;
  recipe_total_fats: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  quantity: number;
  unit: 'gr' | 'ml';
  restriction_management?: 'Block' | 'Remove' | 'Ignore' | 'Substitute';
  substitution_ingredient_id?: string;
}

export interface RecipeCookingStep {
  cooking_step_id: string;
  ingredient_id: string;
  ingredient_quantity: number;
}

export interface CreateRecipeData {
  recipe_name: string;
  recipe_image_url: string;
  recipe_plan: string;
  recipe_container: string;
  recipe_ingredients: RecipeIngredient[];
  recipe_cooking_steps: RecipeCookingStep[];
}

export interface UpdateRecipeData {
  recipe_name?: string;
  recipe_image_url?: string;
  recipe_plan?: string;
  recipe_container?: string;
  recipe_ingredients?: RecipeIngredient[];
  recipe_cooking_steps?: RecipeCookingStep[];
}

// Extended interface with plan and container names for display
export interface RecipeWithDetails extends Recipe {
  plan_name?: string;
  container_name?: string;
}