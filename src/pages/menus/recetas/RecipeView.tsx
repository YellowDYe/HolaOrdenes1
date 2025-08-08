import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit,
  Copy,
  Loader2,
  AlertCircle,
  ChefHat,
  Package,
  Settings,
  Calendar,
  DollarSign,
  Flame,
  Wheat,
  Beef,
  Droplets
} from 'lucide-react';
import { Recipe } from '../../../types/recipe';
import { IngredientWithDetails } from '../../../types/ingredient';
import { CookingStep } from '../../../types/cookingStep';
import { MealPlan } from '../../../types/mealPlan';
import { FoodContainer } from '../../../types/foodContainer';
import { recipeService } from '../../../services/recipeService';
import { ingredientService } from '../../../services/ingredientService';
import { cookingStepService } from '../../../services/cookingStepService';
import { mealPlanService } from '../../../services/mealPlanService';
import { foodContainerService } from '../../../services/foodContainerService';

const RecipeView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<IngredientWithDetails[]>([]);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([]);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [container, setContainer] = useState<FoodContainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadRecipeData(id);
    }
  }, [id]);

  const loadRecipeData = async (recipeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [recipeData, ingredientsData, stepsData] = await Promise.all([
        recipeService.getRecipeById(recipeId),
        ingredientService.getIngredients(),
        cookingStepService.getSteps()
      ]);

      if (!recipeData) {
        setError('Receta no encontrada');
        return;
      }

      setRecipe(recipeData);
      setIngredients(ingredientsData);
      setCookingSteps(stepsData);

      // Load plan and container details
      if (recipeData.recipe_plan) {
        const plans = await mealPlanService.getPlans();
        const planData = plans.find(p => p.meal_plans_id === recipeData.recipe_plan);
        setPlan(planData || null);
      }

      if (recipeData.recipe_container) {
        const containers = await foodContainerService.getContainers();
        const containerData = containers.find(c => c.food_containers_id === recipeData.recipe_container);
        setContainer(containerData || null);
      }

    } catch (err) {
      console.error('Error loading recipe data:', err);
      setError('Error al cargar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/menus/recetas');
  };

  const handleEditClick = () => {
    navigate(`/menus/recetas/editar/${id}`);
  };

  const handleDuplicateClick = async () => {
    if (!recipe) return;

    try {
      setOperationLoading(true);
      await recipeService.duplicateRecipe(recipe.id);
      navigate('/menus/recetas');
    } catch (err) {
      console.error('Error duplicating recipe:', err);
      setError('Error al duplicar la receta');
    } finally {
      setOperationLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="text-gray-600">Cargando receta...</span>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Receta no encontrada'}</p>
          <button
            onClick={handleBackClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Volver a Recetas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
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
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {recipe.recipe_id}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                    {recipe.recipe_name}
                  </h1>
                </div>
                <p className="text-gray-600">
                  Detalles completos de la receta
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleEditClick}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={handleDuplicateClick}
                disabled={operationLoading}
                className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                {operationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>Duplicar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recipe Image */}
              {recipe.recipe_image_url && (
                <div className="md:col-span-3 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Imagen de la Receta</h3>
                  <div className="max-w-md">
                    <img
                      src={recipe.recipe_image_url}
                      alt={recipe.recipe_name}
                      className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Plan Alimenticio</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {plan?.meal_plans_name || 'Sin plan asignado'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Contenedor</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {container?.food_containers_name || 'Sin contenedor asignado'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Fecha de Creación</h3>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(recipe.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Resumen Nutricional y de Costos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center p-6 bg-primary-50 rounded-xl">
                <DollarSign className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-700 mb-2">Costo Total</h3>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(recipe.recipe_total_cost)}
                </p>
              </div>
              
              <div className="text-center p-6 bg-secondary-50 rounded-xl">
                <Flame className="w-8 h-8 text-secondary-600 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-700 mb-2">Calorías</h3>
                <p className="text-2xl font-bold text-secondary-600">
                  {recipe.recipe_total_calories.toFixed(1)}
                </p>
              </div>
              
              <div className="text-center p-6 bg-accent-50 rounded-xl">
                <Wheat className="w-8 h-8 text-accent-600 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-700 mb-2">Carbohidratos</h3>
                <p className="text-2xl font-bold text-accent-600">
                  {recipe.recipe_total_carbohydrate.toFixed(1)}g
                </p>
              </div>
              
              <div className="text-center p-6 bg-success-50 rounded-xl">
                <Beef className="w-8 h-8 text-success-600 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-700 mb-2">Proteínas</h3>
                <p className="text-2xl font-bold text-success-600">
                  {recipe.recipe_total_proteins.toFixed(1)}g
                </p>
              </div>
              
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <Droplets className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-700 mb-2">Grasas</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {recipe.recipe_total_fats.toFixed(1)}g
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-600" />
              Ingredientes ({recipe.recipe_ingredients.length})
            </h2>
            
            <div className="space-y-4">
              {recipe.recipe_ingredients.map((recipeIngredient, index) => {
                const ingredientData = ingredients.find(ing => ing.ingredient_id === recipeIngredient.ingredient_id);
                const substitutionData = recipeIngredient.substitution_ingredient_id 
                  ? ingredients.find(ing => ing.ingredient_id === recipeIngredient.substitution_ingredient_id)
                  : null;

                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <Package className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {ingredientData?.ingredient_name || 'Ingrediente no encontrado'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {recipeIngredient.quantity} {recipeIngredient.unit}
                          </p>
                          {ingredientData?.category_name && (
                            <p className="text-xs text-gray-500">
                              Categoría: {ingredientData.category_name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {ingredientData && (
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency((ingredientData.ingredient_cost / 1000) * recipeIngredient.quantity)}
                          </p>
                        )}
                        
                        {/* Restriction Management */}
                        {recipeIngredient.restriction_management && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              recipeIngredient.restriction_management === 'Block' ? 'bg-red-100 text-red-800' :
                              recipeIngredient.restriction_management === 'Remove' ? 'bg-orange-100 text-orange-800' :
                              recipeIngredient.restriction_management === 'Ignore' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {recipeIngredient.restriction_management}
                            </span>
                            
                            {substitutionData && (
                              <p className="text-xs text-gray-600 mt-1">
                                Sustituto: {substitutionData.ingredient_name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooking Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary-600" />
              Pasos de Cocción ({recipe.recipe_cooking_steps.length})
            </h2>
            
            <div className="space-y-4">
              {recipe.recipe_cooking_steps.map((step, index) => {
                const stepData = cookingSteps.find(s => s.cooking_steps_id === step.cooking_step_id);
                const ingredientData = ingredients.find(ing => ing.ingredient_id === step.ingredient_id);

                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="bg-secondary-100 p-2 rounded-lg flex-shrink-0">
                        <span className="text-secondary-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {stepData?.cooking_steps_name || 'Proceso no encontrado'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {stepData?.cooking_steps_description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {ingredientData?.ingredient_name || 'Ingrediente no encontrado'}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {step.ingredient_quantity} {
                              recipe.recipe_ingredients.find(ing => ing.ingredient_id === step.ingredient_id)?.unit || 'gr'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {recipe.recipe_cooking_steps.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay pasos de cocción definidos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeView;