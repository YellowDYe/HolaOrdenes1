import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Percent } from 'lucide-react';
import { Discount, CreateDiscountData } from '../../types/discount';

interface DiscountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDiscountData) => Promise<void>;
  editingDiscount?: Discount | null;
  loading?: boolean;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDiscount,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateDiscountData>({
    discount_name: '',
    discount_percentage: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or editing discount changes
  useEffect(() => {
    if (isOpen) {
      if (editingDiscount) {
        setFormData({
          discount_name: editingDiscount.discount_name,
          discount_percentage: editingDiscount.discount_percentage
        });
      } else {
        setFormData({
          discount_name: '',
          discount_percentage: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, editingDiscount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.discount_name.trim()) {
      newErrors.discount_name = 'El nombre del descuento es requerido';
    } else if (formData.discount_name.trim().length < 2) {
      newErrors.discount_name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.discount_name.trim().length > 100) {
      newErrors.discount_name = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.discount_percentage < 0) {
      newErrors.discount_percentage = 'El porcentaje no puede ser negativo';
    } else if (formData.discount_percentage > 100) {
      newErrors.discount_percentage = 'El porcentaje no puede exceder 100%';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {editingDiscount ? 'Editar Descuento' : 'Agregar Descuento'}
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
          {/* Discount Name */}
          <div>
            <label htmlFor="discount_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Descuento *
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="discount_name"
                name="discount_name"
                value={formData.discount_name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                  errors.discount_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Descuento Cliente Frecuente, Promoción Especial"
                disabled={loading}
                maxLength={100}
              />
            </div>
            {errors.discount_name && (
              <p className="mt-1 text-sm text-red-600">{errors.discount_name}</p>
            )}
          </div>

          {/* Discount Percentage */}
          <div>
            <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 mb-2">
              Porcentaje de Descuento (%) *
            </label>
            <input
              type="number"
              id="discount_percentage"
              name="discount_percentage"
              value={formData.discount_percentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                errors.discount_percentage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="10.00"
              disabled={loading}
            />
            {errors.discount_percentage && (
              <p className="mt-1 text-sm text-red-600">{errors.discount_percentage}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Ingresa el porcentaje de descuento (ej: 15 para un descuento del 15%)
            </p>
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
                  {editingDiscount ? 'Actualizar' : 'Crear'} Descuento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountForm;