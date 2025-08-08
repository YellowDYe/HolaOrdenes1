import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Package } from 'lucide-react';
import { FoodContainer, CreateFoodContainerData } from '../../types/foodContainer';

interface ContainerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFoodContainerData) => Promise<void>;
  editingContainer?: FoodContainer | null;
  loading?: boolean;
}

const ContainerForm: React.FC<ContainerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingContainer,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateFoodContainerData>({
    food_containers_name: '',
    food_containers_description: '',
    food_containers_cost: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or editing container changes
  useEffect(() => {
    if (isOpen) {
      if (editingContainer) {
        setFormData({
          food_containers_name: editingContainer.food_containers_name,
          food_containers_description: editingContainer.food_containers_description,
          food_containers_cost: editingContainer.food_containers_cost
        });
      } else {
        setFormData({
          food_containers_name: '',
          food_containers_description: '',
          food_containers_cost: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, editingContainer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.food_containers_name.trim()) {
      newErrors.food_containers_name = 'El nombre del contenedor es requerido';
    }

    if (!formData.food_containers_description.trim()) {
      newErrors.food_containers_description = 'La descripción es requerida';
    }

    if (formData.food_containers_cost <= 0) {
      newErrors.food_containers_cost = 'El costo debe ser mayor a 0';
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
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">
            {editingContainer ? 'Editar Contenedor' : 'Agregar Contenedor'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Container Name */}
          <div>
            <label htmlFor="food_containers_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Contenedor *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="food_containers_name"
                name="food_containers_name"
                value={formData.food_containers_name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                  errors.food_containers_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Contenedor 500ml, Caja mediana"
                disabled={loading}
              />
            </div>
            {errors.food_containers_name && (
              <p className="mt-1 text-sm text-red-600">{errors.food_containers_name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="food_containers_description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="food_containers_description"
              name="food_containers_description"
              value={formData.food_containers_description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none ${
                errors.food_containers_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe las características del contenedor (tamaño, material, capacidad, etc.)"
              disabled={loading}
            />
            {errors.food_containers_description && (
              <p className="mt-1 text-sm text-red-600">{errors.food_containers_description}</p>
            )}
          </div>

          {/* Cost */}
          <div>
            <label htmlFor="food_containers_cost" className="block text-sm font-medium text-gray-700 mb-2">
              Costo (MXN) *
            </label>
            <input
              type="number"
              id="food_containers_cost"
              name="food_containers_cost"
              value={formData.food_containers_cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                errors.food_containers_cost ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.food_containers_cost && (
              <p className="mt-1 text-sm text-red-600">{errors.food_containers_cost}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
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
                  {editingContainer ? 'Actualizar' : 'Crear'} Contenedor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContainerForm;