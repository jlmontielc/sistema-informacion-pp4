import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export function LlamadaAccion() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="landing-seccion landing-llamada">
      <div className="landing-llamada-contenedor">
        <h2 className="landing-llamada-titulo">¿Listo para empezar tu transformación?</h2>
        <p className="landing-llamada-bajada">
          Regístrate gratis y comienza a entrenar con planes personalizados impulsados por
          inteligencia artificial.
        </p>

        <div className="landing-llamada-acciones">
          {isAuthenticated ? (
            <button
              type="button"
              className="landing-boton landing-boton-claro landing-boton-grande"
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                className="landing-boton landing-boton-claro landing-boton-grande"
                onClick={() => navigate('/register')}
              >
                Crear Cuenta Gratis
              </button>
              <button
                type="button"
                className="landing-boton landing-boton-contorno-claro landing-boton-grande"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
