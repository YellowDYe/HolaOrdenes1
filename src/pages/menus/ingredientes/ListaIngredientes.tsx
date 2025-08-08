import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { IngredientWithDetails, CreateIngredientData } from '../../../types/ingredient';
import { ingredientService } from '../../../services/ingredientService';
import IngredientList from '../../../components/ingredients/IngredientList';
import DeleteConfirmDialog from '../../../components/ingredients/DeleteConfirmDialog';
import Pagination from '../../../components/ingredientCategories/Pagination';
import SearchFilter from '../../../components/ingredientCategories/SearchFilter';

type SortField = 'ingredient_id' | 'ingredient_name' | 'category_name' | 'ingredient_cost' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const ListaIngredientes: React.FC = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<IngredientWithDetails[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<IngredientWithDetails[]>([]);
  const [sortedIngredients, setSortedIngredients] = useState<IngredientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<IngredientWithDetails | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load ingredients on component mount
  useEffect(() => {
    loadIngredients();
  }, []);

  // Filter and sort ingredients based on search term and sort criteria
  useEffect(() => {
    let filtered: IngredientWithDetails[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = ingredients;
    } else {
      filtered = ingredients.filter(ingredient =>
        ingredient.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.ingredient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ingredient.category_name && ingredient.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ingredient.supplier_name && ingredient.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredIngredients(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortIngredients(sorted, sortField, sortDirection);
    }
    
    setSortedIngredients(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [ingredients, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortIngredients = (
    ingredientsToSort: IngredientWithDetails[], 
    field: SortField, 
    direction: SortDirection
  ): IngredientWithDetails[] => {
    if (!direction) return ingredientsToSort;

    return [...ingredientsToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'ingredient_id':
          // Numeric comparison for IDs (extract number from IG1, IG2, etc.)
          const aNum = parseInt(aValue.replace('IG', '')) || 0;
          const bNum = parseInt(bValue.replace('IG', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'ingredient_cost':
          // Numeric comparison
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'ingredient_name':
        case 'category_name':
        default:
          // String comparison (case-insensitive)
          aValue = (aValue || '').toLowerCase();
          bValue = (bValue || '').toLowerCase();
          break;
      }

      // Compare values
      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      // Apply sort direction
      return direction === 'desc' ? comparison * -1 : comparison;
    });
  };

  const loadIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientService.getIngredients();
      setIngredients(data);
    } catch (err) {
      setError('Error al cargar los ingredientes');
      console.error('Error loading ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedIngredients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIngredients = sortedIngredients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleBackClick = () => {
    navigate('/menus/ingredientes');
  };

  const handleAddIngredient = () => {
    navigate('/menus/ingredientes/lista/nuevo');
  };

  const handleEditIngredient = (ingredient: IngredientWithDetails) => {
    navigate(`/menus/ingredientes/lista/editar/${ingredient.id}`);
  };

  const handleDeleteIngredient = (ingredient: IngredientWithDetails) => {
    setIngredientToDelete(ingredient);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ingredientToDelete) return;

    try {
      setOperationLoading(true);
      await ingredientService.deleteIngredient(ingredientToDelete.id);
      await loadIngredients(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setIngredientToDelete(null);
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      setError('Error al eliminar el ingrediente');
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBackClick}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Volver a Gestión de Ingredientes"
              title="Volver a Gestión de Ingredientes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                Lista de Ingredientes
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Gestiona el inventario completo de ingredientes disponibles
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8">
        <div className="max-w-7xl mx-auto">
          {/* Controls Section */}
          <div className="mb-8 space-y-4">
            {/* Top Row: Add Button and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAddIngredient}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Ingrediente</span>
              </button>
              
              <div className="w-full sm:w-80">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar por nombre, ID, categoría..."
                  loading={loading}
                />
              </div>
            </div>
            
            {/* Results Summary */}
            {!loading && (
              <div className="text-sm text-gray-600">
                {searchTerm ? (
                  <>
                    Mostrando {totalItems} resultado{totalItems !== 1 ? 's' : ''} 
                    {totalItems !== ingredients.length && ` de ${ingredients.length} ingredientes`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} ingrediente${totalItems !== 1 ? 's' : ''}`
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="ml-2 text-gray-600">Cargando ingredientes...</span>
            </div>
          ) : (
            <>
              {/* Ingredient List */}
              <IngredientList
                ingredients={currentIngredients}
                onEdit={handleEditIngredient}
                onDelete={handleDeleteIngredient}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {ingredients.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddIngredient}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Ingrediente</span>
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setIngredientToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        ingredient={ingredientToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default ListaIngredientes;