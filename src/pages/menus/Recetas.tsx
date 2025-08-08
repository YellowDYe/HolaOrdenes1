import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { RecipeWithDetails, CreateRecipeData } from '../../types/recipe';
import { recipeService } from '../../services/recipeService';
import RecipeList from '../../components/recipes/RecipeList';
import DeleteConfirmDialog from '../../components/recipes/DeleteConfirmDialog';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';

type SortField = 'recipe_id' | 'recipe_name' | 'plan_name' | 'recipe_total_cost' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Recetas: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithDetails[]>([]);
  const [sortedRecipes, setSortedRecipes] = useState<RecipeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeWithDetails | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load recipes on component mount
  useEffect(() => {
    loadRecipes();
  }, []);

  // Filter and sort recipes based on search term and sort criteria
  useEffect(() => {
    let filtered: RecipeWithDetails[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = recipes;
    } else {
      filtered = recipes.filter(recipe =>
        recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.recipe_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.plan_name && recipe.plan_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (recipe.container_name && recipe.container_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredRecipes(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortRecipes(sorted, sortField, sortDirection);
    }
    
    setSortedRecipes(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [recipes, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortRecipes = (
    recipesToSort: RecipeWithDetails[], 
    field: SortField, 
    direction: SortDirection
  ): RecipeWithDetails[] => {
    if (!direction) return recipesToSort;

    return [...recipesToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'recipe_id':
          // Numeric comparison for IDs (extract number from RE1, RE2, etc.)
          const aNum = parseInt(aValue.replace('RE', '')) || 0;
          const bNum = parseInt(bValue.replace('RE', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'recipe_total_cost':
          // Numeric comparison
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'recipe_name':
        case 'plan_name':
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

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recipeService.getRecipes();
      setRecipes(data);
    } catch (err) {
      setError('Error al cargar las recetas');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedRecipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = sortedRecipes.slice(startIndex, endIndex);

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
    navigate('/menus');
  };

  const handleAddRecipe = () => {
    navigate('/menus/recetas/nueva');
  };

  const handleViewRecipe = (recipe: RecipeWithDetails) => {
    navigate(`/menus/recetas/ver/${recipe.id}`);
  };

  const handleEditRecipe = (recipe: RecipeWithDetails) => {
    navigate(`/menus/recetas/editar/${recipe.id}`);
  };

  const handleDeleteRecipe = (recipe: RecipeWithDetails) => {
    setRecipeToDelete(recipe);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateRecipe = async (recipe: RecipeWithDetails) => {
    try {
      setOperationLoading(true);
      await recipeService.duplicateRecipe(recipe.id);
      await loadRecipes(); // Refresh the list
    } catch (err) {
      console.error('Error duplicating recipe:', err);
      setError('Error al duplicar la receta');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return;

    try {
      setOperationLoading(true);
      await recipeService.deleteRecipe(recipeToDelete.id);
      await loadRecipes(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setRecipeToDelete(null);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Error al eliminar la receta');
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
              aria-label="Volver a Recetas y Menús"
              title="Volver a Recetas y Menús"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                Gestión de Recetas
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Crea y administra recetas con instrucciones detalladas
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
                onClick={handleAddRecipe}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Receta</span>
              </button>
              
              <div className="w-full sm:w-80">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar por nombre, ID, plan..."
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
                    {totalItems !== recipes.length && ` de ${recipes.length} recetas`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} receta${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando recetas...</span>
            </div>
          ) : (
            <>
              {/* Recipe List */}
              <RecipeList
                recipes={currentRecipes}
                onView={handleViewRecipe}
                onEdit={handleEditRecipe}
                onDelete={handleDeleteRecipe}
                onDuplicate={handleDuplicateRecipe}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
                operationLoading={operationLoading}
              />

              {/* No Results State */}
              {recipes.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddRecipe}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Crear Primera Receta</span>
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
          setRecipeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        recipe={recipeToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Recetas;