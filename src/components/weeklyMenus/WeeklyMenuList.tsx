import React from 'react';
import { Edit, Trash2, Eye, Calendar, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { WeeklyMenu } from '../../types/weeklyMenu';

type SortField = 'menu_id' | 'menu_name' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

interface WeeklyMenuListProps {
  menus: WeeklyMenu[];
  onView: (menu: WeeklyMenu) => void;
  onEdit: (menu: WeeklyMenu) => void;
  onDelete: (menu: WeeklyMenu) => void;
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

const WeeklyMenuList: React.FC<WeeklyMenuListProps> = ({
  menus,
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

  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron menús semanales
        </h3>
        <p className="text-gray-600">
          No hay menús que coincidan con los criterios de búsqueda
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
                  field="menu_id"
                  label="ID"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'ID'
              )}
            </div>
            <div className="col-span-5">
              {showSortableHeaders ? (
                <SortableHeader
                  field="menu_name"
                  label="Nombre del Menú"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Nombre del Menú'
              )}
            </div>
            <div className="col-span-3 text-right">Acciones</div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="divide-y divide-gray-100">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="p-6 hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {menu.menu_id}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onView(menu)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver menú"
                    aria-label={`Ver menú ${menu.menu_name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(menu)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar menú"
                    aria-label={`Editar menú ${menu.menu_name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(menu)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar menú"
                    aria-label={`Eliminar menú ${menu.menu_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {menu.menu_name}
                </h3>
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Creado: {formatDate(menu.created_at)}</span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="grid grid-cols-10 gap-4 items-center">
                {/* ID Column */}
                <div className="col-span-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {menu.menu_id}
                  </span>
                </div>

                {/* Menu Name Column */}
                <div className="col-span-5">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                      <Calendar className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {menu.menu_name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="col-span-3">
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={() => onView(menu)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver menú"
                      aria-label={`Ver menú ${menu.menu_name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(menu)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar menú"
                      aria-label={`Editar menú ${menu.menu_name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(menu)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar menú"
                      aria-label={`Eliminar menú ${menu.menu_name}`}
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

export default WeeklyMenuList;