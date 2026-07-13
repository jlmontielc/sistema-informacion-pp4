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
    <div>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--space-3) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
            <span style={{ fontSize: 24 }}>🏋️</span>
            {APP_NAME}
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button onClick={() => scrollTo('planes')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Planes</button>
            <button onClick={() => scrollTo('dietas')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Dietas</button>
            <button onClick={() => scrollTo('galeria')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Galería</button>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>Ir al Dashboard</Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>Iniciar Sesión</Button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--space-16) var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-6)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
          }}>
            Transforma tu cuerpo, transforma tu vida
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 'var(--font-bold)',
            lineHeight: 1.15,
            maxWidth: 720,
          }}>
            Tu entrenador personal{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              inteligente
            </span>
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: 560,
            lineHeight: 'var(--line-height-relaxed)',
          }}>
            Planes de entrenamiento, dietas personalizadas y análisis metabólico con inteligencia artificial para alcanzar tus objetivos más rápido.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
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

        <section id="features" style={{ background: 'var(--color-neutral-50)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'var(--space-12) var(--space-6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-8)',
          }}>
            {features.map((f) => (
              <div key={f.titulo} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-xl)',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4)',
                }}>
                  <Icon name={f.icon} size={28} color="white" />
                </div>
                <h3 style={{ marginBottom: 'var(--space-2)' }}>{f.titulo}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{f.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planes" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2>Planes de Entrenamiento</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Elige el plan que se adapte a tu nivel y objetivos
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            {planes.map((plan) => (
              <div key={plan.nombre} style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                transition: 'box-shadow var(--transition-normal), transform var(--transition-normal)',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: plan.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name={plan.icon} size={24} color={plan.color} />
                </div>
                <h3>{plan.nombre}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {plan.descripcion}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="dietas" style={{
          background: 'var(--color-neutral-50)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
              <h2>Planes de Alimentación</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                Dietas personalizadas según tu objetivo
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}>
              {dietas.map((dieta) => (
                <div key={dieta.nombre} style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  transition: 'box-shadow var(--transition-normal), transform var(--transition-normal)',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-lg)',
                    background: dieta.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon name={dieta.icon} size={24} color={dieta.color} />
                  </div>
                  <h3>{dieta.nombre}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                    {dieta.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2>Galería de Resultados</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Conoce nuestro trabajo a través de imágenes
            </p>
          </div>
          <Carousel />
        </section>

        <section style={{
          background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
          color: 'white',
          textAlign: 'center',
          padding: 'var(--space-16) var(--space-6)',
        }}>
          <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'center' }}>
            <h2 style={{ color: 'white' }}>¿Listo para empezar tu transformación?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 'var(--line-height-relaxed)' }}>
              Regístrate gratis y comienza a entrenar con planes personalizados impulsados por inteligencia artificial.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {isAuthenticated ? (
                <Button size="lg" onClick={() => navigate('/dashboard')}
                  style={{ background: 'white', color: '#1e3a8a', fontWeight: 'var(--font-bold)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >Ir al Dashboard</Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/register')}
                    style={{ background: 'white', color: '#1e3a8a', fontWeight: 'var(--font-bold)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >Crear Cuenta Gratis</Button>
                  <Button size="lg" variant="secondary" onClick={() => navigate('/login')}
                    style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >Iniciar Sesión</Button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer style={{
        background: 'var(--color-neutral-900)',
        color: 'var(--color-neutral-400)',
        padding: 'var(--space-8) var(--space-6)',
        textAlign: 'center',
        fontSize: 'var(--text-sm)',
      }}>
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
