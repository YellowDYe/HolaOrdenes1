import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Tax, CreateTaxData } from '../../types/tax';
import { taxService } from '../../services/taxService';
import TaxForm from '../../components/taxes/TaxForm';
import DeleteConfirmDialog from '../../components/taxes/DeleteConfirmDialog';
import TaxList from '../../components/taxes/TaxList';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';
import { useErrorHandler } from '../../hooks/useErrorHandler';

type SortField = 'tax_id' | 'tax_name' | 'tax_percentage' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Impuestos: React.FC = () => {
  const navigate = useNavigate();
  const { handleError, logUserAction } = useErrorHandler();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [filteredTaxes, setFilteredTaxes] = useState<Tax[]>([]);
  const [sortedTaxes, setSortedTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load taxes on component mount
  useEffect(() => {
    loadTaxes();
  }, []);

  // Filter and sort taxes based on search term and sort criteria
  useEffect(() => {
    let filtered: Tax[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = taxes;
    } else {
      filtered = taxes.filter(tax =>
        tax.tax_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tax.tax_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTaxes(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortTaxes(sorted, sortField, sortDirection);
    }
    
    setSortedTaxes(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [taxes, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortTaxes = (
    taxesToSort: Tax[], 
    field: SortField, 
    direction: SortDirection
  ): Tax[] => {
    if (!direction) return taxesToSort;

    return [...taxesToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'tax_id':
          // Numeric comparison for IDs (extract number from TAX1, TAX2, etc.)
          const aNum = parseInt(aValue.replace('TAX', '')) || 0;
          const bNum = parseInt(bValue.replace('TAX', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'tax_percentage':
          // Numeric comparison
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'tax_name':
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

  const loadTaxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taxService.getTaxes();
      setTaxes(data);
      logUserAction('taxes_loaded', { count: data.length });
    } catch (err) {
      handleError(err as Error, { operation: 'loadTaxes' });
      setError('Error al cargar los impuestos');
      console.error('Error loading taxes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedTaxes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTaxes = sortedTaxes.slice(startIndex, endIndex);

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

  const handleAddTax = () => {
    setEditingTax(null);
    setIsFormOpen(true);
    logUserAction('add_tax_clicked');
  };

  const handleEditTax = (tax: Tax) => {
    setEditingTax(tax);
    setIsFormOpen(true);
    logUserAction('edit_tax_clicked', { taxId: tax.tax_id });
  };

  const handleDeleteTax = (tax: Tax) => {
    setTaxToDelete(tax);
    setIsDeleteDialogOpen(true);
    logUserAction('delete_tax_clicked', { taxId: tax.tax_id });
  };

  const handleFormSubmit = async (formData: CreateTaxData) => {
    try {
      setOperationLoading(true);
      
      if (editingTax) {
        // Update existing tax
        await taxService.updateTax(editingTax.id, formData);
        logUserAction('tax_updated', { taxId: editingTax.tax_id });
      } else {
        // Create new tax
        await taxService.createTax(formData);
        logUserAction('tax_created');
      }
      
      await loadTaxes(); // Refresh the list
      setIsFormOpen(false);
      setEditingTax(null);
    } catch (err) {
      handleError(err as Error, { operation: 'saveTax', isEditing: !!editingTax });
      console.error('Error saving tax:', err);
      setError('Error al guardar el impuesto');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taxToDelete) return;

    try {
      setOperationLoading(true);
      await taxService.deleteTax(taxToDelete.id);
      await loadTaxes(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setTaxToDelete(null);
      logUserAction('tax_deleted', { taxId: taxToDelete.tax_id });
    } catch (err) {
      handleError(err as Error, { operation: 'deleteTax', taxId: taxToDelete.tax_id });
      console.error('Error deleting tax:', err);
      setError('Error al eliminar el impuesto');
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
                Gestión de Impuestos
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Administra los impuestos aplicables a productos y servicios
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
                onClick={handleAddTax}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Impuesto</span>
              </button>
              
              <div className="w-full sm:w-80">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar por nombre o ID..."
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
                    {totalItems !== taxes.length && ` de ${taxes.length} impuestos`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} impuesto${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando impuestos...</span>
            </div>
          ) : (
            <>
              {/* Tax List */}
              <TaxList
                taxes={currentTaxes}
                onEdit={handleEditTax}
                onDelete={handleDeleteTax}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {taxes.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddTax}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Impuesto</span>
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

      {/* Tax Form Modal */}
      <TaxForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTax(null);
        }}
        onSubmit={handleFormSubmit}
        editingTax={editingTax}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTaxToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        tax={taxToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Impuestos;