import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { IngredientCategory, CreateIngredientCategoryData } from '../../../types/ingredientCategory';
import { ingredientCategoryService } from '../../../services/ingredientCategoryService';
import CategoryForm from '../../../components/ingredientCategories/CategoryForm';
import DeleteConfirmDialog from '../../../components/ingredientCategories/DeleteConfirmDialog';
import CategoryList from '../../../components/ingredientCategories/CategoryList';
import Pagination from '../../../components/ingredientCategories/Pagination';
import SearchFilter from '../../../components/ingredientCategories/SearchFilter';

type SortField = 'ingredient_category_id' | 'ingredient_category' | 'description' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const CategoriasIngredientes: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<IngredientCategory[]>([]);
  const [sortedCategories, setSortedCategories] = useState<IngredientCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IngredientCategory | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<IngredientCategory | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter and sort categories based on search term and sort criteria
  useEffect(() => {
    let filtered: IngredientCategory[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = categories;
    } else {
      filtered = categories.filter(category =>
        category.ingredient_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.ingredient_category_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCategories(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortCategories(sorted, sortField, sortDirection);
    }
    
    setSortedCategories(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [categories, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortCategories = (
    categoriesToSort: IngredientCategory[], 
    field: SortField, 
    direction: SortDirection
  ): IngredientCategory[] => {
    if (!direction) return categoriesToSort;

    return [...categoriesToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'ingredient_category_id':
          // Numeric comparison for IDs (extract number from IC1, IC2, etc.)
          const aNum = parseInt(aValue.replace('IC', '')) || 0;
          const bNum = parseInt(bValue.replace('IC', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'ingredient_category':
        case 'description':
        default:
          // String comparison (case-insensitive)
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
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

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientCategoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Error al cargar las categorías de ingredientes');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = sortedCategories.slice(startIndex, endIndex);

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

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: IngredientCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (category: IngredientCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: CreateIngredientCategoryData) => {
    try {
      setOperationLoading(true);
      
      if (editingCategory) {
        // Update existing category
        await ingredientCategoryService.updateCategory(editingCategory.id, formData);
      } else {
        // Create new category
        await ingredientCategoryService.createCategory(formData);
      }
      
      await loadCategories(); // Refresh the list
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Error al guardar la categoría');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setOperationLoading(true);
      await ingredientCategoryService.deleteCategory(categoryToDelete.id);
      await loadCategories(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Error al eliminar la categoría');
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
                Categorías de Ingredientes
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Organiza y gestiona las categorías para clasificar tus ingredientes
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8">
        <div className="max-w-6xl mx-auto">
          {/* Controls Section */}
          <div className="mb-8 space-y-4">
            {/* Top Row: Add Button and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAddCategory}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Categoría</span>
              </button>
              
              <div className="w-full sm:w-80">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar por nombre, ID o descripción..."
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
                    {totalItems !== categories.length && ` de ${categories.length} categorías`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} categoría${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando categorías...</span>
            </div>
          ) : (
            <>
              {/* Category List */}
              <CategoryList
                categories={currentCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {categories.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddCategory}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primera Categoría</span>
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

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        editingCategory={editingCategory}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        category={categoryToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default CategoriasIngredientes;