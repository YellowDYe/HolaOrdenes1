import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Users, 
  UtensilsCrossed, 
  ChefHat, 
  Truck, 
  Calendar, 
  CreditCard,
  BarChart3,
  Calculator,
  Shield
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: Home },
  { id: 'pedidos', label: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
  { id: 'clientes', label: 'Clientes', path: '/clientes', icon: Users },
  { id: 'menus', label: 'Recetas y Menús', path: '/menus', icon: UtensilsCrossed },
  { id: 'cocina', label: 'Cocina', path: '/cocina', icon: ChefHat },
  { id: 'envios', label: 'Envíos', path: '/envios', icon: Truck },
  { id: 'semana', label: 'Semana', path: '/semana', icon: Calendar },
  { id: 'planes', label: 'Productos', path: '/planes', icon: CreditCard },
  { id: 'estadisticas', label: 'Estadísticas', path: '/estadisticas', icon: BarChart3 },
  { id: 'contabilidad', label: 'Contabilidad', path: '/contabilidad', icon: Calculator },
  { id: 'admin', label: 'Admin', path: '/admin', icon: Shield },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="bg-white w-64 h-screen shadow-lg border-r border-gray-200">
      <nav className="p-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600 hover:transform hover:scale-102'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;