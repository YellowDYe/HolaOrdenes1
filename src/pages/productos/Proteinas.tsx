import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ProteinPlan, CreateProteinPlanData } from '../../types/proteinPlan';
import { proteinPlanService } from '../../services/proteinPlanService';
import PlanForm from '../../components/proteinPlans/PlanForm';
import DeleteConfirmDialog from '../../components/proteinPlans/DeleteConfirmDialog';
import PlanList from '../../components/proteinPlans/PlanList';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';

type SortField = 'protein_plans_id' | 'protein_plans_name' | 'protein_plans_price' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Proteinas: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ProteinPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ProteinPlan[]>([]);
  const [sortedPlans, setSortedPlans] = useState<ProteinPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProteinPlan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<ProteinPlan | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load plans on component mount
  useEffect(() => {
    loadPlans();
  }, []);

  // Filter and sort plans based on search term and sort criteria
  useEffect(() => {
    let filtered: ProteinPlan[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = plans;
    } else {
      filtered = plans.filter(plan =>
        plan.protein_plans_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.protein_plans_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.protein_plans_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPlans(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortPlans(sorted, sortField, sortDirection);
    }
    
    setSortedPlans(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [plans, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortPlans = (
    plansToSort: ProteinPlan[], 
    field: SortField, 
    direction: SortDirection
  ): ProteinPlan[] => {
    if (!direction) return plansToSort;

    return [...plansToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'protein_plans_id':
          // Numeric comparison for IDs (extract number from PP1, PP2, etc.)
          const aNum = parseInt(aValue.replace('PP', '')) || 0;
          const bNum = parseInt(bValue.replace('PP', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'protein_plans_price':
          // Numeric comparison
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'protein_plans_name':
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

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proteinPlanService.getPlans();
      setPlans(data);
    } catch (err) {
      setError('Error al cargar los planes de proteína');
      console.error('Error loading protein plans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedPlans.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = sortedPlans.slice(startIndex, endIndex);

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
    navigate('/planes');
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEditPlan = (plan: ProteinPlan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDeletePlan = (plan: ProteinPlan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: CreateProteinPlanData) => {
    try {
      setOperationLoading(true);
      
      if (editingPlan) {
        // Update existing plan
        await proteinPlanService.updatePlan(editingPlan.id, formData);
      } else {
        // Create new plan
        await proteinPlanService.createPlan(formData);
      }
      
      await loadPlans(); // Refresh the list
      setIsFormOpen(false);
      setEditingPlan(null);
    } catch (err) {
      console.error('Error saving protein plan:', err);
      setError('Error al guardar el plan de proteína');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    try {
      setOperationLoading(true);
      await proteinPlanService.deletePlan(planToDelete.id);
      await loadPlans(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      console.error('Error deleting protein plan:', err);
      setError('Error al eliminar el plan de proteína');
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
              aria-label="Volver a Productos"
              title="Volver a Productos"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                Planes de Proteína
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Gestiona planes y opciones de proteínas disponibles
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
                onClick={handleAddPlan}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Plan de Proteína</span>
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
                    {totalItems !== plans.length && ` de ${plans.length} planes`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} plan${totalItems !== 1 ? 'es' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando planes de proteína...</span>
            </div>
          ) : (
            <>
              {/* Plan List */}
              <PlanList
                plans={currentPlans}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {plans.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddPlan}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Plan</span>
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

      {/* Plan Form Modal */}
      <PlanForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPlan(null);
        }}
        onSubmit={handleFormSubmit}
        editingPlan={editingPlan}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPlanToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        plan={planToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Proteinas;