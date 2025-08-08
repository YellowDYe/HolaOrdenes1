import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ChefHat, 
  Calendar, 
  Container, 
  Settings,
  ArrowRight 
} from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, icon: Icon, path, color }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
      onClick={() => navigate(path)}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
        <div className="flex-1">
          <div className={`${color} w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-poppins mb-2 sm:mb-3">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="bg-gray-100 hover:bg-primary-500 hover:text-white p-2 sm:p-3 rounded-full transition-all duration-300 mt-4 sm:mt-0 sm:ml-4 self-end sm:self-start">
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};

const Menus: React.FC = () => {
  const modules = [
    {
      title: 'Ingredientes',
      description: 'Gestiona el inventario y catálogo de ingredientes disponibles',
      icon: Package,
      path: '/menus/ingredientes',
      color: 'bg-primary-500'
    },
    {
      title: 'Recetas',
      description: 'Crea y administra recetas con instrucciones detalladas',
      icon: ChefHat,
      path: '/menus/recetas',
      color: 'bg-secondary-500'
    },
    {
      title: 'Menú Semanal',
      description: 'Planifica y organiza los menús para cada semana',
      icon: Calendar,
      path: '/menus/menu-semanal',
      color: 'bg-accent-500'
    },
    {
      title: 'Contenedores',
      description: 'Administra tipos y tamaños de contenedores disponibles',
      icon: Container,
      path: '/menus/contenedores',
      color: 'bg-success-500'
    },
    {
      title: 'Procesos',
      description: 'Define y gestiona procesos de preparación y cocina',
      icon: Settings,
      path: '/menus/procesos',
      color: 'bg-dark-600'
    }
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins">
            Recetas y Menús
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Gestiona todos los aspectos de tu cocina y planificación de menús
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {modules.map((module, index) => (
            <ModuleCard
              key={index}
              title={module.title}
              description={module.description}
              icon={module.icon}
              path={module.path}
              color={module.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menus;