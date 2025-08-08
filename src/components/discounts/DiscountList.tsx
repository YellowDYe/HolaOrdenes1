import React from 'react';
import { Edit, Trash2, Percent, Calendar, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Discount } from '../../types/discount';

type SortField = 'discount_id' | 'discount_name' | 'discount_percentage' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

interface DiscountListProps {
  discounts: Discount[];
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
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
      // Toggle direction if same field
      const newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      onSort(field, newDirection);
    } else {
      // Start with ascending if different field
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

const DiscountList: React.FC<DiscountListProps> = ({
  discounts,
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

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Percent className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron descuentos
        </h3>
        <p className="text-gray-600">
          No hay descuentos que coincidan con los criterios de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="grid grid-cols-10 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-2">
              {showSortableHeaders ? (
                <SortableHeader
                  field="discount_id"
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
                  field="discount_name"
                  label="Nombre"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Nombre'
              )}
            </div>
            <div className="col-span-2">
              {showSortableHeaders ? (
                <SortableHeader
                  field="discount_percentage"
                  label="Porcentaje"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Porcentaje'
              )}
            </div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>
        </div>
      </div>

      {/* Discount List */}
      <div className="divide-y divide-gray-100">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="p-6 hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <Percent className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {discount.discount_id}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(discount)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar descuento"
                    aria-label={`Editar descuento ${discount.discount_name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(discount)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar descuento"
                    aria-label={`Eliminar descuento ${discount.discount_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {discount.discount_name}
                </h3>
                <p className="text-lg font-semibold text-primary-600">
                  {formatPercentage(discount.discount_percentage)}
                </p>
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Creado: {formatDate(discount.created_at)}</span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="grid grid-cols-10 gap-4 items-center">
                {/* ID Column */}
                <div className="col-span-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {discount.discount_id}
                  </span>
                </div>

                {/* Name Column */}
                <div className="col-span-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                      <Percent className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {discount.discount_name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Percentage Column */}
                <div className="col-span-2">
                  <p className="text-lg font-semibold text-primary-600">
                    {formatPercentage(discount.discount_percentage)}
                  </p>
                </div>

                {/* Actions Column */}
                <div className="col-span-2">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(discount)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar descuento"
                      aria-label={`Editar descuento ${discount.discount_name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(discount)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar descuento"
                      aria-label={`Eliminar descuento ${discount.discount_name}`}
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

export default DiscountList;