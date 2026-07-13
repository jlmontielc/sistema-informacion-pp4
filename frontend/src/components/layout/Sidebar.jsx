import { NavLink } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { SIDEBAR_ITEMS, APP_SHORT_NAME } from '../../utils/constants';

const iconMap = {
  dashboard: '📊',
  clientes: '👥',
  metabolismo: '⚡',
  entrenamiento: '🏋️',
  dietas: '🥗',
  reportes: '📈',
};

export function Sidebar() {
  const { sidebarOpen } = useUI();

  return (
    <aside className={`app-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        minHeight: 'var(--header-height)',
      }}>
        <span style={{ fontSize: 24 }}>🏋️</span>
        {sidebarOpen && (
          <span style={{
            color: 'var(--color-text-sidebar-active)',
            fontWeight: 'var(--font-bold)',
            fontSize: 'var(--text-lg)',
            whiteSpace: 'nowrap',
          }}>
            {APP_SHORT_NAME}
          </span>
        )}
      </div>

      <nav style={{ padding: 'var(--space-3)' }}>
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--color-text-sidebar-active)' : 'var(--color-text-sidebar)',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
              marginBottom: 2,
              transition: 'all var(--transition-fast)',
            })}
          >
            <span style={{ fontSize: 20, width: 24, textAlign: 'center' }}>
              {iconMap[item.icon]}
            </span>
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
