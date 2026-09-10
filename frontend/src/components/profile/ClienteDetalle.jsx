import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import api from '../../services/api';
import { labelObjetivo, labelNivelExperiencia } from '../../utils/constants';

const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

const sexoLabels = {
  masculino: 'Masculino',
  femenino: 'Femenino',
};

const CAMPOS_MEDICOS = [
  { name: 'alergias', label: 'Alergias' },
  { name: 'intolerancias', label: 'Intolerancias' },
  { name: 'lesiones', label: 'Lesiones' },
  { name: 'condicionesPreexistentes', label: 'Condiciones preexistentes' },
  { name: 'medicacionActual', label: 'Medicación actual' },
  { name: 'observaciones', label: 'Observaciones' },
];

export function ClienteDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const [instruido, setInstruido] = useState(null);
  const [perfilMedico, setPerfilMedico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarMedicos, setMostrarMedicos] = useState(false);

  useEffect(() => {
    if (!id) return;

    if (user?.tipo === 'instruido') {
      setError('No tienes permisos para ver esta información');
      setLoading(false);
      return;
    }

    const instruidoId = Number(id);
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/instruidos/${instruidoId}`),
      api.get(`/instruidos/${instruidoId}/perfil-medico`),
    ])
      .then(([resBasico, resMedico]) => {
        setInstruido(resBasico?.data || null);
        setPerfilMedico(resMedico?.data || null);
      })
      .catch((err) => {
        const mensaje = err.response?.data?.error
          || err.response?.statusText
          || 'Error al cargar el detalle del cliente';
        setError(mensaje);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <Loading text="Cargando cliente..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Link to="/clientes" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" size="sm">← Volver</Button>
        </Link>
        <div>
          <h1>{instruido?.nombre || 'Cliente'}</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Detalle completo del cliente</p>
        </div>
      </div>

      <Card header="Información General">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <InfoField label="Nombre" value={instruido?.nombre || '—'} />
          <InfoField label="Email" value={instruido?.email || '—'} />
          <InfoField label="Edad" value={instruido?.edad ? `${instruido.edad} años` : '—'} />
          <InfoField label="Peso" value={instruido?.peso ? `${instruido.peso} kg` : '—'} />
          <InfoField label="Altura" value={instruido?.altura ? `${instruido.altura} m` : '—'} />
          <InfoField label="Sexo" value={sexoLabels[instruido?.sexo] || '—'} />
          <InfoField label="Nivel de actividad" value={nivelLabels[instruido?.nivelActividad] || '—'} />
          <InfoField label="Propósito" value={instruido?.propositoEntrenamiento ? labelObjetivo(instruido.propositoEntrenamiento) : '—'} />
          <InfoField label="Nivel de experiencia" value={instruido?.nivelExperiencia ? labelNivelExperiencia(instruido.nivelExperiencia) : '—'} />
          <InfoField label="Días disponibles" value={instruido?.diasDisponibles ? `${instruido.diasDisponibles} días/semana` : '—'} />
          <InfoField label="Fecha de registro" value={instruido?.fechaRegistro || '—'} />
        </div>
      </Card>

      <Card header="Datos Médicos">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: perfilMedico?.perfilMedicoCompleto ? 'var(--color-success-bg, #e8f5e9)' : 'var(--color-warning-bg, #fff3e0)',
            color: perfilMedico?.perfilMedicoCompleto ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ef6c00)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            width: 'fit-content',
          }}>
            <span>{perfilMedico?.perfilMedicoCompleto ? '✅' : '⏳'}</span>
            <span>{perfilMedico?.perfilMedicoCompleto ? 'Perfil médico completo' : 'Perfil médico pendiente'}</span>
          </div>

          {perfilMedico?.datosMedicosCorruptos && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-error)',
              color: 'var(--color-text-inverse)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
            }}>
              <p style={{ margin: 0 }}>
                ⚠️ No se pudieron descifrar algunos datos médicos. Es probable que se hayan guardado con una clave anterior.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {CAMPOS_MEDICOS.map(({ name, label }) => (
              <InfoField
                key={name}
                label={label}
                value={mostrarMedicos ? (perfilMedico?.[name] || '—') : (perfilMedico?.[name] ? '••••••' : '—')}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setMostrarMedicos((prev) => !prev)}>
              {mostrarMedicos ? 'Ocultar datos médicos' : 'Ver datos médicos'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 'var(--font-medium)' }}>{value}</p>
    </div>
  );
}
