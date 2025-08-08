import React, { useState } from 'react';
import { Search, Bell, Filter, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items for mobile menu
  const navigationItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Pedidos', path: '/pedidos' },
    { label: 'Clientes', path: '/clientes' },
    { label: 'Recetas y Menús', path: '/menus' },
    { label: 'Cocina', path: '/cocina' },
    { label: 'Envíos', path: '/envios' },
    { label: 'Semana', path: '/semana' },
    { label: 'Productos', path: '/planes' },
    { label: 'Estadísticas', path: '/estadisticas' },
    { label: 'Contabilidad', path: '/contabilidad' },
    { label: 'Admin', path: '/admin' },
  ];

  return (
    <>
      {/* Full-width header */}
      <header className="bg-gray-900 text-white shadow-lg w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="bg-secondary-400 p-2 rounded-xl">
                <span className="text-gray-900 font-bold text-xl">HD</span>
              </div>
              <h1 className="text-xl font-bold font-poppins hidden sm:block">Hola Dieta</h1>
            </div>

            {/* Desktop Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-gray-800 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Desktop Right Side - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Filter Button */}
              <button 
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Filter"
              >
                <Filter className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button 
                className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">{user?.name || 'Usuario'}</p>
                  <p className="text-sm text-gray-400">{user?.role || 'admin'}</p>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Right Side */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Mobile Notifications */}
              <button 
                className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  3
                </span>
              </button>

              {/* Mobile User Avatar */}
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Shown below main header on mobile */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-gray-800 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Menu */}
      <nav
        className={`fixed top-0 right-0 h-full w-80 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        {/* Mobile Menu Header */}
        <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-secondary-400 p-2 rounded-xl">
              <span className="text-gray-900 font-bold text-lg">HD</span>
            </div>
            <div>
              <h2 className="font-bold font-poppins">Hola Dieta</h2>
              <p className="text-sm text-gray-300">{user?.name || 'Usuario'}</p>
            </div>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu Items */}
        <div className="py-6 px-4 space-y-2 max-h-full overflow-y-auto">
          {navigationItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {/* Mobile Menu Footer Actions */}
          <div className="pt-6 mt-6 border-t border-gray-200 space-y-2">
            <button
              className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 mr-3" />
              Configuración
            </button>
            <button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;