import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import api from '../services/api';

const CAMPOS_MEDICOS = [
  { name: 'alergias', label: 'Alergias', placeholder: 'Ej: penicilina, polen, frutos secos' },
  { name: 'intolerancias', label: 'Intolerancias', placeholder: 'Ej: lactosa, gluten' },
  { name: 'lesiones', label: 'Lesiones', placeholder: 'Ej: esguince de tobillo, hernia discal L5-S1' },
  { name: 'condicionesPreexistentes', label: 'Condiciones preexistentes', placeholder: 'Ej: asma, hipertensión, diabetes tipo 2' },
  { name: 'medicacionActual', label: 'Medicación actual', placeholder: 'Ej: metformina 500mg, losartán 50mg' },
  { name: 'observaciones', label: 'Observaciones', placeholder: 'Cualquier otra información relevante para tu entrenamiento' },
];

export default function CompleteProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.tipo !== 'instruido') {
      navigate('/dashboard');
      return;
    }
    api.get('/instruidos/yo/perfil-medico')
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          const datos = {};
          CAMPOS_MEDICOS.forEach(({ name }) => {
            datos[name] = res.data[name] || '';
          });
          setForm(datos);
        } else {
          const inicial = {};
          CAMPOS_MEDICOS.forEach(({ name }) => { inicial[name] = ''; });
          setForm(inicial);
        }
      })
      .catch(() => {
        const inicial = {};
        CAMPOS_MEDICOS.forEach(({ name }) => { inicial[name] = ''; });
        setForm(inicial);
      })
      .finally(() => setCargando(false));
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const payload = {};
      CAMPOS_MEDICOS.forEach(({ name }) => {
        payload[name] = form[name] || '';
      });
      await api.put('/instruidos/yo/perfil-medico', payload);
      if (setUser) {
        setUser(prev => ({ ...prev, perfilMedicoCompleto: true }));
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar datos médicos');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Loading text="Cargando..." />;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: 'var(--space-6)',
    }}>
      <Card style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Datos Médicos</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Completa tu perfil médico para que podamos generar rutinas seguras y personalizadas.
              Separa los valores con coma.
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
            {CAMPOS_MEDICOS.map(({ name, label, placeholder }) => (
              <div className="field" key={name}>
                <label className="field-label" htmlFor={name}>{label}</label>
                <textarea
                  id={name}
                  name={name}
                  className="field-input"
                  placeholder={placeholder}
                  value={form[name] || ''}
                  onChange={handleChange}
                  rows={3}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            ))}

            <Button type="submit" loading={guardando} style={{ marginTop: 'var(--space-2)' }}>
              Guardar y continuar
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
