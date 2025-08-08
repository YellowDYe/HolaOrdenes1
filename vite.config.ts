import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'firebase-vendor': ['firebase'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Feature chunks
          'menu-management': [
            './src/pages/menus/Ingredientes',
            './src/pages/menus/Recetas',
            './src/pages/menus/MenuSemanal',
            './src/pages/menus/Contenedores',
            './src/pages/menus/Procesos'
          ],
          'customer-management': [
            './src/pages/customers/CustomerForm',
            './src/components/customers/CustomerList',
            './src/components/customers/CustomerView'
          ],
          'product-management': [
            './src/pages/productos/PlanesAlimenticios',
            './src/pages/productos/EnviosProductos',
            './src/pages/productos/Proteinas'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [],
    exclude: ['lucide-react', 'firebase', 'firebase/app', 'firebase/auth'],
  },
});
