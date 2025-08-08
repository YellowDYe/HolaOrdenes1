import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CookingStep, CreateCookingStepData } from '../../types/cookingStep';
import { cookingStepService } from '../../services/cookingStepService';
import StepForm from '../../components/cookingSteps/StepForm';
import DeleteConfirmDialog from '../../components/cookingSteps/DeleteConfirmDialog';
import StepList from '../../components/cookingSteps/StepList';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';

type SortField = 'cooking_steps_id' | 'cooking_steps_name' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Procesos: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<CookingStep[]>([]);
  const [filteredSteps, setFilteredSteps] = useState<CookingStep[]>([]);
  const [sortedSteps, setSortedSteps] = useState<CookingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<CookingStep | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<CookingStep | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load steps on component mount
  useEffect(() => {
    loadSteps();
  }, []);

  // Filter and sort steps based on search term and sort criteria
  useEffect(() => {
    let filtered: CookingStep[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = steps;
    } else {
      filtered = steps.filter(step =>
        step.cooking_steps_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.cooking_steps_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.cooking_steps_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSteps(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortSteps(sorted, sortField, sortDirection);
    }
    
    setSortedSteps(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [steps, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortSteps = (
    stepsToSort: CookingStep[], 
    field: SortField, 
    direction: SortDirection
  ): CookingStep[] => {
    if (!direction) return stepsToSort;

    return [...stepsToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'cooking_steps_id':
          // Numeric comparison for IDs (extract number from CS1, CS2, etc.)
          const aNum = parseInt(aValue.replace('CS', '')) || 0;
          const bNum = parseInt(bValue.replace('CS', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'cooking_steps_name':
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

  const loadSteps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cookingStepService.getSteps();
      setSteps(data);
    } catch (err) {
      setError('Error al cargar los procesos');
      console.error('Error loading cooking steps:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedSteps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSteps = sortedSteps.slice(startIndex, endIndex);

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

  const handleAddStep = () => {
    setEditingStep(null);
    setIsFormOpen(true);
  };

  const handleEditStep = (step: CookingStep) => {
    setEditingStep(step);
    setIsFormOpen(true);
  };

  const handleDeleteStep = (step: CookingStep) => {
    setStepToDelete(step);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: CreateCookingStepData) => {
    try {
      setOperationLoading(true);
      
      if (editingStep) {
        // Update existing step
        await cookingStepService.updateStep(editingStep.id, formData);
      } else {
        // Create new step
        await cookingStepService.createStep(formData);
      }
      
      await loadSteps(); // Refresh the list
      setIsFormOpen(false);
      setEditingStep(null);
    } catch (err) {
      console.error('Error saving cooking step:', err);
      setError('Error al guardar el proceso');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!stepToDelete) return;

    try {
      setOperationLoading(true);
      await cookingStepService.deleteStep(stepToDelete.id);
      await loadSteps(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setStepToDelete(null);
    } catch (err) {
      console.error('Error deleting cooking step:', err);
      setError('Error al eliminar el proceso');
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
                Gestión de Procesos
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Define y gestiona procesos de preparación y cocina
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
                onClick={handleAddStep}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Proceso</span>
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
                    {totalItems !== steps.length && ` de ${steps.length} procesos`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} proceso${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando procesos...</span>
            </div>
          ) : (
            <>
              {/* Step List */}
              <StepList
                steps={currentSteps}
                onEdit={handleEditStep}
                onDelete={handleDeleteStep}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {steps.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddStep}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Proceso</span>
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

      {/* Step Form Modal */}
      <StepForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStep(null);
        }}
        onSubmit={handleFormSubmit}
        editingStep={editingStep}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setStepToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        step={stepToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Procesos;