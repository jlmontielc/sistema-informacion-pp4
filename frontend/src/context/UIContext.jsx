import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  // Drawer de navegación móvil (≤768px): el sidebar actúa como menú deslizable
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen(prev => !prev);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const value = useMemo(() => ({
    sidebarOpen, setSidebarOpen, toggleSidebar, closeSidebar,
    mobileNavOpen, toggleMobileNav, closeMobileNav,
    globalLoading, setGlobalLoading,
  }), [sidebarOpen, globalLoading, toggleSidebar, closeSidebar, mobileNavOpen, toggleMobileNav, closeMobileNav]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
