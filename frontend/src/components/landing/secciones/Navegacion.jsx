import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { Icono } from '../Icono';

export function Navegacion() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const esOscuro = theme === 'dark';
  const etiquetaTema = esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

  return (
    <header className="landing-navegacion">
      <button
        type="button"
        className="landing-navegacion-logo"
        onClick={() => navigate('/')}
      >
        <span className="landing-navegacion-logo-marca" aria-hidden="true">
          <Icono name="dumbbell" size={34} />
        </span>
        <span className="landing-navegacion-logo-texto">YanTraining</span>
      </button>

      <nav className="landing-navegacion-links" aria-label="Navegación principal">
        <button
          type="button"
          className="landing-navegacion-link"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Inicio
        </button>
      </nav>

      <div className="landing-navegacion-acciones">
        {isAuthenticated ? (
          <button
            type="button"
            className="landing-boton landing-boton-acento landing-navegacion-boton"
            onClick={() => navigate('/dashboard')}
          >
Ir al panel
          </button>
        ) : (
          <>
            <button
              type="button"
              className="landing-boton landing-boton-contorno landing-navegacion-boton"
              onClick={() => navigate('/register')}
            >
              Registrarse
            </button>
            <button
              type="button"
              className="landing-boton landing-boton-acento landing-navegacion-boton"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </button>
          </>
        )}

        <button
          type="button"
          className="landing-navegacion-movil"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          aria-label={isAuthenticated ? 'Ir al panel' : 'Iniciar sesión'}
        >
          <Icono name="users" size={20} />
        </button>

        <button
          type="button"
          className="landing-navegacion-tema"
          onClick={toggleTheme}
          aria-label={etiquetaTema}
          title={etiquetaTema}
        >
          <Icono name={esOscuro ? 'sun' : 'moon'} size={20} />
        </button>
      </div>
    </header>
  );
}
