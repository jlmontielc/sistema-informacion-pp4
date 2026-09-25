import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import api from '../../services/api';

const redesIconos = {
  instagram: '📷',
  facebook: '👍',
  whatsapp: '💬',
  twitter: '🐦',
  linkedin: '🔗',
  youtube: '📺',
};

export function PerfilEntrenador() {
  const [entrenador, setEntrenador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/auth/trainer')
      .then(res => setEntrenador(res.data))
      .catch(() => setError('No se pudo cargar el perfil del entrenador'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando perfil del entrenador..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;
  if (!entrenador) return <EmptyState icon="🏋️" title="Sin entrenador" description="No tienes un entrenador asignado." />;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Mi Entrenador</h1>
          <p className="page-subtitle">Información de tu entrenador personal</p>
        </div>
      </div>

      <Card header="Información General">
        <div className="grid-datos">
          <InfoField label="Nombre" value={entrenador.nombre} />
          <InfoField label="Email" value={entrenador.email} />
          {entrenador.especialidad && <InfoField label="Especialidad" value={entrenador.especialidad} />}
          {entrenador.telefono && <InfoField label="Teléfono" value={entrenador.telefono} />}
        </div>
      </Card>

      <Card header="Certificaciones">
        {entrenador.certificaciones?.length > 0 ? (
          <div className="grid-datos">
            {entrenador.certificaciones.map((cert) => (
              <CertificacionCard key={cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Este entrenador aun no tiene certificaciones registradas.
          </p>
        )}
      </Card>

      {entrenador.redesSociales && Object.keys(entrenador.redesSociales).length > 0 && (
        <Card header="Redes Sociales">
          <div className="row">
            {Object.entries(entrenador.redesSociales).map(([red, url]) => (
              <a
                key={red}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="red-social-enlace"
              >
                <span className="red-social-icono" aria-hidden="true">{redesIconos[red] || '🔗'}</span>
                <span className="red-social-nombre">{red}</span>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function CertificacionCard({ cert }) {
  return (
    <div className="tarjeta-borde">
      <p className="text-bold">{cert.nombre}</p>
      {cert.institucion && (
        <p className="text-sm text-muted">{cert.institucion}</p>
      )}
      {cert.descripcion && (
        <p className="text-sm">{cert.descripcion}</p>
      )}
      <div className="row text-xs text-muted">
        {cert.fechaObtencion && <span>Obtención: {cert.fechaObtencion}</span>}
        {cert.fechaExpiracion && <span>Expiración: {cert.fechaExpiracion}</span>}
      </div>
      {cert.imagenUrl && (
        <a href={cert.imagenUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primario">
          Ver imagen
        </a>
      )}
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
