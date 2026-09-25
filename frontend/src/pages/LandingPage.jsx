import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Carousel } from '../components/common/Carousel';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { APP_NAME } from '../utils/constants';

const planes = [
  { nombre: 'Principiante', descripcion: 'Rutinas básicas para quienes inician su camino fitness. 3 días por semana.', icon: 'target', color: '#22c55e' },
  { nombre: 'Intermedio', descripcion: 'Entrenamiento dividido por grupos musculares. 4-5 días por semana.', icon: 'heart', color: '#3b82f6' },
  { nombre: 'Avanzado', descripcion: 'Programa intensivo con técnicas avanzadas. 6 días por semana.', icon: 'dumbbell', color: '#f59e0b' },
];

const dietas = [
  { nombre: 'Volumen', descripcion: 'Dieta hipercalórica para ganar masa muscular con alimentos naturales.', icon: 'apple', color: '#ef4444' },
  { nombre: 'Definición', descripcion: 'Plan hipocalórico para reducir grasa manteniendo el músculo.', icon: 'food', color: '#8b5cf6' },
  { nombre: 'Mantenimiento', descripcion: 'Alimentación balanceada para mantener el peso y la salud general.', icon: 'heart', color: '#06b6d4' },
];

const features = [
  { icon: 'chart', titulo: 'Seguimiento', descripcion: 'Monitorea tu progreso con estadísticas detalladas' },
  { icon: 'users', titulo: 'Personalizado', descripcion: 'Planes adaptados a tus necesidades y objetivos' },
  { icon: 'target', titulo: 'Metas claras', descripcion: 'Define y alcanza tus metas con un plan estructurado' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <span className="landing-logo-icono landing-gradiente">
              <Icon name="dumbbell" size={20} color="white" />
            </span>
            {APP_NAME}
          </div>
          <nav className="landing-nav">
            <button type="button" onClick={() => scrollTo('planes')} className="landing-nav-enlace hide-mobile">Planes</button>
            <button type="button" onClick={() => scrollTo('dietas')} className="landing-nav-enlace hide-mobile">Dietas</button>
            <button type="button" onClick={() => scrollTo('galeria')} className="landing-nav-enlace hide-mobile">Galería</button>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>Ir al Dashboard</Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>Iniciar Sesión</Button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-chip landing-gradiente">
            Transforma tu cuerpo, transforma tu vida
          </div>
          <h1 className="landing-hero-titulo">
            Tu entrenador personal{' '}
            <span className="landing-texto-gradiente">inteligente</span>
          </h1>
          <p className="landing-hero-subtitulo">
            Planes de entrenamiento, dietas personalizadas y análisis metabólico con inteligencia artificial para alcanzar tus objetivos más rápido.
          </p>
          <div className="landing-acciones">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate('/dashboard')}>Ir al Dashboard</Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/register')}>Comenzar Gratis</Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>Iniciar Sesión</Button>
              </>
            )}
          </div>
        </section>

        <section id="features" className="landing-seccion landing-seccion-fondo">
          <div className="landing-contenedor">
            <div className="landing-grid-feature">
              {features.map((f) => (
                <div key={f.titulo} className="landing-feature">
                  <div className="landing-feature-icono landing-gradiente">
                    <Icon name={f.icon} size={28} color="white" />
                  </div>
                  <h3 className="landing-feature-titulo">{f.titulo}</h3>
                  <p className="landing-feature-desc">{f.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planes" className="landing-seccion">
          <div className="landing-contenedor">
            <div className="landing-seccion-encabezado">
              <h2 className="landing-seccion-titulo">Planes de Entrenamiento</h2>
              <p className="landing-seccion-sub">
                Elige el plan que se adapte a tu nivel y objetivos
              </p>
            </div>
            <div className="landing-grid-tarjetas">
              {planes.map((plan) => (
                <article key={plan.nombre} className="landing-tarjeta">
                  <div
                    className="landing-tarjeta-icono"
                    style={{ background: `${plan.color}20` }}
                  >
                    <Icon name={plan.icon} size={24} color={plan.color} />
                  </div>
                  <h3>{plan.nombre}</h3>
                  <p className="landing-tarjeta-desc">{plan.descripcion}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="dietas" className="landing-seccion landing-seccion-fondo">
          <div className="landing-contenedor">
            <div className="landing-seccion-encabezado">
              <h2 className="landing-seccion-titulo">Planes de Alimentación</h2>
              <p className="landing-seccion-sub">
                Dietas personalizadas según tu objetivo
              </p>
            </div>
            <div className="landing-grid-tarjetas">
              {dietas.map((dieta) => (
                <article key={dieta.nombre} className="landing-tarjeta">
                  <div
                    className="landing-tarjeta-icono"
                    style={{ background: `${dieta.color}20` }}
                  >
                    <Icon name={dieta.icon} size={24} color={dieta.color} />
                  </div>
                  <h3>{dieta.nombre}</h3>
                  <p className="landing-tarjeta-desc">{dieta.descripcion}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" className="landing-seccion">
          <div className="landing-contenedor">
            <div className="landing-seccion-encabezado">
              <h2 className="landing-seccion-titulo">Galería de Resultados</h2>
              <p className="landing-seccion-sub">
                Conoce nuestro trabajo a través de imágenes
              </p>
            </div>
            <Carousel />
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-contenido">
            <h2 className="landing-cta-titulo">¿Listo para empezar tu transformación?</h2>
            <p className="landing-cta-texto">
              Regístrate gratis y comienza a entrenar con planes personalizados impulsados por inteligencia artificial.
            </p>
            <div className="landing-acciones">
              {isAuthenticated ? (
                <Button size="lg" className="btn-claro" onClick={() => navigate('/dashboard')}>
                  Ir al Dashboard
                </Button>
              ) : (
                <>
                  <Button size="lg" className="btn-claro" onClick={() => navigate('/register')}>
                    Crear Cuenta Gratis
                  </Button>
                  <Button size="lg" variant="secondary" className="btn-claro-contorno" onClick={() => navigate('/login')}>
                    Iniciar Sesión
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
