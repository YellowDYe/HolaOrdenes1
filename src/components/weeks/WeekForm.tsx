import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar } from 'lucide-react';
import { Week, CreateWeekData } from '../../types/week';
import { weekService } from '../../services/weekService';

interface WeekFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWeekData) => Promise<void>;
  editingWeek?: Week | null;
  loading?: boolean;
}

const WeekForm: React.FC<WeekFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingWeek,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateWeekData>({
    week_name: '',
    weekly_menu: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableMenus, setAvailableMenus] = useState<Array<{ menu_id: string; menu_name: string }>>([]);
  const [menusLoading, setMenusLoading] = useState(false);

  // Load available menus when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableMenus();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes or editing week changes
  useEffect(() => {
    if (isOpen) {
      if (editingWeek) {
        setFormData({
          week_name: editingWeek.week_name,
          weekly_menu: editingWeek.weekly_menu
        });
      } else {
        setFormData({
          week_name: '',
          weekly_menu: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingWeek]);

  const loadAvailableMenus = async () => {
    try {
      setMenusLoading(true);
      const menus = await weekService.getAvailableMenus();
      setAvailableMenus(menus);
    } catch (err) {
      console.error('Error loading available menus:', err);
    } finally {
      setMenusLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.week_name.trim()) {
      newErrors.week_name = 'El nombre de la semana es requerido';
    } else if (formData.week_name.trim().length < 3) {
      newErrors.week_name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.weekly_menu) {
      newErrors.weekly_menu = 'El menú semanal es requerido';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">
            {editingWeek ? 'Editar Semana' : 'Agregar Semana'}
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
          {/* Week Name */}
          <div>
            <label htmlFor="week_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Semana *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="week_name"
                name="week_name"
                value={formData.week_name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                  errors.week_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Semana 1 - Enero 2025, Semana del 15-21 Enero"
                disabled={loading}
                maxLength={100}
              />
            </div>
            {errors.week_name && (
              <p className="mt-1 text-sm text-red-600">{errors.week_name}</p>
            )}
          </div>

          {/* Weekly Menu */}
          <div>
            <label htmlFor="weekly_menu" className="block text-sm font-medium text-gray-700 mb-2">
              Menú Semanal *
            </label>
            <select
              id="weekly_menu"
              name="weekly_menu"
              value={formData.weekly_menu}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                errors.weekly_menu ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || menusLoading}
            >
              <option value="">
                {menusLoading ? 'Cargando menús...' : 'Seleccionar menú semanal'}
              </option>
              {availableMenus.map((menu) => (
                <option key={menu.menu_id} value={menu.menu_id}>
                  {menu.menu_name}
                </option>
              ))}
            </select>
            {errors.weekly_menu && (
              <p className="mt-1 text-sm text-red-600">{errors.weekly_menu}</p>
            )}
            {availableMenus.length === 0 && !menusLoading && (
              <p className="mt-1 text-sm text-gray-500">
                No hay menús semanales disponibles. Crea un menú semanal primero.
              </p>
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
              disabled={loading || menusLoading}
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
                  {editingWeek ? 'Actualizar' : 'Crear'} Semana
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeekForm;