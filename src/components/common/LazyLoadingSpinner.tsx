import React from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadingSpinnerProps {
  message?: string;
}

const LazyLoadingSpinner: React.FC<LazyLoadingSpinnerProps> = ({ 
  message = "Cargando..." 
}) => {
  return (
    <div className="min-h-full bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LazyLoadingSpinner;