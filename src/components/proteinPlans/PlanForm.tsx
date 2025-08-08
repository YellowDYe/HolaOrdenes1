import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Beef } from 'lucide-react';
import { ProteinPlan, CreateProteinPlanData } from '../../types/proteinPlan';

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProteinPlanData) => Promise<void>;
  editingPlan?: ProteinPlan | null;
  loading?: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPlan,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateProteinPlanData>({
    protein_plans_name: '',
    protein_plans_description: '',
    protein_plans_price: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or editing plan changes
  useEffect(() => {
    if (isOpen) {
      if (editingPlan) {
        setFormData({
          protein_plans_name: editingPlan.protein_plans_name,
          protein_plans_description: editingPlan.protein_plans_description,
          protein_plans_price: editingPlan.protein_plans_price
        });
      } else {
        setFormData({
          protein_plans_name: '',
          protein_plans_description: '',
          protein_plans_price: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, editingPlan]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.protein_plans_name.trim()) {
      newErrors.protein_plans_name = 'El nombre del plan es requerido';
    }

    if (!formData.protein_plans_description.trim()) {
      newErrors.protein_plans_description = 'La descripción es requerida';
    }

    if (formData.protein_plans_price <= 0) {
      newErrors.protein_plans_price = 'El precio debe ser mayor a 0';
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
            {editingPlan ? 'Editar Plan de Proteína' : 'Agregar Plan de Proteína'}
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
          {/* Plan Name */}
          <div>
            <label htmlFor="protein_plans_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Plan *
            </label>
            <div className="relative">
              <Beef className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="protein_plans_name"
                name="protein_plans_name"
                value={formData.protein_plans_name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                  errors.protein_plans_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Plan Proteína Básico, Plan Proteína Premium"
                disabled={loading}
              />
            </div>
            {errors.protein_plans_name && (
              <p className="mt-1 text-sm text-red-600">{errors.protein_plans_name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="protein_plans_description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="protein_plans_description"
              name="protein_plans_description"
              value={formData.protein_plans_description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none ${
                errors.protein_plans_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe las características del plan de proteína (tipos de proteína, cantidades, beneficios, etc.)"
              disabled={loading}
            />
            {errors.protein_plans_description && (
              <p className="mt-1 text-sm text-red-600">{errors.protein_plans_description}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="protein_plans_price" className="block text-sm font-medium text-gray-700 mb-2">
              Precio (MXN) *
            </label>
            <input
              type="number"
              id="protein_plans_price"
              name="protein_plans_price"
              value={formData.protein_plans_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                errors.protein_plans_price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.protein_plans_price && (
              <p className="mt-1 text-sm text-red-600">{errors.protein_plans_price}</p>
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
                  {editingPlan ? 'Actualizar' : 'Crear'} Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanForm;