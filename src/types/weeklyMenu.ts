export interface WeeklyMenu {
  id: string;
  menu_id: string;
  menu_name: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyMenuPlan {
  id: string;
  plan_id: string;
  menu_id: string;
  meal_plan_id: string;
  day_of_week: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  desayuno_recipe_id: string | null;
  colacion_am_recipe_id: string | null;
  comida_recipe_id: string | null;
  colacion_pm_recipe_id: string | null;
  cena_recipe_id: string | null;
  weekly_menu_plan_cost: number;
  weekly_menu_plan_calories: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWeeklyMenuData {
  menu_name: string;
  plans: CreateWeeklyMenuPlanData[];
}

export interface CreateWeeklyMenuPlanData {
  meal_plan_id: string;
  day_of_week: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  desayuno_recipe_id?: string;
  colacion_am_recipe_id?: string;
  comida_recipe_id?: string;
  colacion_pm_recipe_id?: string;
  cena_recipe_id?: string;
}

export interface UpdateWeeklyMenuData {
  menu_name?: string;
  plans?: CreateWeeklyMenuPlanData[];
}

// Extended interface with meal plan details for display
export interface WeeklyMenuWithDetails extends WeeklyMenu {
  plans: WeeklyMenuPlanWithDetails[];
  total_cost: number;
  total_calories: number;
}

export interface WeeklyMenuPlanWithDetails extends WeeklyMenuPlan {
  meal_plan_name?: string;
  desayuno_recipe_name?: string;
  colacion_am_recipe_name?: string;
  comida_recipe_name?: string;
  colacion_pm_recipe_name?: string;
  cena_recipe_name?: string;
}

export const DAYS_OF_WEEK: Array<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'> = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'
];

export const MEAL_TYPES = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'colacion_am', label: 'Colación AM' },
  { key: 'comida', label: 'Comida' },
  { key: 'colacion_pm', label: 'Colación PM' },
  { key: 'cena', label: 'Cena' }
] as const;