import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const value = useMemo(() => ({
    sidebarOpen, setSidebarOpen, toggleSidebar, closeSidebar,
    globalLoading, setGlobalLoading,
  }), [sidebarOpen, globalLoading, toggleSidebar, closeSidebar]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
