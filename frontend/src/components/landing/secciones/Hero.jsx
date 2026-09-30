import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="landing-hero">
      <div className="landing-hero-fondo" aria-hidden="true" />
      <div className="landing-hero-velo" />

      <div className="landing-hero-contenido">
        <h1 className="landing-hero-titulo">Empieza tu entrenamiento ahora</h1>
        <p className="landing-hero-bajada">
          Transforma tu disciplina en resultados reales con rutinas guiadas, asesoría
          profesional y un plan adaptado a tu estilo de vida.
        </p>
        <button
          type="button"
          className="landing-boton landing-boton-primario landing-boton-grande"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
        >
          {isAuthenticated ? 'Ir al Dashboard' : 'Comenzar Gratis'}
        </button>
      </div>
    </section>
  );
}
