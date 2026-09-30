import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', contrasena: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.contrasena);
      if (user?.tipo === 'instruido' && !user?.perfilMedicoCompleto) {
        navigate('/complete-profile', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="auth-flujo">
      <div className="auth-radiancia-and" aria-hidden="true" />
      <div className="auth-radiancia-at" aria-hidden="true" />

      <header className="auth-marca">
        <div className="auth-marca-pildora">
          <span className="material-symbols-outlined">fitness_center</span>
          <span className="auth-marca-texto">Yantraining</span>
        </div>
      </header>

      <main className="auth-contenido">
        <section className="auth-tarjeta auth-tarjeta-estrecha">
          <div className="auth-encabezado-centrado">
            <h1 className="auth-titulo">Iniciar Sesión</h1>
            <p className="auth-subtitulo">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-formulario">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Contraseña"
              name="contrasena"
              type="password"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={handleChange}
              required
            />

            <button type="submit" className="auth-boton-principal" disabled={loading}>
              Iniciar Sesión
              {loading ? <span className="spinner spinner-sm" /> : <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          <p className="auth-alternativa">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="auth-enlace">Regístrate aquí</Link>
          </p>
        </section>
      </main>

      <footer className="auth-pie">
        © {new Date().getFullYear()} Yantraining. Todos los derechos reservados.
      </footer>
    </div>
  );
}
