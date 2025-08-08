import React from 'react';
import { X, User, Mail, Phone, MapPin, FileText, AlertTriangle, Calendar } from 'lucide-react';
import { CustomerWithFullName } from '../../types/customer';

interface CustomerViewProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerWithFullName | null;
}

const CustomerView: React.FC<CustomerViewProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  if (!isOpen || !customer) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRestrictionDisplay = (restrictionId: string) => {
    if (restrictionId.includes('_spicy')) {
      return {
        name: restrictionId.replace('_spicy', '').replace(/^[A-Z]+\d+/, ''),
        type: 'Picante',
        icon: '🌶️',
        color: 'bg-red-100 text-red-800'
      };
    } else if (restrictionId.includes('_restriction')) {
      return {
        name: restrictionId.replace('_restriction', '').replace(/^[A-Z]+\d+/, ''),
        type: 'Restricción dietética',
        icon: '⚠️',
        color: 'bg-orange-100 text-orange-800'
      };
    }
    return {
      name: restrictionId,
      type: 'Restricción',
      icon: '⚠️',
      color: 'bg-gray-100 text-gray-800'
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-poppins">
                Detalles del Cliente
              </h2>
              <p className="text-sm text-gray-600">
                {customer.customer_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Información Personal
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Nombre Completo</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {customer.full_name}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Email</h4>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{customer.customer_email}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Teléfono</h4>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{customer.customer_phone}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fecha de Registro</h4>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(customer.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Dirección de Entrega
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dirección Completa</h4>
                  <p className="text-gray-900">
                    {customer.customer_street} {customer.customer_street_number}
                    {customer.customer_interior_number && ` Int. ${customer.customer_interior_number}`}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {customer.customer_colonia}, {customer.customer_delegacion}
                  </p>
                  <p className="text-gray-600">
                    C.P. {customer.customer_postal_code}
                  </p>
                </div>
                
                {customer.customer_delivery_instructions && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Instrucciones de Entrega</h4>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {customer.customer_delivery_instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Restrictions */}
          {customer.customer_restrictions && customer.customer_restrictions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary-600" />
                Restricciones Alimentarias
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customer.customer_restrictions.map((restriction, index) => {
                    const restrictionInfo = getRestrictionDisplay(restriction);
                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${restrictionInfo.color}`}
                      >
                        <span className="text-lg">{restrictionInfo.icon}</span>
                        <div>
                          <p className="font-medium">{restrictionInfo.type}</p>
                          <p className="text-sm opacity-80">{restrictionInfo.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.customer_notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Notas Adicionales
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  {customer.customer_notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;