import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Supplier, CreateSupplierData } from '../../../types/supplier';
import { supplierService } from '../../../services/supplierService';
import SupplierForm from '../../../components/suppliers/SupplierForm';
import DeleteConfirmDialog from '../../../components/suppliers/DeleteConfirmDialog';
import SupplierList from '../../../components/suppliers/SupplierList';
import Pagination from '../../../components/ingredientCategories/Pagination';
import SearchFilter from '../../../components/ingredientCategories/SearchFilter';

type SortField = 'supplier_id' | 'supplier_name' | 'contact_person' | 'email' | 'created_at' | 'is_active';
type SortDirection = 'asc' | 'desc' | null;

const Proveedores: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [sortedSuppliers, setSortedSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Filter and sort suppliers based on search term and sort criteria
  useEffect(() => {
    let filtered: Supplier[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = suppliers;
    } else {
      filtered = suppliers.filter(supplier =>
        supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSuppliers(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortSuppliers(sorted, sortField, sortDirection);
    }
    
    setSortedSuppliers(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [suppliers, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortSuppliers = (
    suppliersToSort: Supplier[], 
    field: SortField, 
    direction: SortDirection
  ): Supplier[] => {
    if (!direction) return suppliersToSort;

    return [...suppliersToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'supplier_id':
          // Numeric comparison for IDs (extract number from PV1, PV2, etc.)
          const aNum = parseInt(aValue.replace('PV', '')) || 0;
          const bNum = parseInt(bValue.replace('PV', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'is_active':
          // Boolean comparison (active first)
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
          break;
        case 'supplier_name':
        case 'contact_person':
        case 'email':
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

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError('Error al cargar los proveedores');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = sortedSuppliers.slice(startIndex, endIndex);

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

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleSupplierStatus = async (supplier: Supplier) => {
    try {
      setOperationLoading(true);
      await supplierService.toggleSupplierStatus(supplier.id, !supplier.is_active);
      await loadSuppliers(); // Refresh the list
    } catch (err) {
      console.error('Error toggling supplier status:', err);
      setError('Error al cambiar el estado del proveedor');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleFormSubmit = async (formData: CreateSupplierData) => {
    try {
      setOperationLoading(true);
      
      if (editingSupplier) {
        // Update existing supplier
        await supplierService.updateSupplier(editingSupplier.id, formData);
      } else {
        // Create new supplier
        await supplierService.createSupplier(formData);
      }
      
      await loadSuppliers(); // Refresh the list
      setIsFormOpen(false);
      setEditingSupplier(null);
    } catch (err) {
      console.error('Error saving supplier:', err);
      setError('Error al guardar el proveedor');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      setOperationLoading(true);
      await supplierService.deleteSupplier(supplierToDelete.id);
      await loadSuppliers(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError('Error al eliminar el proveedor');
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
                Gestión de Proveedores
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Administra proveedores y sus datos de contacto para ingredientes
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
                onClick={handleAddSupplier}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Proveedor</span>
              </button>
              
              <div className="w-full sm:w-80">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar por nombre, contacto, email..."
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
                    {totalItems !== suppliers.length && ` de ${suppliers.length} proveedores`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} proveedor${totalItems !== 1 ? 'es' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando proveedores...</span>
            </div>
          ) : (
            <>
              {/* Supplier List */}
              <SupplierList
                suppliers={currentSuppliers}
                onEdit={handleEditSupplier}
                onDelete={handleDeleteSupplier}
                onToggleStatus={handleToggleSupplierStatus}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {suppliers.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <button
                    onClick={handleAddSupplier}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Proveedor</span>
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

      {/* Supplier Form Modal */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSupplier(null);
        }}
        onSubmit={handleFormSubmit}
        editingSupplier={editingSupplier}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSupplierToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        supplier={supplierToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Proveedores;