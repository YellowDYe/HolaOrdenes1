import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Settings } from 'lucide-react';
import { CookingStep, CreateCookingStepData } from '../../types/cookingStep';

interface StepFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCookingStepData) => Promise<void>;
  editingStep?: CookingStep | null;
  loading?: boolean;
}

const StepForm: React.FC<StepFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStep,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateCookingStepData>({
    cooking_steps_name: '',
    cooking_steps_description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or editing step changes
  useEffect(() => {
    if (isOpen) {
      if (editingStep) {
        setFormData({
          cooking_steps_name: editingStep.cooking_steps_name,
          cooking_steps_description: editingStep.cooking_steps_description
        });
      } else {
        setFormData({
          cooking_steps_name: '',
          cooking_steps_description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingStep]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cooking_steps_name.trim()) {
      newErrors.cooking_steps_name = 'El nombre del proceso es requerido';
    }

    if (!formData.cooking_steps_description.trim()) {
      newErrors.cooking_steps_description = 'La descripción es requerida';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">
            {editingStep ? 'Editar Proceso' : 'Agregar Proceso'}
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
          {/* Step Name */}
          <div>
            <label htmlFor="cooking_steps_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proceso *
            </label>
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="cooking_steps_name"
                name="cooking_steps_name"
                value={formData.cooking_steps_name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                  errors.cooking_steps_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Cocción al vapor, Marinado, Horneado"
                disabled={loading}
              />
            </div>
            {errors.cooking_steps_name && (
              <p className="mt-1 text-sm text-red-600">{errors.cooking_steps_name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="cooking_steps_description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="cooking_steps_description"
              name="cooking_steps_description"
              value={formData.cooking_steps_description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none ${
                errors.cooking_steps_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe el proceso de cocción, tiempo, temperatura y pasos específicos"
              disabled={loading}
            />
            {errors.cooking_steps_description && (
              <p className="mt-1 text-sm text-red-600">{errors.cooking_steps_description}</p>
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
                  {editingStep ? 'Actualizar' : 'Crear'} Proceso
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepForm;