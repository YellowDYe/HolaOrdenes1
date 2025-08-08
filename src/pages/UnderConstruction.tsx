import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnderConstructionProps {
  pageName: string;
  description?: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ pageName, description }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 bg-secondary-100 rounded-full flex items-center justify-center">
            <Construction className="h-12 w-12 text-secondary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 font-poppins">
            {pageName}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {description || 'Esta página está en construcción'}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Próximamente Disponible
          </h3>
          <p className="text-gray-600 mb-6">
            Estamos trabajando duro para traerte esta funcionalidad. 
            Mantente atento a las actualizaciones.
          </p>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;