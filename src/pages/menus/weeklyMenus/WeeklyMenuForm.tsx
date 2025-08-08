import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  AlertCircle,
  Calendar,
  ChefHat,
  Search,
  X
} from 'lucide-react';
import { 
  CreateWeeklyMenuData, 
  CreateWeeklyMenuPlanData,
  DAYS_OF_WEEK,
  MEAL_TYPES
} from '../../../types/weeklyMenu';
import { MealPlan } from '../../../types/mealPlan';
import { Recipe } from '../../../types/recipe';
import { weeklyMenuService } from '../../../services/weeklyMenuService';
import { mealPlanService } from '../../../services/mealPlanService';

const WeeklyMenuForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateWeeklyMenuData>({
    menu_name: '',
    plans: []
  });

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipesByPlan, setRecipesByPlan] = useState<Record<string, Array<{ recipe_id: string; recipe_name: string }>>>({});
  const [recipeData, setRecipeData] = useState<Record<string, { cost: number; calories: number }>>({});
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recipe search states for dropdowns
  const [recipeSearchTerms, setRecipeSearchTerms] = useState<Record<string, string>>({});
  const [showRecipeDropdowns, setShowRecipeDropdowns] = useState<Record<string, boolean>>({});
  const [filteredRecipesByPlan, setFilteredRecipesByPlan] = useState<Record<string, Array<{ recipe_id: string; recipe_name: string }>>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Calculated totals per plan
  const [planTotals, setPlanTotals] = useState<Record<string, { cost: number; calories: number }>>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load menu data if editing
  useEffect(() => {
    if (isEditing && id) {
      loadMenuData(id);
    }
  }, [isEditing, id]);

  // Initialize plans when meal plans are loaded
  useEffect(() => {
    if (mealPlans.length > 0 && formData.plans.length === 0 && !isEditing) {
      initializePlans();
    }
  }, [mealPlans, formData.plans.length, isEditing]);

  // Filter recipes based on search terms
  useEffect(() => {
    const newFilteredRecipes: Record<string, Array<{ recipe_id: string; recipe_name: string }>> = {};
    
    Object.keys(recipeSearchTerms).forEach(key => {
      const searchTerm = recipeSearchTerms[key];
      const [mealPlanId] = key.split('_');
      const planRecipes = recipesByPlan[mealPlanId] || [];
      
      if (!searchTerm.trim()) {
        newFilteredRecipes[key] = planRecipes;
      } else {
        newFilteredRecipes[key] = planRecipes.filter(recipe =>
          recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    });
    
    setFilteredRecipesByPlan(newFilteredRecipes);
  }, [recipeSearchTerms, recipesByPlan]);

  // Calculate totals when plans change
  useEffect(() => {
    calculateAllPlanTotals();
  }, [formData.plans, recipeData]);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      const mealPlansData = await mealPlanService.getPlans();
      setMealPlans(mealPlansData);
      
      // Load recipes for each meal plan
      const recipesByPlanData: Record<string, Array<{ recipe_id: string; recipe_name: string }>> = {};
      
      for (const plan of mealPlansData) {
        try {
          const planRecipes = await weeklyMenuService.getRecipesByPlan(plan.meal_plans_id);
          recipesByPlanData[plan.meal_plans_id] = planRecipes;
          console.log(`Loaded ${planRecipes.length} recipes for plan ${plan.meal_plans_name}:`, planRecipes);
        } catch (err) {
          console.error(`Error loading recipes for plan ${plan.meal_plans_id}:`, err);
          recipesByPlanData[plan.meal_plans_id] = [];
        }
      }
      
      setRecipesByPlan(recipesByPlanData);
      
      // Load full recipe data for calculations
      const allRecipes = await weeklyMenuService.getAvailableRecipes();
      const recipeDataMap: Record<string, { cost: number; calories: number }> = {};
      allRecipes.forEach(recipe => {
        recipeDataMap[recipe.recipe_id] = {
          cost: recipe.recipe_total_cost || 0,
          calories: recipe.recipe_total_calories || 0
        };
      });
      setRecipeData(recipeDataMap);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setDataLoading(false);
    }
  };

  const loadMenuData = async (menuId: string) => {
    try {
      const menu = await weeklyMenuService.getWeeklyMenuById(menuId);
      if (menu) {
        setFormData({
          menu_name: menu.menu_name,
          plans: menu.plans.map(plan => ({
            meal_plan_id: plan.meal_plan_id,
            day_of_week: plan.day_of_week,
            desayuno_recipe_id: plan.desayuno_recipe_id || undefined,
            colacion_am_recipe_id: plan.colacion_am_recipe_id || undefined,
            comida_recipe_id: plan.comida_recipe_id || undefined,
            colacion_pm_recipe_id: plan.colacion_pm_recipe_id || undefined,
            cena_recipe_id: plan.cena_recipe_id || undefined
          }))
        });
      }
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Error al cargar el menú');
    }
  };

  const initializePlans = () => {
    const initialPlans: CreateWeeklyMenuPlanData[] = [];
    
    mealPlans.forEach(mealPlan => {
      DAYS_OF_WEEK.forEach(day => {
        initialPlans.push({
          meal_plan_id: mealPlan.meal_plans_id,
          day_of_week: day
        });
      });
    });

    setFormData(prev => ({
      ...prev,
      plans: initialPlans
    }));
  };

  const calculateAllPlanTotals = async () => {
    const newTotals: Record<string, { cost: number; calories: number }> = {};

    for (const plan of formData.plans) {
      const recipeIds = [
        plan.desayuno_recipe_id,
        plan.colacion_am_recipe_id,
        plan.comida_recipe_id,
        plan.colacion_pm_recipe_id,
        plan.cena_recipe_id
      ].filter(Boolean);

      let totalCost = 0;
      let totalCalories = 0;

      // Calculate totals from actual recipe data
      recipeIds.forEach(recipeId => {
        const recipe = recipeData[recipeId];
        if (recipe) {
          totalCost += recipe.cost;
          totalCalories += recipe.calories;
        }
      });

      const planKey = `${plan.meal_plan_id}_${plan.day_of_week}`;
      newTotals[planKey] = {
        cost: Math.round(totalCost * 100) / 100,
        calories: Math.round(totalCalories * 100) / 100
      };
    }

    setPlanTotals(newTotals);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.menu_name.trim()) {
      newErrors.menu_name = 'El nombre del menú es requerido';
    } else if (formData.menu_name.trim().length < 3) {
      newErrors.menu_name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.menu_name.trim().length > 100) {
      newErrors.menu_name = 'El nombre no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (isEditing && id) {
        await weeklyMenuService.updateWeeklyMenu(id, formData);
      } else {
        await weeklyMenuService.createWeeklyMenu(formData);
      }
      
      navigate('/menus/menu-semanal');
    } catch (err) {
      console.error('Error saving weekly menu:', err);
      setError('Error al guardar el menú semanal');
    } finally {
      setLoading(false);
    }
  };

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRecipeChange = (mealPlanId: string, dayOfWeek: string, mealType: string, recipeId: string) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.map(plan => 
        plan.meal_plan_id === mealPlanId && plan.day_of_week === dayOfWeek
          ? { ...plan, [`${mealType}_recipe_id`]: recipeId || undefined }
          : plan
      )
    }));

    // Close dropdown
    const dropdownKey = `${mealPlanId}_${dayOfWeek}_${mealType}`;
    setShowRecipeDropdowns(prev => ({
      ...prev,
      [dropdownKey]: false
    }));
    
    // Update search term to show selected recipe name
    if (recipeId) {
      const planRecipes = recipesByPlan[mealPlanId] || [];
      const recipe = planRecipes.find(r => r.recipe_id === recipeId);
      if (recipe) {
        setRecipeSearchTerms(prev => ({
          ...prev,
          [dropdownKey]: recipe.recipe_name
        }));
      }
    } else {
      setRecipeSearchTerms(prev => ({
        ...prev,
        [dropdownKey]: ''
      }));
    }
  };

  const handleRecipeSearch = (key: string, term: string) => {
    setRecipeSearchTerms(prev => ({
      ...prev,
      [key]: term
    }));
    
    // Show dropdown when typing
    if (!showRecipeDropdowns[key]) {
      setShowRecipeDropdowns(prev => ({
        ...prev,
        [key]: true
      }));
    }
  };

  const toggleRecipeDropdown = (key: string) => {
    setShowRecipeDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSelectedRecipeName = (mealPlanId: string, dayOfWeek: string, mealType: string): string => {
    const plan = formData.plans.find(p => p.meal_plan_id === mealPlanId && p.day_of_week === dayOfWeek);
    const recipeId = plan?.[`${mealType}_recipe_id` as keyof CreateWeeklyMenuPlanData] as string;
    const planRecipes = recipesByPlan[mealPlanId] || [];
    const recipe = planRecipes.find(r => r.recipe_id === recipeId);
    return recipe?.recipe_name || '';
  };

  // Clear search term when dropdown closes
  const clearSearchOnClose = (key: string) => {
    setRecipeSearchTerms(prev => ({
      ...prev,
      [key]: getSelectedRecipeName(
        key.split('_')[0], 
        key.split('_')[1], 
        key.split('_')[2]
      )
    }));
  };

  const positionDropdown = (key: string) => {
    const dropdown = dropdownRefs.current[key];
    if (!dropdown) return;

    // Get the trigger button (parent of dropdown) 
    const trigger = dropdown.parentElement?.querySelector('button') as HTMLElement;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const dropdownHeight = 300;

    // For Viernes row or when insufficient space, position above
    const isBottomRow = key.includes('Viernes');
    if (isBottomRow || spaceBelow < dropdownHeight) {
      dropdown.style.position = 'absolute';
      dropdown.style.bottom = '100%';
      dropdown.style.top = 'auto';
      dropdown.style.marginBottom = '8px';
      dropdown.style.marginTop = '0';
      dropdown.style.zIndex = '40';
      dropdown.style.maxHeight = '250px';
    } else {
      dropdown.style.position = 'absolute';
      dropdown.style.top = '100%';
      dropdown.style.bottom = 'auto';
      dropdown.style.marginTop = '8px';
      dropdown.style.marginBottom = '0';
      dropdown.style.zIndex = '40';
      dropdown.style.maxHeight = '250px';
    }
    
    // Ensure dropdown is always within viewport bounds
    dropdown.style.maxHeight = `${Math.min(300, Math.max(spaceBelow, spaceAbove) - 40)}px`;
  };

  const setDropdownRef = (key: string) => (ref: HTMLDivElement | null) => {
    dropdownRefs.current[key] = ref;
  };

  const handleBackClick = () => {
    navigate('/menus/menu-semanal');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (dataLoading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="text-gray-600">Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Volver a Menús Semanales"
              title="Volver a Menús Semanales"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                {isEditing ? 'Editar Menú Semanal' : 'Crear Menú Semanal'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Modifica la planificación del menú semanal' : 'Planifica las comidas para cada día de la semana'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Información Básica
              </h2>
              
              <div className="max-w-md">
                <label htmlFor="menu_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Menú Semanal *
                </label>
                <input
                  type="text"
                  id="menu_name"
                  name="menu_name"
                  value={formData.menu_name}
                  onChange={handleBasicChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                    errors.menu_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Menú Semana 1 - Enero 2025"
                  disabled={loading}
                  maxLength={100}
                />
                {errors.menu_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.menu_name}</p>
                )}
              </div>
            </div>

            {/* Weekly Plans */}
            {mealPlans.map((mealPlan) => (
              <div key={mealPlan.id} className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
                  {mealPlan.meal_plans_name}
                </h2>

                {/* Table Header with Totals */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 bg-gray-50 rounded-xl space-y-3 sm:space-y-0">
                  <h3 className="text-lg font-medium text-gray-900 flex-shrink-0">
                    Planificación Semanal
                  </h3>
                  <div className="text-left sm:text-right">
                    <p className="text-lg sm:text-xl font-bold text-primary-600">
                      {formatCurrency(
                        DAYS_OF_WEEK.reduce((total, day) => {
                          const planKey = `${mealPlan.meal_plans_id}_${day}`;
                          return total + (planTotals[planKey]?.cost || 0);
                        }, 0)
                      )}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      {DAYS_OF_WEEK.reduce((total, day) => {
                        const planKey = `${mealPlan.meal_plans_id}_${day}`;
                        return total + (planTotals[planKey]?.calories || 0);
                      }, 0).toFixed(0)} cal totales
                    </p>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Día</th>
                        {MEAL_TYPES.map(meal => (
                          <th key={meal.key} className="text-left py-3 px-4 font-medium text-gray-700">
                            {meal.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS_OF_WEEK.map((day) => {
                        const planKey = `${mealPlan.meal_plans_id}_${day}`;
                        const totals = planTotals[planKey] || { cost: 0, calories: 0 };

                        return (
                          <tr key={day} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-900">
                              {day}
                            </td>
                            {MEAL_TYPES.map(meal => {
                              const dropdownKey = `${mealPlan.meal_plans_id}_${day}_${meal.key}`;
                              const selectedRecipe = getSelectedRecipeName(mealPlan.meal_plans_id, day, meal.key);
                              
                              return (
                                <td key={meal.key} className="py-4 px-4">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={recipeSearchTerms[dropdownKey] || selectedRecipe}
                                      onChange={(e) => handleRecipeSearch(dropdownKey, e.target.value)}
                                      onFocus={() => toggleRecipeDropdown(dropdownKey)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                                      placeholder="Buscar y seleccionar receta..."
                                      disabled={loading}
                                    />

                                    {/* Recipe Dropdown */}
                                    {showRecipeDropdowns[dropdownKey] && (
                                      <div 
                                        ref={setDropdownRef(dropdownKey)}
                                        className={`absolute z-40 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden ${
                                          day === 'Jueves' || day === 'Viernes' ? 'bottom-full mb-2' : 'top-full mt-2'
                                        }`}
                                        style={{ maxHeight: '250px' }}
                                      >

                                        {/* Recipe Options */}
                                        <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                                          <button
                                            type="button"
                                            onClick={() => handleRecipeChange(mealPlan.meal_plans_id, day, meal.key, '')}
                                            className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-gray-500"
                                          >
                                            Sin receta
                                          </button>
                                          {(filteredRecipesByPlan[dropdownKey] || recipesByPlan[mealPlan.meal_plans_id] || []).map((recipe) => (
                                            <button
                                              key={recipe.recipe_id}
                                              type="button"
                                              onClick={() => handleRecipeChange(mealPlan.meal_plans_id, day, meal.key, recipe.recipe_id)}
                                              className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                            >
                                              {recipe.recipe_name}
                                            </button>
                                          ))}
                                          {(filteredRecipesByPlan[dropdownKey] || recipesByPlan[mealPlan.meal_plans_id] || []).length === 0 && recipeSearchTerms[dropdownKey] && (
                                            <div className="p-3 text-center text-gray-500 text-sm">
                                              No se encontraron recetas
                                            </div>
                                          )}
                                          {(!recipesByPlan[mealPlan.meal_plans_id] || recipesByPlan[mealPlan.meal_plans_id].length === 0) && !recipeSearchTerms[dropdownKey] && (
                                            <div className="p-3 text-center text-gray-500 text-sm">
                                              No hay recetas disponibles para este plan
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {DAYS_OF_WEEK.map((day) => {

                    return (
                      <div key={day} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          {day}
                        </h3>
                        
                        <div className="space-y-3">
                          {MEAL_TYPES.map(meal => {
                            const dropdownKey = `${mealPlan.meal_plans_id}_${day}_${meal.key}`;
                            const selectedRecipe = getSelectedRecipeName(mealPlan.meal_plans_id, day, meal.key);
                            
                            return (
                              <div key={meal.key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {meal.label}
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={recipeSearchTerms[dropdownKey] || selectedRecipe}
                                    onChange={(e) => handleRecipeSearch(dropdownKey, e.target.value)}
                                    onFocus={() => toggleRecipeDropdown(dropdownKey)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                                    placeholder="Buscar y seleccionar receta..."
                                    disabled={loading}
                                  />

                                  {/* Recipe Dropdown */}
                                  {showRecipeDropdowns[dropdownKey] && (
                                    <div 
                                      ref={setDropdownRef(dropdownKey)}
                                      className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                                      style={{ maxHeight: 'min(300px, 40vh)' }}
                                    >

                                      {/* Recipe Options */}
                                      <div className="overflow-y-auto" style={{ maxHeight: 'min(300px, 40vh)' }}>
                                        <button
                                          type="button"
                                          onClick={() => handleRecipeChange(mealPlan.meal_plans_id, day, meal.key, '')}
                                          className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-gray-500"
                                        >
                                          Sin receta
                                        </button>
                                        {(filteredRecipesByPlan[dropdownKey] || recipesByPlan[mealPlan.meal_plans_id] || []).map((recipe) => (
                                          <button
                                            key={recipe.recipe_id}
                                            type="button"
                                            onClick={() => handleRecipeChange(mealPlan.meal_plans_id, day, meal.key, recipe.recipe_id)}
                                            className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                          >
                                            {recipe.recipe_name}
                                          </button>
                                        ))}
                                        {(filteredRecipesByPlan[dropdownKey] || recipesByPlan[mealPlan.meal_plans_id] || []).length === 0 && recipeSearchTerms[dropdownKey] && (
                                          <div className="p-3 text-center text-gray-500 text-sm">
                                            No se encontraron recetas
                                          </div>
                                        )}
                                        {(!recipesByPlan[mealPlan.meal_plans_id] || recipesByPlan[mealPlan.meal_plans_id].length === 0) && !recipeSearchTerms[dropdownKey] && (
                                          <div className="p-3 text-center text-gray-500 text-sm">
                                            No hay recetas disponibles para este plan
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Form Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="w-full sm:flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Actualizar' : 'Crear'} Menú
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {Object.values(showRecipeDropdowns).some(Boolean) && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => {
            // Clear all dropdowns and reset search terms
            Object.keys(showRecipeDropdowns).forEach(key => {
              if (showRecipeDropdowns[key]) {
                clearSearchOnClose(key);
              }
            });
            setShowRecipeDropdowns({});
          }}
        />
      )}
    </div>
  );
};

export default WeeklyMenuForm;