import React from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '../../utils/performance';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  loading?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar categorías...",
  loading = false
}) => {
  // Debounce search to improve performance
  const debouncedSearch = React.useMemo(
    () => debounce((term: string) => onSearchChange(term), 300),
    [onSearchChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          defaultValue={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={loading}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            disabled={loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;