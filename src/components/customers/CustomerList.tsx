import React from 'react';
import { Edit, Trash2, Eye, User, Calendar, ChevronUp, ChevronDown, ChevronsUpDown, Mail, Phone, MapPin } from 'lucide-react';
import { CustomerWithFullName } from '../../types/customer';

type SortField = 'customer_id' | 'full_name' | 'customer_email' | 'customer_phone' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

interface CustomerListProps {
  customers: CustomerWithFullName[];
  onView: (customer: CustomerWithFullName) => void;
  onEdit: (customer: CustomerWithFullName) => void;
  onDelete: (customer: CustomerWithFullName) => void;
  loading?: boolean;
  onSort?: (field: SortField, direction: SortDirection) => void;
  sortField?: SortField | null;
  sortDirection?: SortDirection;
}

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSortField?: SortField | null;
  currentSortDirection?: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  currentSortField,
  currentSortDirection,
  onSort,
  className = ''
}) => {
  const isActive = currentSortField === field;
  
  const handleClick = () => {
    if (isActive) {
      const newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      onSort(field, newDirection);
    } else {
      onSort(field, 'asc');
    }
  };

  const getSortIcon = () => {
    if (!isActive) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />;
    }
    
    return currentSortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary-600" />
      : <ChevronDown className="w-4 h-4 text-primary-600" />;
  };

  return (
    <button
      onClick={handleClick}
      className={`group flex items-center space-x-2 text-left font-medium text-gray-700 hover:text-gray-900 transition-colors ${className}`}
      title={`Sort by ${label}`}
      aria-label={`Sort by ${label} ${isActive ? (currentSortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
    >
      <span>{label}</span>
      {getSortIcon()}
    </button>
  );
};

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onView,
  onEdit,
  onDelete,
  loading = false,
  onSort,
  sortField,
  sortDirection
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSort = (field: SortField, direction: SortDirection) => {
    if (onSort) {
      onSort(field, direction);
    }
  };

  const showSortableHeaders = !!onSort;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron clientes
        </h3>
        <p className="text-gray-600">
          No hay clientes que coincidan con los criterios de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-1">
              {showSortableHeaders ? (
                <SortableHeader
                  field="customer_id"
                  label="ID"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'ID'
              )}
            </div>
            <div className="col-span-4">
              {showSortableHeaders ? (
                <SortableHeader
                  field="full_name"
                  label="Cliente"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Cliente'
              )}
            </div>
            <div className="col-span-2">
              {showSortableHeaders ? (
                <SortableHeader
                  field="customer_phone"
                  label="Teléfono"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Teléfono'
              )}
            </div>
            <div className="col-span-1 text-right">Acciones</div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="divide-y divide-gray-100">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="p-6 hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {customer.customer_id}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(customer)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver cliente"
                    aria-label={`Ver cliente ${customer.full_name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar cliente"
                    aria-label={`Editar cliente ${customer.full_name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(customer)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar cliente"
                    aria-label={`Eliminar cliente ${customer.full_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {customer.full_name}
                </h3>
                
                {/* Contact Info */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-3 h-3 mr-2" />
                    <span>{customer.customer_phone}</span>
                  </div>
                </div>

                {/* Restrictions */}
                {customer.customer_restrictions && customer.customer_restrictions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Restricciones:</p>
                    <div className="flex flex-wrap gap-1">
                      {customer.customer_restrictions.slice(0, 3).map((restriction, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {restriction.includes('_spicy') ? '🌶️' : '⚠️'}
                        </span>
                      ))}
                      {customer.customer_restrictions.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{customer.customer_restrictions.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-8 gap-4 items-center">
                {/* ID Column */}
                <div className="col-span-1">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {customer.customer_id}
                  </span>
                </div>

                {/* Customer Name Column */}
                <div className="col-span-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {customer.full_name}
                      </h3>
                      {customer.customer_restrictions && customer.customer_restrictions.length > 0 && (
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            {customer.customer_restrictions.length} restricción{customer.customer_restrictions.length !== 1 ? 'es' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone Column */}
                <div className="col-span-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{customer.customer_phone}</span>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="col-span-1">
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={() => onView(customer)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver cliente"
                      aria-label={`Ver cliente ${customer.full_name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(customer)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar cliente"
                      aria-label={`Editar cliente ${customer.full_name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(customer)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar cliente"
                      aria-label={`Eliminar cliente ${customer.full_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;