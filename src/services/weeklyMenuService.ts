import { supabase } from '../config/supabase';
import { 
  WeeklyMenu, 
  WeeklyMenuPlan,
  CreateWeeklyMenuData, 
  UpdateWeeklyMenuData, 
  WeeklyMenuWithDetails,
  WeeklyMenuPlanWithDetails,
  CreateWeeklyMenuPlanData
} from '../types/weeklyMenu';

export class WeeklyMenuService {
  // Generate next menu ID (M1, M2, M3...)
  private async generateNextMenuId(): Promise<string> {
    const { data, error } = await supabase
      .from('weekly_menus')
      .select('menu_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last menu ID:', error);
      return 'M1';
    }

    if (!data || data.length === 0) {
      return 'M1';
    }

    const lastId = data[0].menu_id;
    const numericPart = parseInt(lastId.replace('M', ''));
    return `M${numericPart + 1}`;
  }

  // Generate next plan ID (WP1, WP2, WP3...)
  private async getLatestPlanIdNumeric(): Promise<number> {
    const { data, error } = await supabase
      .from('weekly_menu_plans')
      .select('plan_id');

    if (error) {
      console.error('Error fetching last plan ID:', error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Extract all numeric parts and find the maximum
    const numericParts = data
      .map(item => parseInt(item.plan_id.replace('WP', '')))
      .filter(num => !isNaN(num));
    
    return numericParts.length > 0 ? Math.max(...numericParts) : 0;
  }

  // Calculate plan totals based on selected recipes
  private async calculatePlanTotals(planData: CreateWeeklyMenuPlanData): Promise<{
    cost: number;
    calories: number;
  }> {
    const recipeIds = [
      planData.desayuno_recipe_id,
      planData.colacion_am_recipe_id,
      planData.comida_recipe_id,
      planData.colacion_pm_recipe_id,
      planData.cena_recipe_id
    ].filter(Boolean);

    if (recipeIds.length === 0) {
      return { cost: 0, calories: 0 };
    }

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('recipe_total_cost, recipe_total_calories')
      .in('recipe_id', recipeIds);

    if (error) {
      console.error('Error fetching recipe data for calculations:', error);
      return { cost: 0, calories: 0 };
    }

    const totalCost = recipes?.reduce((sum, recipe) => sum + (recipe.recipe_total_cost || 0), 0) || 0;
    const totalCalories = recipes?.reduce((sum, recipe) => sum + (recipe.recipe_total_calories || 0), 0) || 0;

    return {
      cost: Math.round(totalCost * 100) / 100,
      calories: Math.round(totalCalories * 100) / 100
    };
  }

  // Create new weekly menu
  async createWeeklyMenu(menuData: CreateWeeklyMenuData): Promise<WeeklyMenu> {
    const menu_id = await this.generateNextMenuId();
    
    // Get the latest plan ID numeric value once for this operation
    let latestPlanIdNumeric = await this.getLatestPlanIdNumeric();

    // Start transaction
    const { data: menu, error: menuError } = await supabase
      .from('weekly_menus')
      .insert([
        {
          menu_id,
          menu_name: menuData.menu_name
        }
      ])
      .select()
      .single();

    if (menuError) {
      throw new Error(`Error creating weekly menu: ${menuError.message}`);
    }

    // Create menu plans
    const planPromises = menuData.plans.map(async (planData) => {
      // Increment for each plan to ensure uniqueness within this operation
      latestPlanIdNumeric++;
      const plan_id = `WP${latestPlanIdNumeric}`;
      const totals = await this.calculatePlanTotals(planData);

      return {
        plan_id,
        menu_id,
        ...planData,
        weekly_menu_plan_cost: totals.cost,
        weekly_menu_plan_calories: totals.calories
      };
    });

    const plansToInsert = await Promise.all(planPromises);

    if (plansToInsert.length > 0) {
      const { error: plansError } = await supabase
        .from('weekly_menu_plans')
        .insert(plansToInsert);

      if (plansError) {
        // Rollback menu creation if plans fail
        await supabase.from('weekly_menus').delete().eq('id', menu.id);
        throw new Error(`Error creating weekly menu plans: ${plansError.message}`);
      }
    }

    return menu;
  }

  // Get all weekly menus
  async getWeeklyMenus(): Promise<WeeklyMenu[]> {
    const { data, error } = await supabase
      .from('weekly_menus')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching weekly menus: ${error.message}`);
    }

    return data || [];
  }

  // Get single weekly menu by ID with full details
  async getWeeklyMenuById(id: string): Promise<WeeklyMenuWithDetails | null> {
    const { data: menu, error: menuError } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('id', id)
      .single();

    if (menuError) {
      if (menuError.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching weekly menu: ${menuError.message}`);
    }

    // Get menu plans with details
    const { data: plans, error: plansError } = await supabase
      .from('weekly_menu_plans')
      .select(`
        *,
        meal_plans!inner(meal_plans_name),
        desayuno_recipe:recipes!weekly_menu_plans_desayuno_recipe_id_fkey(recipe_name),
        colacion_am_recipe:recipes!weekly_menu_plans_colacion_am_recipe_id_fkey(recipe_name),
        comida_recipe:recipes!weekly_menu_plans_comida_recipe_id_fkey(recipe_name),
        colacion_pm_recipe:recipes!weekly_menu_plans_colacion_pm_recipe_id_fkey(recipe_name),
        cena_recipe:recipes!weekly_menu_plans_cena_recipe_id_fkey(recipe_name)
      `)
      .eq('menu_id', menu.menu_id)
      .order('day_of_week');

    if (plansError) {
      throw new Error(`Error fetching weekly menu plans: ${plansError.message}`);
    }

    // Transform plans data
    const transformedPlans: WeeklyMenuPlanWithDetails[] = (plans || []).map(plan => ({
      ...plan,
      meal_plan_name: plan.meal_plans?.meal_plans_name,
      desayuno_recipe_name: plan.desayuno_recipe?.recipe_name,
      colacion_am_recipe_name: plan.colacion_am_recipe?.recipe_name,
      comida_recipe_name: plan.comida_recipe?.recipe_name,
      colacion_pm_recipe_name: plan.colacion_pm_recipe?.recipe_name,
      cena_recipe_name: plan.cena_recipe?.recipe_name
    }));

    // Calculate totals
    const total_cost = transformedPlans.reduce((sum, plan) => sum + (plan.weekly_menu_plan_cost || 0), 0);
    const total_calories = transformedPlans.reduce((sum, plan) => sum + (plan.weekly_menu_plan_calories || 0), 0);

    return {
      ...menu,
      plans: transformedPlans,
      total_cost: Math.round(total_cost * 100) / 100,
      total_calories: Math.round(total_calories * 100) / 100
    };
  }

  // Update weekly menu
  async updateWeeklyMenu(id: string, updateData: UpdateWeeklyMenuData): Promise<WeeklyMenu> {
    // Get the latest plan ID numeric value once for this operation
    let latestPlanIdNumeric = await this.getLatestPlanIdNumeric();
    
    // Update menu basic info
    const { data: menu, error: menuError } = await supabase
      .from('weekly_menus')
      .update({ menu_name: updateData.menu_name })
      .eq('id', id)
      .select()
      .single();

    if (menuError) {
      throw new Error(`Error updating weekly menu: ${menuError.message}`);
    }

    // Update plans if provided
    if (updateData.plans) {
      // Delete existing plans
      const { error: deleteError } = await supabase
        .from('weekly_menu_plans')
        .delete()
        .eq('menu_id', menu.menu_id);

      if (deleteError) {
        throw new Error(`Error deleting existing plans: ${deleteError.message}`);
      }

      // Create new plans
      const planPromises = updateData.plans.map(async (planData) => {
        // Increment for each plan to ensure uniqueness within this operation
        latestPlanIdNumeric++;
        const plan_id = `WP${latestPlanIdNumeric}`;
        const totals = await this.calculatePlanTotals(planData);

        return {
          plan_id,
          menu_id: menu.menu_id,
          ...planData,
          weekly_menu_plan_cost: totals.cost,
          weekly_menu_plan_calories: totals.calories
        };
      });

      const plansToInsert = await Promise.all(planPromises);

      if (plansToInsert.length > 0) {
        const { error: plansError } = await supabase
          .from('weekly_menu_plans')
          .insert(plansToInsert);

        if (plansError) {
          throw new Error(`Error creating updated plans: ${plansError.message}`);
        }
      }
    }

    return menu;
  }

  // Delete weekly menu
  async deleteWeeklyMenu(id: string): Promise<void> {
    const { error } = await supabase
      .from('weekly_menus')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting weekly menu: ${error.message}`);
    }
  }

  // Get available recipes for dropdowns
  async getAvailableRecipes(): Promise<Array<{ recipe_id: string; recipe_name: string; recipe_plan: string; recipe_total_cost: number; recipe_total_calories: number }>> {
    const { data, error } = await supabase
      .from('recipes')
      .select('recipe_id, recipe_name, recipe_plan, recipe_total_cost, recipe_total_calories')
      .order('recipe_name');

    if (error) {
      console.error('Error fetching recipes:', error);
      throw new Error(`Error fetching recipes: ${error.message}`);
    }

    console.log('Fetched recipes from database:', data);
    return data || [];
  }

  // Get recipes filtered by meal plan
  async getRecipesByPlan(planId: string): Promise<Array<{ recipe_id: string; recipe_name: string }>> {
    const { data, error } = await supabase
      .from('recipes')
      .select('recipe_id, recipe_name')
      .eq('recipe_plan', planId)
      .order('recipe_name');

    if (error) {
      console.error('Error fetching recipes by plan:', error);
      throw new Error(`Error fetching recipes by plan: ${error.message}`);
    }

    return data || [];
  }
}

export const weeklyMenuService = new WeeklyMenuService();