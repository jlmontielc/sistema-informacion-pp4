import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import { Layout } from './components/layout/Layout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClientesPage = lazy(() => import('./pages/ClientesPage'));
const MetabolismoPage = lazy(() => import('./pages/MetabolismoPage'));
const EntrenamientoPage = lazy(() => import('./pages/EntrenamientoPage'));
const DietasPage = lazy(() => import('./pages/DietasPage'));
const ReportesPage = lazy(() => import('./pages/ReportesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading text="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading text="Cargando..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <BrowserRouter>
      <UIProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<Loading text="Cargando..." />}>
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Suspense fallback={<Loading text="Cargando..." />}>
                  <LoginPage />
                </Suspense>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Suspense fallback={<Loading text="Cargando..." />}>
                  <RegisterPage />
                </Suspense>
              </PublicRoute>
            }
          />
          <Route
            path="/offline"
            element={
              <Suspense fallback={<Loading text="Cargando..." />}>
                <OfflinePage />
              </Suspense>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <Suspense fallback={<Loading text="Cargando sección..." />}>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/clientes" element={<ClientesPage />} />
                        <Route path="/metabolismo" element={<MetabolismoPage />} />
                        <Route path="/entrenamiento" element={<EntrenamientoPage />} />
                        <Route path="/dietas" element={<DietasPage />} />
                        <Route path="/reportes" element={<ReportesPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
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
