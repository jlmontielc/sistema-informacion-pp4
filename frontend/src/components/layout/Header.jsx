import { useUI } from '../../context/UIContext';
import { useTheme } from '../../context/ThemeContext';

export function Header() {
  const { toggleSidebar } = useUI();
  const { theme, toggleTheme } = useTheme();

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
    </header>
  );
}
