import React from 'react';
import { Edit, Trash2, Eye, Copy, ChefHat, Calendar, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { RecipeWithDetails } from '../../types/recipe';

type SortField = 'recipe_id' | 'recipe_name' | 'plan_name' | 'recipe_total_cost' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

interface RecipeListProps {
  recipes: RecipeWithDetails[];
  onView: (recipe: RecipeWithDetails) => void;
  onEdit: (recipe: RecipeWithDetails) => void;
  onDelete: (recipe: RecipeWithDetails) => void;
  onDuplicate: (recipe: RecipeWithDetails) => void;
  loading?: boolean;
  onSort?: (field: SortField, direction: SortDirection) => void;
  sortField?: SortField | null;
  sortDirection?: SortDirection;
  operationLoading?: boolean;
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

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  loading = false,
  onSort,
  sortField,
  sortDirection,
  operationLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChefHat className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron recetas
        </h3>
        <p className="text-gray-600">
          No hay recetas que coincidan con los criterios de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-1">
              {showSortableHeaders ? (
                <SortableHeader
                  field="recipe_id"
                  label="ID"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'ID'
              )}
            </div>
            <div className="col-span-3">
              {showSortableHeaders ? (
                <SortableHeader
                  field="recipe_name"
                  label="Receta"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Receta'
              )}
            </div>
            <div className="col-span-2">
              {showSortableHeaders ? (
                <SortableHeader
                  field="plan_name"
                  label="Plan"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Plan'
              )}
            </div>
            <div className="col-span-2">
              {showSortableHeaders ? (
                <SortableHeader
                  field="recipe_total_cost"
                  label="Costo Total"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Costo Total'
              )}
            </div>
            <div className="col-span-2">
              {showSortableHeaders ? (
                <SortableHeader
                  field="created_at"
                  label="Fecha Creación"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                'Fecha Creación'
              )}
            </div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="divide-y divide-gray-100">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="p-6 hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <ChefHat className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {recipe.recipe_id}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onView(recipe)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver receta"
                    aria-label={`Ver receta ${recipe.recipe_name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(recipe)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar receta"
                    aria-label={`Editar receta ${recipe.recipe_name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicate(recipe)}
                    disabled={operationLoading}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Duplicar receta"
                    aria-label={`Duplicar receta ${recipe.recipe_name}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(recipe)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar receta"
                    aria-label={`Eliminar receta ${recipe.recipe_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {recipe.recipe_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Plan: {recipe.plan_name || 'Sin plan'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Contenedor: {recipe.container_name || 'Sin contenedor'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(recipe.recipe_total_cost)}
                </p>
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Creado: {formatDate(recipe.created_at)}</span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* ID Column */}
                <div className="col-span-1">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {recipe.recipe_id}
                  </span>
                </div>

                {/* Recipe Name Column */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                      <ChefHat className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {recipe.recipe_name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Plan Column */}
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm">
                    {recipe.plan_name || 'Sin plan'}
                  </p>
                </div>

                {/* Cost Column */}
                <div className="col-span-2">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(recipe.recipe_total_cost)}
                  </p>
                </div>

                {/* Date Column */}
                <div className="col-span-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(recipe.created_at)}</span>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="col-span-2">
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={() => onView(recipe)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver receta"
                      aria-label={`Ver receta ${recipe.recipe_name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(recipe)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar receta"
                      aria-label={`Editar receta ${recipe.recipe_name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicate(recipe)}
                      disabled={operationLoading}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Duplicar receta"
                      aria-label={`Duplicar receta ${recipe.recipe_name}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(recipe)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar receta"
                      aria-label={`Eliminar receta ${recipe.recipe_name}`}
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

export default RecipeList;