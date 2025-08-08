import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit,
  Loader2,
  AlertCircle,
  Calendar,
  ChefHat,
  DollarSign,
  Flame
} from 'lucide-react';
import { WeeklyMenuWithDetails } from '../../../types/weeklyMenu';
import { DAYS_OF_WEEK, MEAL_TYPES } from '../../../types/weeklyMenu';
import { weeklyMenuService } from '../../../services/weeklyMenuService';

const WeeklyMenuView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [menu, setMenu] = useState<WeeklyMenuWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMenuData(id);
    }
  }, [id]);

  const loadMenuData = async (menuId: string) => {
    try {
      setLoading(true);
      setError(null);
      const menuData = await weeklyMenuService.getWeeklyMenuById(menuId);
      
      if (!menuData) {
        setError('Menú semanal no encontrado');
        return;
      }

      setMenu(menuData);
    } catch (err) {
      console.error('Error loading menu data:', err);
      setError('Error al cargar el menú semanal');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/menus/menu-semanal');
  };

  const handleEditClick = () => {
    navigate(`/menus/menu-semanal/editar/${id}`);
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

  const getRecipeForMeal = (mealPlanId: string, day: string, mealType: string): string => {
    const plan = menu?.plans.find(p => p.meal_plan_id === mealPlanId && p.day_of_week === day);
    return plan?.[`${mealType}_recipe_name` as keyof typeof plan] as string || 'Sin receta';
  };

  const getPlanTotals = (mealPlanId: string, day: string) => {
    const plan = menu?.plans.find(p => p.meal_plan_id === mealPlanId && p.day_of_week === day);
    return {
      cost: plan?.weekly_menu_plan_cost || 0,
      calories: plan?.weekly_menu_plan_calories || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="text-gray-600">Cargando menú semanal...</span>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Menú semanal no encontrado'}</p>
          <button
            onClick={handleBackClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Volver a Menús Semanales
          </button>
        </div>
      </div>
    );
  }

  // Group plans by meal plan
  const plansByMealPlan = menu.plans.reduce((acc, plan) => {
    if (!acc[plan.meal_plan_id]) {
      acc[plan.meal_plan_id] = {
        meal_plan_name: plan.meal_plan_name || 'Plan sin nombre',
        plans: []
      };
    }
    acc[plan.meal_plan_id].plans.push(plan);
    return acc;
  }, {} as Record<string, { meal_plan_name: string; plans: typeof menu.plans }>);

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
                aria-label="Volver a Menús Semanales"
                title="Volver a Menús Semanales"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {menu.menu_id}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                    {menu.menu_name}
                  </h1>
                </div>
                <p className="text-gray-600">
                  Detalles completos del menú semanal
                </p>
              </div>
            </div>

            <button
              onClick={handleEditClick}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Información General
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Fecha de Creación</h3>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(menu.created_at)}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Costo Total Semanal</h3>
                <div className="flex items-center text-primary-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-lg font-bold">{formatCurrency(menu.total_cost)}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Calorías Totales Semanales</h3>
                <div className="flex items-center text-secondary-600">
                  <Flame className="w-4 h-4 mr-2" />
                  <span className="text-lg font-bold">{menu.total_calories.toFixed(0)} cal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Plans */}
          {Object.entries(plansByMealPlan).map(([mealPlanId, { meal_plan_name, plans }]) => (
            <div key={mealPlanId} className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
                {meal_plan_name}
              </h2>

              {/* Table Header with Totals */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-medium text-gray-900">
                  Planificación Semanal
                </h3>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">
                    {formatCurrency(
                      DAYS_OF_WEEK.reduce((total, day) => {
                        const totals = getPlanTotals(mealPlanId, day);
                        return total + totals.cost;
                      }, 0)
                    )}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    {DAYS_OF_WEEK.reduce((total, day) => {
                      const totals = getPlanTotals(mealPlanId, day);
                      return total + totals.calories;
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
                      const totals = getPlanTotals(mealPlanId, day);

                      return (
                        <tr key={day} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {day}
                          </td>
                          {MEAL_TYPES.map(meal => (
                            <td key={meal.key} className="py-4 px-4">
                              <div className="text-sm text-gray-700">
                                {getRecipeForMeal(mealPlanId, day, meal.key)}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const totals = getPlanTotals(mealPlanId, day);

                  return (
                    <div key={day} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                        <span>{day}</span>
                      </h3>
                      
                      <div className="space-y-3">
                        {MEAL_TYPES.map(meal => (
                          <div key={meal.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {meal.label}
                            </label>
                            <div className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                              {getRecipeForMeal(mealPlanId, day, meal.key)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenuView;