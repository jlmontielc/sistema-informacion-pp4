import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { toggleSidebar } = useUI();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <button className="btn btn-ghost btn-md" onClick={toggleSidebar} aria-label="Menú">
        ☰
      </button>

      <div style={{ flex: 1 }} />

      <button
        className="btn btn-ghost btn-md"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <button
        className="btn btn-ghost btn-md"
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        style={{ marginLeft: 'var(--space-2)' }}
      >
        🚪
      </button>
    </header>
  );
}
