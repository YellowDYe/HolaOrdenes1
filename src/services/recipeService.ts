import { supabase } from '../config/supabase';
import { Recipe, CreateRecipeData, UpdateRecipeData, RecipeWithDetails, RecipeIngredient } from '../types/recipe';
import { Ingredient } from '../types/ingredient';
import { errorLogger } from '../utils/errorLogger';

export class RecipeService {
  // Generate next recipe ID (RE1, RE2, RE3...)
  private async generateNextRecipeId(): Promise<string> {
    const { data, error } = await supabase
      .from('recipes')
      .select('recipe_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last recipe ID:', error);
      return 'RE1';
    }

    if (!data || data.length === 0) {
      return 'RE1';
    }

    const lastId = data[0].recipe_id;
    const numericPart = parseInt(lastId.replace('RE', ''));
    return `RE${numericPart + 1}`;
  }

  // Calculate recipe totals based on ingredients
  private async calculateRecipeTotals(ingredients: RecipeIngredient[]): Promise<{
    cost: number;
    calories: number;
    carbohydrate: number;
    proteins: number;
    fats: number;
  }> {
    let totalCost = 0;
    let totalCalories = 0;
    let totalCarbohydrate = 0;
    let totalProteins = 0;
    let totalFats = 0;

    // Get ingredient data for calculations
    const ingredientIds = ingredients.map(ing => ing.ingredient_id);
    
    if (ingredientIds.length > 0) {
      const { data: ingredientData, error } = await supabase
        .from('ingredients')
        .select('ingredient_id, ingredient_cost, ingredient_calories, ingredient_carbs, ingredient_protein, ingredient_fats')
        .in('ingredient_id', ingredientIds);

      if (error) {
        console.error('Error fetching ingredient data for calculations:', error);
        return { cost: 0, calories: 0, carbohydrate: 0, proteins: 0, fats: 0 };
      }

      // Calculate totals
      ingredients.forEach(recipeIngredient => {
        const ingredient = ingredientData?.find(ing => ing.ingredient_id === recipeIngredient.ingredient_id);
        if (ingredient) {
          const quantityInGrams = recipeIngredient.unit === 'ml' ? recipeIngredient.quantity : recipeIngredient.quantity;
          const factor = quantityInGrams / 100; // Convert to per 100g basis

          totalCost += (ingredient.ingredient_cost / 1000) * quantityInGrams; // Cost per gram
          totalCalories += ingredient.ingredient_calories * factor;
          totalCarbohydrate += ingredient.ingredient_carbs * factor;
          totalProteins += ingredient.ingredient_protein * factor;
          totalFats += ingredient.ingredient_fats * factor;
        }
      });
    }

    return {
      cost: Math.round(totalCost * 100) / 100,
      calories: Math.round(totalCalories * 100) / 100,
      carbohydrate: Math.round(totalCarbohydrate * 100) / 100,
      proteins: Math.round(totalProteins * 100) / 100,
      fats: Math.round(totalFats * 100) / 100
    };
  }

  // Create new recipe
  async createRecipe(recipeData: CreateRecipeData): Promise<Recipe> {
    const recipe_id = await this.generateNextRecipeId();
    
    try {
      // Calculate totals
      const totals = await this.calculateRecipeTotals(recipeData.recipe_ingredients);

      const { data, error } = await supabase
        .from('recipes')
        .insert([
          {
            recipe_id,
            ...recipeData,
            recipe_total_cost: totals.cost,
            recipe_total_calories: totals.calories,
            recipe_total_carbohydrate: totals.carbohydrate,
            recipe_total_proteins: totals.proteins,
            recipe_total_fats: totals.fats
          }
        ])
        .select()
        .single();

      if (error) {
        errorLogger.logApiError('recipes', 'POST', new Error(error.message), undefined, error);
        throw new Error(`Error creating recipe: ${error.message}`);
      }

      return data;
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'createRecipe', recipeData });
      throw err;
    }
  }

  // Get all recipes with plan and container details
  async getRecipes(): Promise<RecipeWithDetails[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        meal_plans!inner(meal_plans_name),
        food_containers!inner(food_containers_name)
      `)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching recipes: ${error.message}`);
    }

    // Transform the data to include plan and container names
    return (data || []).map(item => ({
      ...item,
      plan_name: item.meal_plans?.meal_plans_name,
      container_name: item.food_containers?.food_containers_name
    }));
  }

  // Get single recipe by ID
  async getRecipeById(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching recipe: ${error.message}`);
    }

    return data;
  }

  // Update recipe
  async updateRecipe(id: string, updateData: UpdateRecipeData): Promise<Recipe> {
    // Calculate totals if ingredients were updated
    let totals = null;
    if (updateData.recipe_ingredients) {
      totals = await this.calculateRecipeTotals(updateData.recipe_ingredients);
    }

    const dataToUpdate = {
      ...updateData,
      ...(totals && {
        recipe_total_cost: totals.cost,
        recipe_total_calories: totals.calories,
        recipe_total_carbohydrate: totals.carbohydrate,
        recipe_total_proteins: totals.proteins,
        recipe_total_fats: totals.fats
      })
    };

    const { data, error } = await supabase
      .from('recipes')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating recipe: ${error.message}`);
    }

    return data;
  }

  // Delete recipe
  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting recipe: ${error.message}`);
    }
  }

  // Duplicate recipe
  async duplicateRecipe(id: string): Promise<Recipe> {
    const originalRecipe = await this.getRecipeById(id);
    if (!originalRecipe) {
      throw new Error('Recipe not found');
    }

    const duplicateData: CreateRecipeData = {
      recipe_name: `${originalRecipe.recipe_name} (Copia)`,
      recipe_plan: originalRecipe.recipe_plan,
      recipe_container: originalRecipe.recipe_container,
      recipe_ingredients: originalRecipe.recipe_ingredients,
      recipe_cooking_steps: originalRecipe.recipe_cooking_steps
    };

    return this.createRecipe(duplicateData);
  }
}

export const recipeService = new RecipeService();