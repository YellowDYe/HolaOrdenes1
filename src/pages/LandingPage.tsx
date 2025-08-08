import React from 'react';
import { Users, ShoppingCart, DollarSign, Plus, UserPlus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Define variables for the graph section
  const maxOrders = 500;
  const minOrders = 0;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Essential Metrics Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Total Orders */}
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">
                Total de Pedidos
              </h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-poppins">
                1,247
              </p>
            </div>

            {/* Active Customers */}
            <div className="text-center">
              <div className="bg-secondary-100 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">
                Clientes Activos
              </h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-poppins">
                342
              </p>
            </div>

            {/* Total Revenue */}
            <div className="text-center">
              <div className="bg-success-100 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-success-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">
                Ingresos Totales
              </h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-poppins">
                $89,432
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* New Order Card */}
          <div 
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            onClick={() => navigate('/pedidos/nuevo')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="bg-primary-500 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Plus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-poppins mb-1 sm:mb-2">
                  New Order
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Create a new customer order
                </p>
              </div>
              <div className="bg-gray-100 hover:bg-primary-500 hover:text-white p-2 sm:p-3 rounded-full transition-all duration-300 mt-4 sm:mt-0 sm:ml-4 self-end sm:self-start">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* New Customer Card */}
          <div 
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            onClick={() => navigate('/clientes/nuevo')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="bg-secondary-500 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-poppins mb-1 sm:mb-2">
                  New Customer
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Add a new customer profile
                </p>
              </div>
              <div className="bg-gray-100 hover:bg-secondary-500 hover:text-white p-2 sm:p-3 rounded-full transition-all duration-300 mt-4 sm:mt-0 sm:ml-4 self-end sm:self-start">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;