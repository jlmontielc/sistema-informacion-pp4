import { useUI } from '../../context/UIContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';

export function Layout({ children }) {
  const { sidebarOpen } = useUI();

  return (
    <div className="app-layout">
      <Sidebar />
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
