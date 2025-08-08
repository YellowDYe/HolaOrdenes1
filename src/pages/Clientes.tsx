import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Loader2,
  AlertCircle,
  Users
} from 'lucide-react';
import { CustomerWithFullName, CreateCustomerData } from '../types/customer';
import { customerService } from '../services/customerService';
import CustomerView from '../components/customers/CustomerView';
import DeleteConfirmDialog from '../components/customers/DeleteConfirmDialog';
import CustomerList from '../components/customers/CustomerList';
import Pagination from '../components/ingredientCategories/Pagination';
import SearchFilter from '../components/ingredientCategories/SearchFilter';
import { useErrorHandler } from '../hooks/useErrorHandler';

type SortField = 'customer_id' | 'full_name' | 'customer_email' | 'customer_phone' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const { handleError, logUserAction } = useErrorHandler();
  const [customers, setCustomers] = useState<CustomerWithFullName[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithFullName[]>([]);
  const [sortedCustomers, setSortedCustomers] = useState<CustomerWithFullName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerWithFullName | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithFullName | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter and sort customers based on search term and sort criteria
  useEffect(() => {
    let filtered: CustomerWithFullName[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = customers;
    } else {
      filtered = customers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_colonia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_delegacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCustomers(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortCustomers(sorted, sortField, sortDirection);
    }
    
    setSortedCustomers(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [customers, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortCustomers = (
    customersToSort: CustomerWithFullName[], 
    field: SortField, 
    direction: SortDirection
  ): CustomerWithFullName[] => {
    if (!direction) return customersToSort;

    return [...customersToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'customer_id':
          // Numeric comparison for IDs (extract number from CL1, CL2, etc.)
          const aNum = parseInt(aValue.replace('CL', '')) || 0;
          const bNum = parseInt(bValue.replace('CL', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'full_name':
        case 'customer_email':
        case 'customer_phone':
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

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getCustomers();
      setCustomers(data);
      logUserAction('customers_loaded', { count: data.length });
    } catch (err) {
      handleError(err as Error, { operation: 'loadCustomers' });
      setError('Error al cargar los clientes');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = sortedCustomers.slice(startIndex, endIndex);

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

  const handleAddCustomer = () => {
    logUserAction('navigate_to_add_customer');
    navigate('/clientes/nuevo');
  };

  const handleViewCustomer = (customer: CustomerWithFullName) => {
    logUserAction('view_customer', { customerId: customer.customer_id });
    setViewingCustomer(customer);
    setIsViewOpen(true);
  };

  const handleEditCustomer = (customer: CustomerWithFullName) => {
    logUserAction('navigate_to_edit_customer', { customerId: customer.customer_id });
    navigate(`/clientes/editar/${customer.id}`);
  };

  const handleDeleteCustomer = (customer: CustomerWithFullName) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      setOperationLoading(true);
      await customerService.deleteCustomer(customerToDelete.id);
      await loadCustomers(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Error al eliminar el cliente');
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
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra perfiles de clientes y su información de contacto
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
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
                onClick={handleAddCustomer}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Cliente Nuevo</span>
              </button>
              
              <div className="w-full sm:w-80">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar por nombre, email, teléfono..."
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
                    {totalItems !== customers.length && ` de ${customers.length} clientes`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} cliente${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando clientes...</span>
            </div>
          ) : (
            <>
              {/* Customer List */}
              <CustomerList
                customers={currentCustomers}
                onView={handleViewCustomer}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {customers.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    ¡Comienza agregando tu primer cliente!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crea perfiles de clientes para gestionar sus pedidos y preferencias alimentarias
                  </p>
                  <button
                    onClick={handleAddCustomer}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primer Cliente</span>
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

      {/* Customer View Modal */}
      <CustomerView
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingCustomer(null);
        }}
        customer={viewingCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        customer={customerToDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default Clientes;