import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { WeeklyMenu, CreateWeeklyMenuData } from '../../types/weeklyMenu';
import { weeklyMenuService } from '../../services/weeklyMenuService';
import WeeklyMenuList from '../../components/weeklyMenus/WeeklyMenuList';
import DeleteConfirmDialog from '../../components/weeklyMenus/DeleteConfirmDialog';
import Pagination from '../../components/ingredientCategories/Pagination';
import SearchFilter from '../../components/ingredientCategories/SearchFilter';

type SortField = 'menu_id' | 'menu_name' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const MenuSemanal: React.FC = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<WeeklyMenu[]>([]);
  const [sortedMenus, setSortedMenus] = useState<WeeklyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<WeeklyMenu | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load menus on component mount
  useEffect(() => {
    loadMenus();
  }, []);

  // Filter and sort menus based on search term and sort criteria
  useEffect(() => {
    let filtered: WeeklyMenu[];
    
    // Apply search filter
    if (!searchTerm.trim()) {
      filtered = menus;
    } else {
      filtered = menus.filter(menu =>
        menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.menu_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMenus(filtered);
    
    // Apply sorting
    let sorted = [...filtered];
    if (sortField && sortDirection) {
      sorted = sortMenus(sorted, sortField, sortDirection);
    }
    
    setSortedMenus(sorted);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [menus, searchTerm, sortField, sortDirection]);

  // Sorting function that handles different data types
  const sortMenus = (
    menusToSort: WeeklyMenu[], 
    field: SortField, 
    direction: SortDirection
  ): WeeklyMenu[] => {
    if (!direction) return menusToSort;

    return [...menusToSort].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      switch (field) {
        case 'created_at':
          // Date comparison
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'menu_id':
          // Numeric comparison for IDs (extract number from M1, M2, etc.)
          const aNum = parseInt(aValue.replace('M', '')) || 0;
          const bNum = parseInt(bValue.replace('M', '')) || 0;
          aValue = aNum;
          bValue = bNum;
          break;
        case 'menu_name':
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

  const loadMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weeklyMenuService.getWeeklyMenus();
      setMenus(data);
    } catch (err) {
      setError('Error al cargar los menús semanales');
      console.error('Error loading weekly menus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalItems = sortedMenus.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMenus = sortedMenus.slice(startIndex, endIndex);

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

  const handleAddMenu = () => {
    navigate('/menus/menu-semanal/nuevo');
  };

  const handleViewMenu = (menu: WeeklyMenu) => {
    navigate(`/menus/menu-semanal/ver/${menu.id}`);
  };

  const handleEditMenu = (menu: WeeklyMenu) => {
    navigate(`/menus/menu-semanal/editar/${menu.id}`);
  };

  const handleDeleteMenu = (menu: WeeklyMenu) => {
    setMenuToDelete(menu);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!menuToDelete) return;

    try {
      setOperationLoading(true);
      await weeklyMenuService.deleteWeeklyMenu(menuToDelete.id);
      await loadMenus(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setMenuToDelete(null);
    } catch (err) {
      console.error('Error deleting weekly menu:', err);
      setError('Error al eliminar el menú semanal');
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
                Menús Semanales
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Planifica y organiza los menús para cada semana
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
                onClick={handleAddMenu}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Menú Semanal</span>
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
                    {totalItems !== menus.length && ` de ${menus.length} menús`}
                    {searchTerm && (
                      <span className="ml-1">
                        para "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  `Total: ${totalItems} menú${totalItems !== 1 ? 's' : ''}`
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
              <span className="ml-2 text-gray-600">Cargando menús semanales...</span>
            </div>
          ) : (
            <>
              {/* Menu List */}
              <WeeklyMenuList
                menus={currentMenus}
                onView={handleViewMenu}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                loading={loading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* No Results State */}
              {menus.length === 0 && !searchTerm && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    ¡Comienza creando tu primer menú semanal!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Organiza las comidas de la semana seleccionando recetas para cada día
                  </p>
                  <button
                    onClick={handleAddMenu}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Crear Primer Menú</span>
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMenuToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        menu={menuToDelete}
        loading={operationLoading}
      />
    </div>
  );
};
export { MenuSemanal as default };