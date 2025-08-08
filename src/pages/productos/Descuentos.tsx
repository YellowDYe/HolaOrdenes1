import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Discount, CreateDiscountData } from '../../types/discount';
import { discountService } from '../../services/discountService';
import DiscountForm from '../../components/discounts/DiscountForm';
import DeleteConfirmDialog from '../../components/discounts/DeleteConfirmDialog';
import DiscountList from '../../components/discounts/DiscountList';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';
import { useErrorHandler } from '../../hooks/useErrorHandler';

type SortField = 'discount_id' | 'discount_name' | 'discount_percentage' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Descuentos: React.FC = () => {
  const navigate = useNavigate();
  const { handleError, logUserAction } = useErrorHandler();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [sortedDiscounts, setSortedDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load discounts on component mount
  useEffect(() => {
    loadDiscounts();
  }, []);

  // Filter and sort discounts based on search term and sort criteria
  useEffect(() => {
    let filtered: Discount[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = discounts;
    } else {
      filtered = discounts.filter(discount =>
        discount.discount_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discount.discount_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredDiscounts(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortDiscounts(sorted, sortField, sortDirection);
    }
    
    setSortedDiscounts(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [discounts, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortDiscounts = (
    discountsToSort: Discount[], 
    field: SortField, 
    direction: SortDirection
  ): Discount[] => {
    if (!direction) return discountsToSort;

    return [...discountsToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'discount_id':
          // Numeric comparison for IDs (extract number from DES1, DES2, etc.)
          const aNum = parseInt(aValue.replace('DES', '')) || 0;
          const bNum = parseInt(bValue.replace('DES', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'discount_percentage':
          // Numeric comparison
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'discount_name':
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

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discountService.getDiscounts();
      setDiscounts(data);
      logUserAction('discounts_loaded', { count: data.length });
    } catch (err) {
      handleError(err as Error, { operation: 'loadDiscounts' });
      setError('Error al cargar los descuentos');
      console.error('Error loading discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedDiscounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDiscounts = sortedDiscounts.slice(startIndex, endIndex);

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

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setIsFormOpen(true);
    logUserAction('add_discount_clicked');
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setIsFormOpen(true);
    logUserAction('edit_discount_clicked', { discountId: discount.discount_id });
  };

  const handleDeleteDiscount = (discount: Discount) => {
    setDiscountToDelete(discount);
    setIsDeleteDialogOpen(true);
    logUserAction('delete_discount_clicked', { discountId: discount.discount_id });
  };

  const handleFormSubmit = async (formData: CreateDiscountData) => {
    try {
      setOperationLoading(true);
      
      if (editingDiscount) {
        // Update existing discount
        await discountService.updateDiscount(editingDiscount.id, formData);
        logUserAction('discount_updated', { discountId: editingDiscount.discount_id });
      } else {
        // Create new discount
        await discountService.createDiscount(formData);
        logUserAction('discount_created');
      }
      
      await loadDiscounts(); // Refresh the list
      setIsFormOpen(false);
      setEditingDiscount(null);
    } catch (err) {
      handleError(err as Error, { operation: 'saveDiscount', isEditing: !!editingDiscount });
      console.error('Error saving discount:', err);
      setError('Error al guardar el descuento');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!discountToDelete) return;

    try {
      setOperationLoading(true);
      await discountService.deleteDiscount(discountToDelete.id);
      await loadDiscounts(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setDiscountToDelete(null);
      logUserAction('discount_deleted', { discountId: discountToDelete.discount_id });
    } catch (err) {
      handleError(err as Error, { operation: 'deleteDiscount', discountId: discountToDelete.discount_id });
      console.error('Error deleting discount:', err);
      setError('Error al eliminar el descuento');
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
                Gestión de Descuentos
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Administra los descuentos aplicables a productos y servicios
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
                onClick={handleAddDiscount}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Descuento</span>
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
                    {totalItems !== discounts.length && ` de ${discounts.length} descuentos`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} descuento${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando descuentos...</span>
            </div>
          ) : (
            <>
              {/* Discount List */}
              <DiscountList
                discounts={currentDiscounts}
                onEdit={handleEditDiscount}
                onDelete={handleDeleteDiscount}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {discounts.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddDiscount}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Descuento</span>
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

      {/* Discount Form Modal */}
      <DiscountForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDiscount(null);
        }}
        onSubmit={handleFormSubmit}
        editingDiscount={editingDiscount}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDiscountToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        discount={discountToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Descuentos;