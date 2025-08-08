import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DeliveryOption, CreateDeliveryOptionData } from '../../types/deliveryOption';
import { deliveryOptionService } from '../../services/deliveryOptionService';
import OptionForm from '../../components/deliveryOptions/OptionForm';
import DeleteConfirmDialog from '../../components/deliveryOptions/DeleteConfirmDialog';
import OptionList from '../../components/deliveryOptions/OptionList';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';

type SortField = 'delivery_options_id' | 'delivery_options_name' | 'delivery_options_price' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const EnviosProductos: React.FC = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<DeliveryOption[]>([]);
  const [sortedOptions, setSortedOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<DeliveryOption | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load options on component mount
  useEffect(() => {
    loadOptions();
  }, []);

  // Filter and sort options based on search term and sort criteria
  useEffect(() => {
    let filtered: DeliveryOption[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = options;
    } else {
      filtered = options.filter(option =>
        option.delivery_options_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.delivery_options_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.delivery_options_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOptions(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortOptions(sorted, sortField, sortDirection);
    }
    
    setSortedOptions(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [options, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortOptions = (
    optionsToSort: DeliveryOption[], 
    field: SortField, 
    direction: SortDirection
  ): DeliveryOption[] => {
    if (!direction) return optionsToSort;

    return [...optionsToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'delivery_options_id':
          // Numeric comparison for IDs (extract number from DO1, DO2, etc.)
          const aNum = parseInt(aValue.replace('DO', '')) || 0;
          const bNum = parseInt(bValue.replace('DO', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'delivery_options_price':
          // Numeric comparison
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'delivery_options_name':
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

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryOptionService.getOptions();
      setOptions(data);
    } catch (err) {
      setError('Error al cargar las opciones de envío');
      console.error('Error loading delivery options:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedOptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOptions = sortedOptions.slice(startIndex, endIndex);

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

  const handleAddOption = () => {
    setEditingOption(null);
    setIsFormOpen(true);
  };

  const handleEditOption = (option: DeliveryOption) => {
    setEditingOption(option);
    setIsFormOpen(true);
  };

  const handleDeleteOption = (option: DeliveryOption) => {
    setOptionToDelete(option);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: CreateDeliveryOptionData) => {
    try {
      setOperationLoading(true);
      
      if (editingOption) {
        // Update existing option
        await deliveryOptionService.updateOption(editingOption.id, formData);
      } else {
        // Create new option
        await deliveryOptionService.createOption(formData);
      }
      
      await loadOptions(); // Refresh the list
      setIsFormOpen(false);
      setEditingOption(null);
    } catch (err) {
      console.error('Error saving delivery option:', err);
      setError('Error al guardar la opción de envío');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!optionToDelete) return;

    try {
      setOperationLoading(true);
      await deliveryOptionService.deleteOption(optionToDelete.id);
      await loadOptions(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setOptionToDelete(null);
    } catch (err) {
      console.error('Error deleting delivery option:', err);
      setError('Error al eliminar la opción de envío');
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
                Opciones de Envío
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Administra opciones y configuraciones de envío
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
                onClick={handleAddOption}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Opción de Envío</span>
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
                    {totalItems !== options.length && ` de ${options.length} opciones`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} opción${totalItems !== 1 ? 'es' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando opciones de envío...</span>
            </div>
          ) : (
            <>
              {/* Option List */}
              <OptionList
                options={currentOptions}
                onEdit={handleEditOption}
                onDelete={handleDeleteOption}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {options.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddOption}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primera Opción</span>
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

      {/* Option Form Modal */}
      <OptionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOption(null);
        }}
        onSubmit={handleFormSubmit}
        editingOption={editingOption}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setOptionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        option={optionToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default EnviosProductos;