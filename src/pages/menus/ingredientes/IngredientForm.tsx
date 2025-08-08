import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  AlertCircle,
  Package,
  Plus
} from 'lucide-react';
import { CreateIngredientData, IngredientWithDetails } from '../../../types/ingredient';
import { IngredientCategory } from '../../../types/ingredientCategory';
import { Supplier } from '../../../types/supplier';
import { ingredientService } from '../../../services/ingredientService';
import { ingredientCategoryService } from '../../../services/ingredientCategoryService';
import { supplierService } from '../../../services/supplierService';

const IngredientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateIngredientData>({
    ingredient_name: '',
    ingredient_category_id: '',
    supplier_id: '',
    ingredient_restriction: false,
    ingredient_spicy: false,
    ingredient_calories: 0,
    ingredient_carbs: 0,
    ingredient_protein: 0,
    ingredient_fats: 0,
    ingredient_cost: 0,
    ingredient_shrinkage: 0
  });

  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load ingredient data if editing
  useEffect(() => {
    if (isEditing && id) {
      loadIngredientData(id);
    }
  }, [isEditing, id]);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      const [categoriesData, suppliersData] = await Promise.all([
        ingredientCategoryService.getCategories(),
        supplierService.getSuppliers()
      ]);
      setCategories(categoriesData);
      setSuppliers(suppliersData.filter(s => s.is_active)); // Only active suppliers
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setDataLoading(false);
    }
  };

  const loadIngredientData = async (ingredientId: string) => {
    try {
      const ingredient = await ingredientService.getIngredientById(ingredientId);
      if (ingredient) {
        setFormData({
          ingredient_name: ingredient.ingredient_name,
          ingredient_category_id: ingredient.ingredient_category_id,
          supplier_id: ingredient.supplier_id,
          ingredient_restriction: ingredient.ingredient_restriction,
          ingredient_spicy: ingredient.ingredient_spicy,
          ingredient_calories: ingredient.ingredient_calories,
          ingredient_carbs: ingredient.ingredient_carbs,
          ingredient_protein: ingredient.ingredient_protein,
          ingredient_fats: ingredient.ingredient_fats,
          ingredient_cost: ingredient.ingredient_cost,
          ingredient_shrinkage: ingredient.ingredient_shrinkage
        });
      }
    } catch (err) {
      console.error('Error loading ingredient:', err);
      setError('Error al cargar el ingrediente');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ingredient_name.trim()) {
      newErrors.ingredient_name = 'El nombre del ingrediente es requerido';
    }

    if (!formData.ingredient_category_id) {
      newErrors.ingredient_category_id = 'La categoría es requerida';
    }

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'El proveedor es requerido';
    }

    if (formData.ingredient_calories < 0) {
      newErrors.ingredient_calories = 'Las calorías no pueden ser negativas';
    }

    if (formData.ingredient_carbs < 0) {
      newErrors.ingredient_carbs = 'Los carbohidratos no pueden ser negativos';
    }

    if (formData.ingredient_protein < 0) {
      newErrors.ingredient_protein = 'Las proteínas no pueden ser negativas';
    }

    if (formData.ingredient_fats < 0) {
      newErrors.ingredient_fats = 'Las grasas no pueden ser negativas';
    }

    if (formData.ingredient_cost <= 0) {
      newErrors.ingredient_cost = 'El costo debe ser mayor a 0';
    }

    if (formData.ingredient_shrinkage < 0 || formData.ingredient_shrinkage > 100) {
      newErrors.ingredient_shrinkage = 'El porcentaje de merma debe estar entre 0 y 100';
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
        await ingredientService.updateIngredient(id, formData);
      } else {
        await ingredientService.createIngredient(formData);
      }
      
      navigate('/menus/ingredientes/lista');
    } catch (err) {
      console.error('Error saving ingredient:', err);
      setError('Error al guardar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBackClick = () => {
    navigate('/menus/ingredientes/lista');
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
              aria-label="Volver a Lista de Ingredientes"
              title="Volver a Lista de Ingredientes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                {isEditing ? 'Editar Ingrediente' : 'Agregar Ingrediente'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Modifica la información del ingrediente' : 'Completa la información del nuevo ingrediente'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-8">
        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary-600" />
                Información Básica
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ingredient Name */}
                <div className="md:col-span-2">
                  <label htmlFor="ingredient_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Ingrediente *
                  </label>
                  <input
                    type="text"
                    id="ingredient_name"
                    name="ingredient_name"
                    value={formData.ingredient_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Pollo pechuga sin piel"
                    disabled={loading}
                  />
                  {errors.ingredient_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="ingredient_category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    id="ingredient_category"
                    name="ingredient_category_id"
                    value={formData.ingredient_category_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_category_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.ingredient_category_id}>
                        {category.ingredient_category}
                      </option>
                    ))}
                  </select>
                  {errors.ingredient_category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_category_id}</p>
                  )}
                </div>

                {/* Supplier */}
                <div>
                  <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor *
                  </label>
                  <select
                    id="supplier_name"
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.supplier_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.supplier_id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.supplier_id}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dietary Restrictions Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Restricciones Dietéticas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dietary Restriction */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label htmlFor="ingredient_restriction" className="text-sm font-medium text-gray-700">
                      Tiene restricciones dietéticas
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Activar si el ingrediente tiene restricciones dietéticas
                    </p>
                  </div>
                  <button
                    type="button"
                    id="ingredient_restriction"
                    onClick={() => setFormData(prev => ({ ...prev, ingredient_restriction: !prev.ingredient_restriction }))}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData.ingredient_restriction ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    aria-pressed={formData.ingredient_restriction}
                    aria-labelledby="ingredient_restriction_label"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.ingredient_restriction ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Spicy */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label htmlFor="ingredient_spicy" className="text-sm font-medium text-gray-700">
                      Es picante 🌶️
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Activar si el ingrediente es picante
                    </p>
                  </div>
                  <button
                    type="button"
                    id="ingredient_spicy"
                    onClick={() => setFormData(prev => ({ ...prev, ingredient_spicy: !prev.ingredient_spicy }))}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData.ingredient_spicy ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                    aria-pressed={formData.ingredient_spicy}
                    aria-labelledby="ingredient_spicy_label"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.ingredient_spicy ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Nutritional Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Información Nutricional (por 100g)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Calories */}
                <div>
                  <label htmlFor="ingredient_calories" className="block text-sm font-medium text-gray-700 mb-2">
                    Calorías
                  </label>
                  <input
                    type="number"
                    id="ingredient_calories"
                    name="ingredient_calories"
                    value={formData.ingredient_calories}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_calories ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={loading}
                  />
                  {errors.ingredient_calories && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_calories}</p>
                  )}
                </div>

                {/* Carbohydrates */}
                <div>
                  <label htmlFor="ingredient_carbs" className="block text-sm font-medium text-gray-700 mb-2">
                    Carbohidratos (g)
                  </label>
                  <input
                    type="number"
                    id="ingredient_carbs"
                    name="ingredient_carbs"
                    value={formData.ingredient_carbs}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_carbs ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={loading}
                  />
                  {errors.ingredient_carbs && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_carbs}</p>
                  )}
                </div>

                {/* Protein */}
                <div>
                  <label htmlFor="ingredient_protein" className="block text-sm font-medium text-gray-700 mb-2">
                    Proteínas (g)
                  </label>
                  <input
                    type="number"
                    id="ingredient_protein"
                    name="ingredient_protein"
                    value={formData.ingredient_protein}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_protein ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={loading}
                  />
                  {errors.ingredient_protein && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_protein}</p>
                  )}
                </div>

                {/* Fats */}
                <div>
                  <label htmlFor="ingredient_fats" className="block text-sm font-medium text-gray-700 mb-2">
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    id="ingredient_fats"
                    name="ingredient_fats"
                    value={formData.ingredient_fats}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_fats ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={loading}
                  />
                  {errors.ingredient_fats && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_fats}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Información de Costos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost per kg/liter */}
                <div>
                  <label htmlFor="ingredient_cost" className="block text-sm font-medium text-gray-700 mb-2">
                    Costo por kg/litro (MXN) *
                  </label>
                  <input
                    type="number"
                    id="ingredient_cost"
                    name="ingredient_cost"
                    value={formData.ingredient_cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_cost ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={loading}
                  />
                  {errors.ingredient_cost && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_cost}</p>
                  )}
                </div>

                {/* Waste percentage */}
                <div>
                  <label htmlFor="ingredient_shrinkage" className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje de merma (%)
                  </label>
                  <input
                    type="number"
                    id="ingredient_shrinkage"
                    name="ingredient_shrinkage"
                    value={formData.ingredient_shrinkage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.ingredient_shrinkage ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={loading}
                  />
                  {errors.ingredient_shrinkage && (
                    <p className="mt-1 text-sm text-red-600">{errors.ingredient_shrinkage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBackClick}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Actualizar' : 'Crear'} Ingrediente
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IngredientForm;