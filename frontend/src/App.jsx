import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import { Layout } from './components/layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClientesPage = lazy(() => import('./pages/ClientesPage'));
const MetabolismoPage = lazy(() => import('./pages/MetabolismoPage'));
const EntrenamientoPage = lazy(() => import('./pages/EntrenamientoPage'));
const DietasPage = lazy(() => import('./pages/DietasPage'));
const ReportesPage = lazy(() => import('./pages/ReportesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));

function AppContent() {
  return (
    <BrowserRouter>
      <UIProvider>
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<Loading text="Cargando sección..." />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/metabolismo" element={<MetabolismoPage />} />
                <Route path="/entrenamiento" element={<EntrenamientoPage />} />
                <Route path="/dietas" element={<DietasPage />} />
                <Route path="/reportes" element={<ReportesPage />} />
                <Route path="/offline" element={<OfflinePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </UIProvider>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
