import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { WeekWithDetails, CreateWeekData } from '../types/week';
import { weekService } from '../services/weekService';
import WeekForm from '../components/weeks/WeekForm';
import DeleteConfirmDialog from '../components/weeks/DeleteConfirmDialog';
import WeekList from '../components/weeks/WeekList';
import Pagination from '../components/ingredientCategories/Pagination';
import SearchFilter from '../components/ingredientCategories/SearchFilter';
import { useErrorHandler } from '../hooks/useErrorHandler';

type SortField = 'week_id' | 'week_name' | 'menu_name' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Semana: React.FC = () => {
  const { handleError, logUserAction } = useErrorHandler();
  const [weeks, setWeeks] = useState<WeekWithDetails[]>([]);
  const [filteredWeeks, setFilteredWeeks] = useState<WeekWithDetails[]>([]);
  const [sortedWeeks, setSortedWeeks] = useState<WeekWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<WeekWithDetails | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<WeekWithDetails | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load weeks on component mount
  useEffect(() => {
    loadWeeks();
  }, []);

  // Filter and sort weeks based on search term and sort criteria
  useEffect(() => {
    let filtered: WeekWithDetails[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = weeks;
    } else {
      filtered = weeks.filter(week =>
        week.week_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        week.week_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (week.menu_name && week.menu_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredWeeks(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortWeeks(sorted, sortField, sortDirection);
    }
    
    setSortedWeeks(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [weeks, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortWeeks = (
    weeksToSort: WeekWithDetails[], 
    field: SortField, 
    direction: SortDirection
  ): WeekWithDetails[] => {
    if (!direction) return weeksToSort;

    return [...weeksToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'week_id':
          // Numeric comparison for IDs (extract number from WK1, WK2, etc.)
          const aNum = parseInt(aValue.replace('WK', '')) || 0;
          const bNum = parseInt(bValue.replace('WK', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'week_name':
        case 'menu_name':
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

  const loadWeeks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weekService.getWeeks();
      setWeeks(data);
      logUserAction('weeks_loaded', { count: data.length });
    } catch (err) {
      handleError(err as Error, { operation: 'loadWeeks' });
      setError('Error al cargar las semanas');
      console.error('Error loading weeks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedWeeks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWeeks = sortedWeeks.slice(startIndex, endIndex);

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

  const handleAddWeek = () => {
    setEditingWeek(null);
    setIsFormOpen(true);
    logUserAction('add_week_clicked');
  };

  const handleEditWeek = (week: WeekWithDetails) => {
    setEditingWeek(week);
    setIsFormOpen(true);
    logUserAction('edit_week_clicked', { weekId: week.week_id });
  };

  const handleDeleteWeek = (week: WeekWithDetails) => {
    setWeekToDelete(week);
    setIsDeleteDialogOpen(true);
    logUserAction('delete_week_clicked', { weekId: week.week_id });
  };

  const handleFormSubmit = async (formData: CreateWeekData) => {
    try {
      setOperationLoading(true);
      
      if (editingWeek) {
        // Update existing week
        await weekService.updateWeek(editingWeek.id, formData);
        logUserAction('week_updated', { weekId: editingWeek.week_id });
      } else {
        // Create new week
        await weekService.createWeek(formData);
        logUserAction('week_created');
      }
      
      await loadWeeks(); // Refresh the list
      setIsFormOpen(false);
      setEditingWeek(null);
    } catch (err) {
      handleError(err as Error, { operation: 'saveWeek', isEditing: !!editingWeek });
      console.error('Error saving week:', err);
      setError('Error al guardar la semana');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!weekToDelete) return;

    try {
      setOperationLoading(true);
      await weekService.deleteWeek(weekToDelete.id);
      await loadWeeks(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setWeekToDelete(null);
      logUserAction('week_deleted', { weekId: weekToDelete.week_id });
    } catch (err) {
      handleError(err as Error, { operation: 'deleteWeek', weekId: weekToDelete.week_id });
      console.error('Error deleting week:', err);
      setError('Error al eliminar la semana');
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                Gestión de Semanas
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona las semanas de servicio y planificación
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
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
                onClick={handleAddWeek}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Semana</span>
              </button>
              
              <div className="w-full sm:w-80">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar por nombre, ID o menú..."
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
                    {totalItems !== weeks.length && ` de ${weeks.length} semanas`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} semana${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando semanas...</span>
            </div>
          ) : (
            <>
              {/* Week List */}
              <WeekList
                weeks={currentWeeks}
                onEdit={handleEditWeek}
                onDelete={handleDeleteWeek}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {weeks.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    ¡Comienza creando tu primera semana!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Organiza las semanas de servicio asignando menús semanales
                  </p>
                  <button
                    onClick={handleAddWeek}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primera Semana</span>
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

      {/* Week Form Modal */}
      <WeekForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWeek(null);
        }}
        onSubmit={handleFormSubmit}
        editingWeek={editingWeek}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setWeekToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        week={weekToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Semana;