import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LazyLoadingSpinner from './components/common/LazyLoadingSpinner';

// Eagerly loaded components (frequently accessed)
import LandingPage from './pages/LandingPage';
import Clientes from './pages/Clientes';
import Menus from './pages/Menus';
import CustomerForm from './pages/customers/CustomerForm';

// Lazy loaded components (less frequently accessed or under construction)
const Pedidos = React.lazy(() => import('./pages/Pedidos'));
const Cocina = React.lazy(() => import('./pages/Cocina'));
const Envios = React.lazy(() => import('./pages/Envios'));
const Semana = React.lazy(() => import('./pages/Semana'));
const Planes = React.lazy(() => import('./pages/Planes'));
const Estadisticas = React.lazy(() => import('./pages/Estadisticas'));
const Contabilidad = React.lazy(() => import('./pages/Contabilidad'));
const Admin = React.lazy(() => import('./pages/Admin'));
const NuevoPedido = React.lazy(() => import('./pages/NuevoPedido'));

// Menu-related lazy loaded components
const Ingredientes = React.lazy(() => import('./pages/menus/Ingredientes'));
const Recetas = React.lazy(() => import('./pages/menus/Recetas'));
const MenuSemanal = React.lazy(() => import('./pages/menus/MenuSemanal'));
const Contenedores = React.lazy(() => import('./pages/menus/Contenedores'));
const Procesos = React.lazy(() => import('./pages/menus/Procesos'));
const WeeklyMenuForm = React.lazy(() => import('./pages/menus/weeklyMenus/WeeklyMenuForm'));
const WeeklyMenuView = React.lazy(() => import('./pages/menus/weeklyMenus/WeeklyMenuView'));
const ListaIngredientes = React.lazy(() => import('./pages/menus/ingredientes/ListaIngredientes'));
const CategoriasIngredientes = React.lazy(() => import('./pages/menus/ingredientes/CategoriasIngredientes'));
const Proveedores = React.lazy(() => import('./pages/menus/ingredientes/Proveedores'));
const IngredientForm = React.lazy(() => import('./pages/menus/ingredientes/IngredientForm'));
const RecipeForm = React.lazy(() => import('./pages/menus/recetas/RecipeForm'));
const RecipeView = React.lazy(() => import('./pages/menus/recetas/RecipeView'));

// Product-related lazy loaded components
const PlanesAlimenticios = React.lazy(() => import('./pages/productos/PlanesAlimenticios'));
const EnviosProductos = React.lazy(() => import('./pages/productos/EnviosProductos'));
const Proteinas = React.lazy(() => import('./pages/productos/Proteinas'));
const Impuestos = React.lazy(() => import('./pages/productos/Impuestos'));
const Descuentos = React.lazy(() => import('./pages/productos/Descuentos'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Eagerly loaded routes */}
              <Route index element={<LandingPage />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="clientes/nuevo" element={<CustomerForm />} />
              <Route path="clientes/editar/:id" element={<CustomerForm />} />
              <Route path="menus" element={<Menus />} />

              {/* Lazy loaded routes with Suspense */}
              <Route path="pedidos" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando gestión de pedidos..." />}>
                  <Pedidos />
                </Suspense>
              } />
              <Route path="pedidos/nuevo" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando formulario de pedido..." />}>
                  <NuevoPedido />
                </Suspense>
              } />
              <Route path="menus/ingredientes" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando gestión de ingredientes..." />}>
                  <Ingredientes />
                </Suspense>
              } />
              <Route path="menus/ingredientes/lista" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando lista de ingredientes..." />}>
                  <ListaIngredientes />
                </Suspense>
              } />
              <Route path="menus/ingredientes/categorias" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando categorías..." />}>
                  <CategoriasIngredientes />
                </Suspense>
              } />
              <Route path="menus/ingredientes/proveedores" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando proveedores..." />}>
                  <Proveedores />
                </Suspense>
              } />
              <Route path="menus/ingredientes/lista/nuevo" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando formulario de ingrediente..." />}>
                  <IngredientForm />
                </Suspense>
              } />
              <Route path="menus/ingredientes/lista/editar/:id" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando formulario de ingrediente..." />}>
                  <IngredientForm />
                </Suspense>
              } />
              <Route path="menus/recetas" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando gestión de recetas..." />}>
                  <Recetas />
                </Suspense>
              } />
              <Route path="menus/recetas/nueva" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando formulario de receta..." />}>
                  <RecipeForm />
                </Suspense>
              } />
              <Route path="menus/recetas/editar/:id" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando formulario de receta..." />}>
                  <RecipeForm />
                </Suspense>
              } />
              <Route path="menus/recetas/ver/:id" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando detalles de receta..." />}>
                  <RecipeView />
                </Suspense>
              } />
              <Route path="menus/menu-semanal" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando menús semanales..." />}>
                  <MenuSemanal />
                </Suspense>
              } />
              <Route path="menus/menu-semanal/nuevo" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando formulario de menú..." />}>
                  <WeeklyMenuForm />
                </Suspense>
              } />
              <Route path="menus/menu-semanal/editar/:id" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando formulario de menú..." />}>
                  <WeeklyMenuForm />
                </Suspense>
              } />
              <Route path="menus/menu-semanal/ver/:id" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando detalles de menú..." />}>
                  <WeeklyMenuView />
                </Suspense>
              } />
              <Route path="menus/contenedores" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando contenedores..." />}>
                  <Contenedores />
                </Suspense>
              } />
              <Route path="menus/procesos" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando procesos..." />}>
                  <Procesos />
                </Suspense>
              } />
              <Route path="cocina" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando operaciones de cocina..." />}>
                  <Cocina />
                </Suspense>
              } />
              <Route path="envios" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando control de envíos..." />}>
                  <Envios />
                </Suspense>
              } />
              <Route path="semana" element={
                <Semana />
              } />
              <Route path="planes" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando productos..." />}>
                  <Planes />
                </Suspense>
              } />
              <Route path="productos/planes-alimenticios" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando planes alimenticios..." />}>
                  <PlanesAlimenticios />
                </Suspense>
              } />
              <Route path="productos/envios" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando opciones de envío..." />}>
                  <EnviosProductos />
                </Suspense>
              } />
              <Route path="productos/proteinas" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando planes de proteína..." />}>
                  <Proteinas />
                </Suspense>
              } />
              <Route path="productos/impuestos" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando gestión de impuestos..." />}>
                  <Impuestos />
                </Suspense>
              } />
              <Route path="productos/descuentos" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando gestión de descuentos..." />}>
                  <Descuentos />
                </Suspense>
              } />
              <Route path="estadisticas" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando analytics y reportes..." />}>
                  <Estadisticas />
                </Suspense>
              } />
              <Route path="contabilidad" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando gestión financiera..." />}>
                  <Contabilidad />
                </Suspense>
              } />
              <Route path="admin" element={
                <Suspense fallback={<LazyLoadingSpinner message="Cargando panel de administración..." />}>
                  <Admin />
                </Suspense>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;