import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  AlertCircle,
  ChefHat,
  Plus,
  Trash2,
  Package,
  Settings,
  X,
  Image
} from 'lucide-react';
import { CreateRecipeData, RecipeIngredient, RecipeCookingStep } from '../../../types/recipe';
import { MealPlan } from '../../../types/mealPlan';
import { FoodContainer } from '../../../types/foodContainer';
import { IngredientWithDetails } from '../../../types/ingredient';
import { CookingStep } from '../../../types/cookingStep';
import { recipeService } from '../../../services/recipeService';
import { mealPlanService } from '../../../services/mealPlanService';
import { foodContainerService } from '../../../services/foodContainerService';
import { ingredientService } from '../../../services/ingredientService';
import { cookingStepService } from '../../../services/cookingStepService';
import StepForm from '../../../components/cookingSteps/StepForm';
import { CreateCookingStepData } from '../../../types/cookingStep';
import ImageOptimizer from '../../../components/common/ImageOptimizer';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

const RecipeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { handleError, logUserAction } = useErrorHandler();

  const [formData, setFormData] = useState<CreateRecipeData>({
    recipe_name: '',
    recipe_image_url: '',
    recipe_plan: '',
    recipe_container: '',
    recipe_ingredients: [],
    recipe_cooking_steps: []
  });

  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [containers, setContainers] = useState<FoodContainer[]>([]);
  const [ingredients, setIngredients] = useState<IngredientWithDetails[]>([]);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isNewStepModalOpen, setIsNewStepModalOpen] = useState(false);
  const [newStepLoading, setNewStepLoading] = useState(false);

  // Calculated totals
  const [calculatedTotals, setCalculatedTotals] = useState({
    cost: 0,
    calories: 0,
    carbohydrate: 0,
    proteins: 0,
    fats: 0
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load recipe data if editing
  useEffect(() => {
    if (isEditing && id) {
      loadRecipeData(id);
    }
  }, [isEditing, id]);

  // Calculate totals when ingredients change
  useEffect(() => {
    calculateTotals();
  }, [formData.recipe_ingredients, ingredients]);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      const [plansData, containersData, ingredientsData, stepsData] = await Promise.all([
        mealPlanService.getPlans(),
        foodContainerService.getContainers(),
        ingredientService.getIngredients(),
        cookingStepService.getSteps()
      ]);
      setPlans(plansData);
      setContainers(containersData);
      setIngredients(ingredientsData);
      setCookingSteps(stepsData);
      logUserAction('recipe_form_data_loaded');
    } catch (err) {
      handleError(err as Error, { operation: 'loadInitialData' });
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setDataLoading(false);
    }
  };

  const loadRecipeData = async (recipeId: string) => {
    try {
      const recipe = await recipeService.getRecipeById(recipeId);
      if (recipe) {
        setFormData({
          recipe_name: recipe.recipe_name,
          recipe_image_url: recipe.recipe_image_url,
          recipe_plan: recipe.recipe_plan,
          recipe_container: recipe.recipe_container,
          recipe_ingredients: recipe.recipe_ingredients,
          recipe_cooking_steps: recipe.recipe_cooking_steps
        });
      }
    } catch (err) {
      handleError(err as Error, { operation: 'loadRecipeData', recipeId });
      console.error('Error loading recipe:', err);
      setError('Error al cargar la receta');
    }
  };

  const calculateTotals = () => {
    let totalCost = 0;
    let totalCalories = 0;
    let totalCarbohydrate = 0;
    let totalProteins = 0;
    let totalFats = 0;

    formData.recipe_ingredients.forEach(recipeIngredient => {
      const ingredient = ingredients.find(ing => ing.ingredient_id === recipeIngredient.ingredient_id);
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

    setCalculatedTotals({
      cost: Math.round(totalCost * 100) / 100,
      calories: Math.round(totalCalories * 100) / 100,
      carbohydrate: Math.round(totalCarbohydrate * 100) / 100,
      proteins: Math.round(totalProteins * 100) / 100,
      fats: Math.round(totalFats * 100) / 100
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipe_name.trim()) {
      newErrors.recipe_name = 'El nombre de la receta es requerido';
    }

    if (!formData.recipe_plan) {
      newErrors.recipe_plan = 'El plan es requerido';
    }

    if (!formData.recipe_container) {
      newErrors.recipe_container = 'El contenedor es requerido';
    }

    if (formData.recipe_ingredients.length === 0) {
      newErrors.recipe_ingredients = 'Debe agregar al menos un ingrediente';
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
        await recipeService.updateRecipe(id, formData);
        logUserAction('recipe_updated', { recipeId: id });
      } else {
        await recipeService.createRecipe(formData);
        logUserAction('recipe_created');
      }
      
      navigate('/menus/recetas');
    } catch (err) {
      handleError(err as Error, { operation: 'saveRecipe', isEditing });
      console.error('Error saving recipe:', err);
      setError('Error al guardar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleImageSelect = (optimizedImageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      recipe_image_url: optimizedImageUrl
    }));
    logUserAction('recipe_image_selected');
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      recipe_image_url: ''
    }));
    logUserAction('recipe_image_removed');
  };

  const handleAddIngredient = () => {
    const newIngredient: RecipeIngredient = {
      ingredient_id: '',
      quantity: 0,
      unit: 'gr'
    };
    
    setFormData(prev => ({
      ...prev,
      recipe_ingredients: [...prev.recipe_ingredients, newIngredient]
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe_ingredients: prev.recipe_ingredients.filter((_, i) => i !== index),
      // Remove cooking steps that reference this ingredient
      recipe_cooking_steps: prev.recipe_cooking_steps.filter(step => 
        step.ingredient_id !== prev.recipe_ingredients[index]?.ingredient_id
      )
    }));
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    setFormData(prev => ({
      ...prev,
      recipe_ingredients: prev.recipe_ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const handleAddCookingStep = () => {
    const newStep: RecipeCookingStep = {
      cooking_step_id: '',
      ingredient_id: '',
      ingredient_quantity: 0
    };
    
    setFormData(prev => ({
      ...prev,
      recipe_cooking_steps: [...prev.recipe_cooking_steps, newStep]
    }));
  };

  const handleRemoveCookingStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe_cooking_steps: prev.recipe_cooking_steps.filter((_, i) => i !== index)
    }));
  };

  const handleCookingStepChange = (index: number, field: keyof RecipeCookingStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      recipe_cooking_steps: prev.recipe_cooking_steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const handleBackClick = () => {
    navigate('/menus/recetas');
  };

  const handleNewStepClick = () => {
    setIsNewStepModalOpen(true);
  };

  const handleNewStepSubmit = async (stepData: CreateCookingStepData) => {
    try {
      setNewStepLoading(true);
      await cookingStepService.createStep(stepData);
      // Refresh cooking steps list
      const updatedSteps = await cookingStepService.getSteps();
      setCookingSteps(updatedSteps);
      setIsNewStepModalOpen(false);
    } catch (err) {
      console.error('Error creating new cooking step:', err);
      setError('Error al crear el nuevo paso de cocción');
    } finally {
      setNewStepLoading(false);
    }
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
              aria-label="Volver a Gestión de Recetas"
              title="Volver a Gestión de Recetas"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                {isEditing ? 'Editar Receta' : 'Nueva Receta'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Modifica la información de la receta' : 'Completa la información de la nueva receta'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-8">
        <div className="max-w-6xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
                Información Básica
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form Fields */}
                <div className="space-y-6">
                  {/* Recipe Name */}
                  <div>
                    <label htmlFor="recipe_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Receta *
                    </label>
                    <input
                      type="text"
                      id="recipe_name"
                      name="recipe_name"
                      value={formData.recipe_name}
                      onChange={handleBasicChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                        errors.recipe_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Pollo a la plancha con vegetales"
                      disabled={loading}
                    />
                    {errors.recipe_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipe_name}</p>
                    )}
                  </div>

                  {/* Plan */}
                  <div>
                    <label htmlFor="recipe_plan" className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Alimenticio *
                    </label>
                    <select
                      id="recipe_plan"
                      name="recipe_plan"
                      value={formData.recipe_plan}
                      onChange={handleBasicChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                        errors.recipe_plan ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      <option value="">Seleccionar plan</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.meal_plans_id}>
                          {plan.meal_plans_name}
                        </option>
                      ))}
                    </select>
                    {errors.recipe_plan && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipe_plan}</p>
                    )}
                  </div>

                  {/* Container */}
                  <div>
                    <label htmlFor="recipe_container" className="block text-sm font-medium text-gray-700 mb-2">
                      Contenedor *
                    </label>
                    <select
                      id="recipe_container"
                      name="recipe_container"
                      value={formData.recipe_container}
                      onChange={handleBasicChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                        errors.recipe_container ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      <option value="">Seleccionar contenedor</option>
                      {containers.map((container) => (
                        <option key={container.id} value={container.food_containers_id}>
                          {container.food_containers_name}
                        </option>
                      ))}
                    </select>
                    {errors.recipe_container && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipe_container}</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de la Receta
                  </label>
                  
                  <ImageOptimizer
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    currentImage={formData.recipe_image_url}
                    maxSizeKB={300}
                    maxWidth={800}
                    maxHeight={600}
                    quality={0.85}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Ingredients Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary-600" />
                  Ingredientes
                </h2>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Ingrediente</span>
                </button>
              </div>

              {errors.recipe_ingredients && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errors.recipe_ingredients}</span>
                </div>
              )}

              <div className="space-y-4">
                {formData.recipe_ingredients.map((ingredient, index) => {
                  const ingredientData = ingredients.find(ing => ing.ingredient_id === ingredient.ingredient_id);
                  const hasRestrictions = ingredientData?.ingredient_restriction;

                  return (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Ingredient Selection */}
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ingrediente *
                          </label>
                          <select
                            value={ingredient.ingredient_id}
                            onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            disabled={loading}
                          >
                            <option value="">Seleccionar ingrediente</option>
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.ingredient_id}>
                                {ing.ingredient_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            disabled={loading}
                          />
                        </div>

                        {/* Unit */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unidad *
                          </label>
                          <select
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value as 'gr' | 'ml')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            disabled={loading}
                          >
                            <option value="gr">Gramos (gr)</option>
                            <option value="ml">Mililitros (ml)</option>
                          </select>
                        </div>

                        {/* Restriction Management - Only show if ingredient has restrictions */}
                        {hasRestrictions && (
                          <div className="md:col-span-3 lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Manejo de Restricción
                            </label>
                            <select
                              value={ingredient.restriction_management || ''}
                              onChange={(e) => handleIngredientChange(index, 'restriction_management', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                              disabled={loading}
                            >
                              <option value="">Seleccionar acción</option>
                              <option value="Block">Bloquear</option>
                              <option value="Remove">Remover</option>
                              <option value="Ignore">Ignorar</option>
                              <option value="Substitute">Sustituir</option>
                            </select>
                          </div>
                        )}

                        {/* Substitution Ingredient - Only show when "Substitute" is selected */}
                        {ingredient.restriction_management === 'Substitute' && (
                          <div className="md:col-span-3 lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ingrediente Sustituto
                            </label>
                            <select
                              value={ingredient.substitution_ingredient_id || ''}
                              onChange={(e) => handleIngredientChange(index, 'substitution_ingredient_id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                              disabled={loading}
                            >
                              <option value="">Seleccionar sustituto</option>
                              {ingredients
                                .filter(ing => ing.ingredient_id !== ingredient.ingredient_id)
                                .map((ing) => (
                                  <option key={ing.id} value={ing.ingredient_id}>
                                    {ing.ingredient_name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}

                        {/* Remove Button */}
                        <div className="md:col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="w-full md:w-auto p-3 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                            disabled={loading}
                            title="Eliminar ingrediente"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="ml-2 md:hidden">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {formData.recipe_ingredients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay ingredientes agregados</p>
                    <p className="text-sm">Haz clic en "Agregar Ingrediente" para comenzar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Cooking Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary-600" />
                  Pasos de Cocción
                </h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleAddCookingStep}
                    className="w-full sm:w-auto bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    disabled={loading || formData.recipe_ingredients.length === 0}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Paso</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNewStepClick}
                    className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    disabled={loading}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Nuevo Paso</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.recipe_cooking_steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* Cooking Step Selection */}
                      <div className="md:col-span-4 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proceso de Cocción *
                        </label>
                        <select
                          value={step.cooking_step_id}
                          onChange={(e) => handleCookingStepChange(index, 'cooking_step_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          disabled={loading}
                        >
                          <option value="">Seleccionar proceso</option>
                          {cookingSteps.map((cookingStep) => (
                            <option key={cookingStep.id} value={cookingStep.cooking_steps_id}>
                              {cookingStep.cooking_steps_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ingredient Selection */}
                      <div className="md:col-span-4 lg:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ingrediente *
                        </label>
                        <select
                          value={step.ingredient_id}
                          onChange={(e) => {
                            const selectedIngredientId = e.target.value;
                            const selectedRecipeIngredient = formData.recipe_ingredients.find(
                              ing => ing.ingredient_id === selectedIngredientId
                            );
                            handleCookingStepChange(index, 'ingredient_id', selectedIngredientId);
                            if (selectedRecipeIngredient) {
                              handleCookingStepChange(index, 'ingredient_quantity', selectedRecipeIngredient.quantity);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          disabled={loading}
                        >
                          <option value="">Seleccionar ingrediente</option>
                          {formData.recipe_ingredients
                            .filter(ing => ing.ingredient_id)
                            .map((recipeIngredient) => {
                              const ingredientData = ingredients.find(ing => ing.ingredient_id === recipeIngredient.ingredient_id);
                              return (
                                <option key={recipeIngredient.ingredient_id} value={recipeIngredient.ingredient_id}>
                                  {ingredientData?.ingredient_name} ({recipeIngredient.quantity}{recipeIngredient.unit})
                                </option>
                              );
                            })}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-3 lg:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cantidad a Usar
                        </label>
                        <input
                          type="number"
                          value={step.ingredient_quantity}
                          onChange={(e) => handleCookingStepChange(index, 'ingredient_quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          disabled={loading}
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveCookingStep(index)}
                          className="w-full md:w-auto p-3 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                          disabled={loading}
                          title="Eliminar paso"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-2 md:hidden">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {formData.recipe_cooking_steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay pasos de cocción agregados</p>
                    <p className="text-sm">
                      {formData.recipe_ingredients.length === 0 
                        ? 'Primero agrega ingredientes para poder crear pasos de cocción'
                        : 'Haz clic en "Agregar Paso" para comenzar'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumen Nutricional y de Costos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Costo Total</h3>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(calculatedTotals.cost)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-secondary-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Calorías</h3>
                  <p className="text-2xl font-bold text-secondary-600">
                    {calculatedTotals.calories.toFixed(1)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-accent-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Carbohidratos</h3>
                  <p className="text-2xl font-bold text-accent-600">
                    {calculatedTotals.carbohydrate.toFixed(1)}g
                  </p>
                </div>
                
                <div className="text-center p-4 bg-success-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Proteínas</h3>
                  <p className="text-2xl font-bold text-success-600">
                    {calculatedTotals.proteins.toFixed(1)}g
                  </p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Grasas</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {calculatedTotals.fats.toFixed(1)}g
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
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
                      {isEditing ? 'Actualizar' : 'Crear'} Receta
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* New Cooking Step Modal */}
      <StepForm
        isOpen={isNewStepModalOpen}
        onClose={() => setIsNewStepModalOpen(false)}
        onSubmit={handleNewStepSubmit}
        loading={newStepLoading}
      />
    </div>
  );
};

export default RecipeForm;