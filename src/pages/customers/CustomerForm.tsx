import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';
import { CreateCustomerData, Customer } from '../../types/customer';
import { customerService } from '../../services/customerService';

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateCustomerData>({
    customer_name: '',
    customer_lastname: '',
    customer_email: '',
    customer_phone: '',
    customer_street: '',
    customer_street_number: '',
    customer_interior_number: '',
    customer_colonia: '',
    customer_delegacion: '',
    customer_postal_code: '',
    customer_delivery_instructions: '',
    customer_restrictions: [],
    customer_notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restrictedIngredients, setRestrictedIngredients] = useState<Array<{ id: string; name: string; type: 'restriction' | 'spicy' }>>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Restriction dropdown state
  const [restrictionSearchTerm, setRestrictionSearchTerm] = useState('');
  const [showRestrictionDropdown, setShowRestrictionDropdown] = useState(false);
  const [filteredRestrictions, setFilteredRestrictions] = useState<Array<{ id: string; name: string; type: 'restriction' | 'spicy' }>>([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load customer data if editing
  useEffect(() => {
    if (isEditing && id) {
      loadCustomerData(id);
    } else {
      setDataLoading(false);
    }
  }, [isEditing, id]);

  // Filter restrictions based on search term
  useEffect(() => {
    if (!restrictionSearchTerm.trim()) {
      setFilteredRestrictions(restrictedIngredients);
    } else {
      const filtered = restrictedIngredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(restrictionSearchTerm.toLowerCase())
      );
      setFilteredRestrictions(filtered);
    }
  }, [restrictionSearchTerm, restrictedIngredients]);

  const loadInitialData = async () => {
    try {
      const data = await customerService.getRestrictedIngredients();
      setRestrictedIngredients(data);
    } catch (err) {
      console.error('Error loading restricted ingredients:', err);
      setError('Error al cargar las restricciones disponibles');
    }
  };

  const loadCustomerData = async (customerId: string) => {
    try {
      setDataLoading(true);
      const customer = await customerService.getCustomerById(customerId);
      if (customer) {
        setFormData({
          customer_name: customer.customer_name,
          customer_lastname: customer.customer_lastname,
          customer_email: customer.customer_email,
          customer_phone: customer.customer_phone,
          customer_street: customer.customer_street,
          customer_street_number: customer.customer_street_number,
          customer_interior_number: customer.customer_interior_number,
          customer_colonia: customer.customer_colonia,
          customer_delegacion: customer.customer_delegacion,
          customer_postal_code: customer.customer_postal_code,
          customer_delivery_instructions: customer.customer_delivery_instructions,
          customer_restrictions: customer.customer_restrictions || [],
          customer_notes: customer.customer_notes
        });
      } else {
        setError('Cliente no encontrado');
      }
    } catch (err) {
      console.error('Error loading customer:', err);
      setError('Error al cargar el cliente');
    } finally {
      setDataLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Personal Information validation
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre es requerido';
    }

    if (!formData.customer_lastname.trim()) {
      newErrors.customer_lastname = 'El apellido es requerido';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'El formato del email no es válido';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'El teléfono es requerido';
   } else if (!/^\d{10}$/.test(formData.customer_phone)) {
     newErrors.customer_phone = 'El teléfono debe tener exactamente 10 dígitos';
    }

    // Address validation
    if (!formData.customer_street.trim()) {
      newErrors.customer_street = 'La calle es requerida';
    }

    if (!formData.customer_street_number.trim()) {
      newErrors.customer_street_number = 'El número es requerido';
    }

    if (!formData.customer_colonia.trim()) {
      newErrors.customer_colonia = 'La colonia es requerida';
    }

    if (!formData.customer_delegacion.trim()) {
      newErrors.customer_delegacion = 'La delegación/municipio es requerida';
    }

    if (!formData.customer_postal_code.trim()) {
      newErrors.customer_postal_code = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(formData.customer_postal_code)) {
      newErrors.customer_postal_code = 'El código postal debe tener 5 dígitos';
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
        await customerService.updateCustomer(id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      
      navigate('/clientes');
    } catch (err) {
      console.error('Error saving customer:', err);
      setError('Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleRestrictionToggle = (restrictionId: string) => {
    setFormData(prev => ({
      ...prev,
      customer_restrictions: prev.customer_restrictions?.includes(restrictionId)
        ? prev.customer_restrictions.filter(id => id !== restrictionId)
        : [...(prev.customer_restrictions || []), restrictionId]
    }));
  };

  const handleBackClick = () => {
    navigate('/clientes');
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
              aria-label="Volver a Clientes"
              title="Volver a Clientes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                {isEditing ? 'Editar Cliente' : 'Cliente Nuevo'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Modifica la información del cliente' : 'Completa la información del nuevo cliente'}
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                        errors.customer_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre del cliente"
                      disabled={loading}
                    />
                  </div>
                  {errors.customer_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="customer_lastname" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="customer_lastname"
                      name="customer_lastname"
                      value={formData.customer_lastname}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                        errors.customer_lastname ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Apellido del cliente"
                      disabled={loading}
                    />
                  </div>
                  {errors.customer_lastname && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_lastname}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="customer_email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                        errors.customer_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="cliente@email.com"
                      disabled={loading}
                    />
                  </div>
                  {errors.customer_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="customer_phone"
                      name="customer_phone"
                      value={formData.customer_phone}
                     onChange={(e) => {
                       // Only allow numbers and limit to 10 digits
                       const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                       setFormData(prev => ({
                         ...prev,
                         customer_phone: value
                       }));
                       
                       // Clear error when user starts typing
                       if (errors.customer_phone) {
                         setErrors(prev => ({
                           ...prev,
                           customer_phone: ''
                         }));
                       }
                     }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                        errors.customer_phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                     placeholder="5512345678"
                     maxLength={10}
                      disabled={loading}
                    />
                  </div>
                  {errors.customer_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Dirección de Entrega
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Street */}
                <div className="lg:col-span-2">
                  <label htmlFor="customer_street" className="block text-sm font-medium text-gray-700 mb-2">
                    Calle *
                  </label>
                  <input
                    type="text"
                    id="customer_street"
                    name="customer_street"
                    value={formData.customer_street}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.customer_street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de la calle"
                    disabled={loading}
                  />
                  {errors.customer_street && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_street}</p>
                  )}
                </div>

                {/* Street Number */}
                <div>
                  <label htmlFor="customer_street_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    id="customer_street_number"
                    name="customer_street_number"
                    value={formData.customer_street_number}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.customer_street_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123"
                    disabled={loading}
                  />
                  {errors.customer_street_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_street_number}</p>
                  )}
                </div>

                {/* Interior Number */}
                <div>
                  <label htmlFor="customer_interior_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Número Interior
                  </label>
                  <input
                    type="text"
                    id="customer_interior_number"
                    name="customer_interior_number"
                    value={formData.customer_interior_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Apt 4B, Depto 101"
                    disabled={loading}
                  />
                </div>

                {/* Colonia */}
                <div>
                  <label htmlFor="customer_colonia" className="block text-sm font-medium text-gray-700 mb-2">
                    Colonia *
                  </label>
                  <input
                    type="text"
                    id="customer_colonia"
                    name="customer_colonia"
                    value={formData.customer_colonia}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.customer_colonia ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de la colonia"
                    disabled={loading}
                  />
                  {errors.customer_colonia && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_colonia}</p>
                  )}
                </div>

                {/* Delegacion */}
                <div>
                  <label htmlFor="customer_delegacion" className="block text-sm font-medium text-gray-700 mb-2">
                    Delegación/Municipio *
                  </label>
                  <input
                    type="text"
                    id="customer_delegacion"
                    name="customer_delegacion"
                    value={formData.customer_delegacion}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.customer_delegacion ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Delegación o municipio"
                    disabled={loading}
                  />
                  {errors.customer_delegacion && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_delegacion}</p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="customer_postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    id="customer_postal_code"
                    name="customer_postal_code"
                    value={formData.customer_postal_code}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.customer_postal_code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12345"
                    maxLength={5}
                    disabled={loading}
                  />
                  {errors.customer_postal_code && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_postal_code}</p>
                  )}
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="mt-6">
                <label htmlFor="customer_delivery_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones de Entrega
                </label>
                <textarea
                  id="customer_delivery_instructions"
                  name="customer_delivery_instructions"
                  value={formData.customer_delivery_instructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Instrucciones especiales para la entrega (portón azul, timbre 3, etc.)"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Dietary Restrictions Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary-600" />
                Restricciones Alimentarias
              </h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Selecciona los ingredientes que el cliente no puede consumir o que requieren manejo especial.
                </p>
                
                {/* Searchable Dropdown for Restrictions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar y Agregar Restricciones
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={restrictionSearchTerm}
                        onChange={(e) => setRestrictionSearchTerm(e.target.value)}
                        onFocus={() => setShowRestrictionDropdown(true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        placeholder="Buscar ingredientes con restricciones..."
                        disabled={loading}
                      />
                      
                      {/* Dropdown */}
                      {showRestrictionDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                          {filteredRestrictions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              {restrictionSearchTerm ? 'No se encontraron ingredientes' : 'No hay ingredientes con restricciones disponibles'}
                            </div>
                          ) : (
                            filteredRestrictions.map((ingredient) => {
                              const isSelected = formData.customer_restrictions?.includes(ingredient.id) || false;
                              return (
                                <button
                                  key={ingredient.id}
                                  type="button"
                                  onClick={() => {
                                    handleRestrictionToggle(ingredient.id);
                                    setRestrictionSearchTerm('');
                                    setShowRestrictionDropdown(false);
                                  }}
                                  disabled={isSelected || loading}
                                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isSelected ? 'bg-gray-100' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <span className={`text-sm ${
                                        ingredient.type === 'spicy' ? 'text-red-700' : 'text-orange-700'
                                      }`}>
                                        {ingredient.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        ingredient.type === 'spicy' 
                                          ? 'bg-red-100 text-red-600' 
                                          : 'bg-orange-100 text-orange-600'
                                      }`}>
                                        {ingredient.type === 'spicy' ? '🌶️ Picante' : '⚠️ Restricción'}
                                      </span>
                                      {isSelected && (
                                        <span className="text-xs text-green-600 font-medium">
                                          ✓ Agregado
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Click outside to close dropdown */}
                  {showRestrictionDropdown && (
                    <div 
                      className="fixed inset-0 z-5"
                      onClick={() => setShowRestrictionDropdown(false)}
                    />
                  )}
                </div>
                
                {/* Selected Restrictions Display */}
                {formData.customer_restrictions && formData.customer_restrictions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Restricciones Seleccionadas ({formData.customer_restrictions.length})
                    </h3>
                    <div className="space-y-2">
                      {formData.customer_restrictions.map((restrictionId) => {
                        const restriction = restrictedIngredients.find(ing => ing.id === restrictionId);
                        if (!restriction) return null;
                        
                        return (
                          <div
                            key={restrictionId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm ${
                                restriction.type === 'spicy' ? 'text-red-700' : 'text-orange-700'
                              }`}>
                                {restriction.name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                restriction.type === 'spicy' 
                                  ? 'bg-red-100 text-red-600' 
                                  : 'bg-orange-100 text-orange-600'
                              }`}>
                                {restriction.type === 'spicy' ? '🌶️ Picante' : '⚠️ Restricción'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRestrictionToggle(restrictionId)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar restricción"
                              disabled={loading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.customer_restrictions && formData.customer_restrictions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Restricciones seleccionadas:</strong> {formData.customer_restrictions.length} ingrediente{formData.customer_restrictions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Notas Adicionales
              </h2>
              
              <div>
                <label htmlFor="customer_notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Cliente
                </label>
                <textarea
                  id="customer_notes"
                  name="customer_notes"
                  value={formData.customer_notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Notas adicionales sobre el cliente, preferencias especiales, historial, etc."
                  disabled={loading}
                />
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
                      {isEditing ? 'Actualizar' : 'Crear'} Cliente
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;