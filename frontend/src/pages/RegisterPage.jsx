import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

const OPCIONES_SEXO = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
];

const OPCIONES_NIVEL = [
  { value: 'sedentario', label: 'Sedentario' },
  { value: 'ligero', label: 'Ligero' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'activo', label: 'Activo' },
  { value: 'muy_activo', label: 'Muy activo' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: 'instruido',
    edad: '',
    peso: '',
    altura: '',
    sexo: '',
    nivelActividad: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.contrasena !== form.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.rol === 'instruido') {
      if (!form.edad || !form.peso || !form.altura || !form.sexo || !form.nivelActividad) {
        setError('Completa todos los campos obligatorios para instruido');
        return;
      }
    }

    try {
      const datosEnvio = {
        nombre: form.nombre,
        email: form.email,
        contrasena: form.contrasena,
        rol: form.rol,
      };

      if (form.rol === 'instruido') {
        datosEnvio.edad = parseInt(form.edad, 10);
        datosEnvio.peso = parseFloat(form.peso);
        datosEnvio.altura = parseFloat(form.altura);
        datosEnvio.sexo = form.sexo;
        datosEnvio.nivelActividad = form.nivelActividad;
      }

      await register(datosEnvio);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: 'var(--space-6)',
    }}>
      <Card style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Crear Cuenta</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Regístrate para empezar a usar el sistema
            </p>
          </div>

          {error && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-6)',
              backgroundColor: 'var(--color-error)',
              color: 'var(--color-text-inverse)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Input
              label="Nombre completo"
              name="nombre"
              placeholder="Juan Pérez"
              value={form.nombre}
              onChange={handleChange}
              required
            />
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
              placeholder="Mínimo 8 caracteres"
              value={form.contrasena}
              onChange={handleChange}
              minLength={8}
              required
            />
            <Input
              label="Confirmar contraseña"
              name="confirmarContrasena"
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmarContrasena}
              onChange={handleChange}
              minLength={8}
              required
            />

            <div className="field">
              <label className="field-label" htmlFor="rol">Tipo de cuenta</label>
              <select
                id="rol"
                name="rol"
                className="field-input"
                value={form.rol}
                onChange={handleChange}
              >
                <option value="instruido">Instruido (Cliente)</option>
                <option value="entrenador">Entrenador</option>
              </select>
            </div>

            {form.rol === 'instruido' && (
              <>
                <Input
                  label="Edad"
                  name="edad"
                  type="number"
                  min={1}
                  max={120}
                  placeholder="25"
                  value={form.edad}
                  onChange={handleChange}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Input
                    label="Peso (kg)"
                    name="peso"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="70.5"
                    value={form.peso}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Altura (m)"
                    name="altura"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1.75"
                    value={form.altura}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="sexo">Sexo</label>
                  <select
                    id="sexo"
                    name="sexo"
                    className="field-input"
                    value={form.sexo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {OPCIONES_SEXO.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="nivelActividad">Nivel de actividad</label>
                  <select
                    id="nivelActividad"
                    name="nivelActividad"
                    className="field-input"
                    value={form.nivelActividad}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {OPCIONES_NIVEL.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <Button type="submit" loading={loading} style={{ marginTop: 'var(--space-2)' }}>
              Crear Cuenta
            </Button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-500)', textDecoration: 'none' }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
