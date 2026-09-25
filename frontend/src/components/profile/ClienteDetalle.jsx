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
    <div className="page">
      <div className="page-header">
        <div className="row">
          <Link to="/clientes" className="enlace-sin-subrayado">
            <Button variant="secondary" size="sm">← Volver</Button>
          </Link>
          <div className="page-header-text">
            <h1 className="page-title">{instruido?.nombre || 'Cliente'}</h1>
            <p className="page-subtitle">Detalle completo del cliente</p>
          </div>
        </div>
      </div>

      <Card header="Información General">
        <div className="grid-datos">
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
        <div className="stack">
          <span className={`badge ${perfilMedico?.perfilMedicoCompleto ? 'badge-success' : 'badge-warning'}`}>
            <span>{perfilMedico?.perfilMedicoCompleto ? '✅' : '⏳'}</span>
            <span>{perfilMedico?.perfilMedicoCompleto ? 'Perfil médico completo' : 'Perfil médico pendiente'}</span>
          </span>

          {perfilMedico?.datosMedicosCorruptos && (
            <div className="alerta alerta-error">
              <p>
                ⚠️ No se pudieron descifrar algunos datos médicos. Es probable que se hayan guardado con una clave anterior.
              </p>
            </div>
          )}

          <div className="grid-datos">
            {CAMPOS_MEDICOS.map(({ name, label }) => (
              <InfoField
                key={name}
                label={label}
                value={mostrarMedicos ? (perfilMedico?.[name] || '—') : (perfilMedico?.[name] ? '••••••' : '—')}
              />
            ))}
          </div>
          <div className="form-acciones">
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
    <div className="field">
      <p className="dato-label">{label}</p>
      <p className="dato-valor">{value}</p>
    </div>
  );
}
