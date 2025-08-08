import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { FoodContainer, CreateFoodContainerData } from '../../types/foodContainer';
import { foodContainerService } from '../../services/foodContainerService';
import ContainerForm from '../../components/foodContainers/ContainerForm';
import DeleteConfirmDialog from '../../components/foodContainers/DeleteConfirmDialog';
import ContainerList from '../../components/foodContainers/ContainerList';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';

type SortField = 'food_containers_id' | 'food_containers_name' | 'food_containers_cost' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Contenedores: React.FC = () => {
  const navigate = useNavigate();
  const [containers, setContainers] = useState<FoodContainer[]>([]);
  const [filteredContainers, setFilteredContainers] = useState<FoodContainer[]>([]);
  const [sortedContainers, setSortedContainers] = useState<FoodContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<FoodContainer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [containerToDelete, setContainerToDelete] = useState<FoodContainer | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load containers on component mount
  useEffect(() => {
    loadContainers();
  }, []);

  // Filter and sort containers based on search term and sort criteria
  useEffect(() => {
    let filtered: FoodContainer[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = containers;
    } else {
      filtered = containers.filter(container =>
        container.food_containers_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.food_containers_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.food_containers_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredContainers(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortContainers(sorted, sortField, sortDirection);
    }
    
    setSortedContainers(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [containers, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortContainers = (
    containersToSort: FoodContainer[], 
    field: SortField, 
    direction: SortDirection
  ): FoodContainer[] => {
    if (!direction) return containersToSort;

    return [...containersToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'food_containers_id':
          // Numeric comparison for IDs (extract number from FC1, FC2, etc.)
          const aNum = parseInt(aValue.replace('FC', '')) || 0;
          const bNum = parseInt(bValue.replace('FC', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'food_containers_cost':
          // Numeric comparison
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'food_containers_name':
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

  const loadContainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await foodContainerService.getContainers();
      setContainers(data);
    } catch (err) {
      setError('Error al cargar los contenedores');
      console.error('Error loading containers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedContainers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContainers = sortedContainers.slice(startIndex, endIndex);

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

  const handleAddContainer = () => {
    setEditingContainer(null);
    setIsFormOpen(true);
  };

  const handleEditContainer = (container: FoodContainer) => {
    setEditingContainer(container);
    setIsFormOpen(true);
  };

  const handleDeleteContainer = (container: FoodContainer) => {
    setContainerToDelete(container);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: CreateFoodContainerData) => {
    try {
      setOperationLoading(true);
      
      if (editingContainer) {
        // Update existing container
        await foodContainerService.updateContainer(editingContainer.id, formData);
      } else {
        // Create new container
        await foodContainerService.createContainer(formData);
      }
      
      await loadContainers(); // Refresh the list
      setIsFormOpen(false);
      setEditingContainer(null);
    } catch (err) {
      console.error('Error saving container:', err);
      setError('Error al guardar el contenedor');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!containerToDelete) return;

    try {
      setOperationLoading(true);
      await foodContainerService.deleteContainer(containerToDelete.id);
      await loadContainers(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setContainerToDelete(null);
    } catch (err) {
      console.error('Error deleting container:', err);
      setError('Error al eliminar el contenedor');
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
                Gestión de Contenedores
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Administra tipos y tamaños de contenedores disponibles
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
                onClick={handleAddContainer}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Contenedor</span>
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
                    {totalItems !== containers.length && ` de ${containers.length} contenedores`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} contenedor${totalItems !== 1 ? 'es' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando contenedores...</span>
            </div>
          ) : (
            <>
              {/* Container List */}
              <ContainerList
                containers={currentContainers}
                onEdit={handleEditContainer}
                onDelete={handleDeleteContainer}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {containers.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddContainer}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Contenedor</span>
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

      {/* Container Form Modal */}
      <ContainerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingContainer(null);
        }}
        onSubmit={handleFormSubmit}
        editingContainer={editingContainer}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setContainerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        container={containerToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Contenedores;