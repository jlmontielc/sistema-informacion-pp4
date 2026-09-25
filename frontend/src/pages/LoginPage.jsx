import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

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
    <div className="contenedor-centrado">
      <Card className="form-estrecho form-estrecho-sm">
        <Card.Body>
          <div className="stack stack-md">
            <div className="stack stack-sm text-center">
              <h1 className="page-title">Iniciar Sesión</h1>
              <p className="page-subtitle">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {error && (
              <div className="alerta alerta-error text-center" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="stack stack-md">
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
              <Button type="submit" loading={loading} className="w-full">
                Iniciar Sesión
              </Button>
            </form>

            <p className="text-center text-sm text-muted">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="enlace-sin-subrayado text-primario">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
