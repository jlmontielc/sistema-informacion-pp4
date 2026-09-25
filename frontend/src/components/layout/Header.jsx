import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Icon } from '../common/Icon';
import { getTituloRuta } from '../../utils/constants';

// Punto de corte móvil: debe coincidir con la media query de layout.css
const QUERY_MOVIL = '(max-width: 768px)';

export function Header() {
  const { toggleSidebar, toggleMobileNav, mobileNavOpen } = useUI();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // En móvil (≤768px) el botón hamburguesa abre el drawer; en escritorio
  // colapsa/expande el sidebar fijo.
  const esMovil = useMediaQuery(QUERY_MOVIL);
  const titulo = getTituloRuta(location.pathname);

  const alternarMenu = () => (esMovil ? toggleMobileNav() : toggleSidebar());

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <button
        className="header-button"
        onClick={alternarMenu}
        aria-label={esMovil ? 'Abrir menú de navegación' : 'Alternar menú lateral'}
        title="Menú"
        // Estado del drawer solo aplica en móvil; en escritorio el sidebar
        // colapsable no se comunica con aria-expanded.
        aria-expanded={esMovil ? mobileNavOpen : undefined}
      >
        <Icon name="menu" size={22} />
      </button>

      {/* Título de la sección actual, alineado a la izquierda. Se trunca con
          elipsis y se oculta solo en pantallas muy angostas (≤360px) para
          no competir por espacio con los botones de acción. */}
      <span className="header-title">{titulo}</span>

      <div className="header-spacer" />

      <div className="header-actions">
        <button
          className="header-button"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={20} />
        </button>

        <button
          className="header-button"
          onClick={() => navigate('/perfil')}
          aria-label="Ir a mi perfil"
          title="Mi perfil"
        >
          <Icon name="user" size={20} />
        </button>

        <button
          className="header-button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <Icon name="logout" size={20} />
        </button>
      </div>
    </header>
  );
}
