import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';

export function Layout({ children }) {
  const { sidebarOpen, mobileNavOpen, closeMobileNav } = useUI();
  const location = useLocation();

  // Cierra el drawer móvil automáticamente al cambiar de ruta
  useEffect(() => {
    closeMobileNav();
  }, [location.pathname, closeMobileNav]);

  // Bloquea el scroll del fondo mientras el drawer móvil está abierto
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <div className="app-layout">
      <Sidebar />
      {/* Backdrop del drawer móvil: solo visible en ≤768px vía CSS.
          Es clicable y aria-hidden (decorativo); el cierre también es
          accesible desde el botón hamburguesa del header. */}
      {mobileNavOpen && (
        <div
          className="sidebar-backdrop"
          aria-hidden="true"
          onClick={closeMobileNav}
        />
      )}
      <div className={`app-main ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <OfflineBanner />
        <main className="app-content compact">
          {children}
        </main>
      </div>
    </div>
  );
}
