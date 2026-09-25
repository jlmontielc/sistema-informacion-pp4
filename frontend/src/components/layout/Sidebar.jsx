import { NavLink } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { getSidebarItems, APP_SHORT_NAME } from '../../utils/constants';
import { Icon } from '../common/Icon';

// Relación entre la clave de icono de cada ítem (constants.js) y el nombre
// del SVG dentro del componente Icon. Todo en SVG, sin emojis.
const iconMap = {
  dashboard: 'dashboard',
  clientes: 'users',
  entrenador: 'teacher',
  metabolismo: 'bolt',
  entrenamiento: 'dumbbell',
  dietas: 'apple',
  reportes: 'chartline',
  planes: 'creditcard',
  miplan: 'receipt',
  perfil: 'user',
};

export function Sidebar() {
  const { sidebarOpen } = useUI();
  const { user } = useAuth();
  const items = getSidebarItems(user);

  return (
    <aside
      className={`app-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}
      aria-label="Navegación lateral"
    >
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">
          <Icon name="dumbbell" size={24} />
        </span>
        <span className="sidebar-brand-name">{APP_SHORT_NAME}</span>
      </div>

      <nav className="sidebar-nav" aria-label="Secciones principales">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
            // En escritorio colapsado (solo iconos) el título aporta contexto;
            // en extendido es redundante con la etiqueta visible.
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="sidebar-nav-icon">
              <Icon name={iconMap[item.icon] || 'dashboard'} size={20} />
            </span>
            <span className="sidebar-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
