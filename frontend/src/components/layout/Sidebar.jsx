import { NavLink, useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
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

// Calcula las iniciales del usuario (dos letras, mayúsculas) a partir del
// nombre: "Yan Rodríguez" -> "YR". Devuelve '' si no hay nombre usable.
function calcularIniciales(nombre) {
  if (!nombre || typeof nombre !== 'string') return '';
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

export function Sidebar() {
  const { sidebarOpen, mobileNavOpen } = useUI();
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = getSidebarItems(user);
  const iniciales = calcularIniciales(user?.nombre);

  // Debe coincidir con la media query del drawer en layout.css (≤768px)
  const esMovil = useMediaQuery('(max-width: 768px)');

  return (
    <aside
      className={[
        'app-sidebar',
        !sidebarOpen && !esMovil ? 'collapsed' : '',
        esMovil && mobileNavOpen ? 'mobile-open' : '',
      ].filter(Boolean).join(' ')}
      aria-label="Navegación lateral"
    >

      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">
          <Icon name="dumbbell" size={24} />
        </span>
        <span className="sidebar-brand-texto">
          <span className="sidebar-brand-name">{APP_SHORT_NAME}</span>
          {/* Punto de estado decorativo bajo el nombre de la marca */}
          <span className="sidebar-status-dot" aria-hidden="true" />
        </span>
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

      {/* Tarjeta de usuario fija al pie del sidebar (empujada con margin-top:auto).
          En el sidebar colapsado solo se muestra el avatar centrado. */}
      <div className="sidebar-usuario">
        <span className="sidebar-usuario-avatar" aria-hidden="true">
          {iniciales}
        </span>
        <div className="sidebar-usuario-texto">
          <span className="sidebar-usuario-nombre">{user?.nombre || 'Usuario'}</span>
          {user?.email && <span className="sidebar-usuario-email">{user.email}</span>}
        </div>
        <button
          type="button"
          className="sidebar-usuario-boton"
          onClick={() => navigate('/perfil')}
          aria-label="Ir a mi perfil"
          title="Mi perfil"
        >
          <Icon name="settings" size={16} />
        </button>
      </div>
    </aside>
  );
}
