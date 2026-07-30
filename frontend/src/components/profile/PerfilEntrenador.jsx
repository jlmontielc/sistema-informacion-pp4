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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Mi Entrenador</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Información de tu entrenador personal</p>
      </div>

      <Card header="Información General">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <InfoField label="Nombre" value={entrenador.nombre} />
          <InfoField label="Email" value={entrenador.email} />
          {entrenador.especialidad && <InfoField label="Especialidad" value={entrenador.especialidad} />}
          {entrenador.telefono && <InfoField label="Teléfono" value={entrenador.telefono} />}
        </div>
      </Card>

      <Card header="Certificaciones">
        {entrenador.certificaciones?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {entrenador.certificaciones.map((cert) => (
              <CertificacionCard key={cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Este entrenador aun no tiene certificaciones registradas.
          </p>
        )}
      </Card>

      {entrenador.redesSociales && Object.keys(entrenador.redesSociales).length > 0 && (
        <Card header="Redes Sociales">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {Object.entries(entrenador.redesSociales).map(([red, url]) => (
              <a
                key={red}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 18 }}>{redesIconos[red] || '🔗'}</span>
                <span style={{ textTransform: 'capitalize' }}>{red}</span>
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
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      <p style={{ fontWeight: 'var(--font-bold)' }}>{cert.nombre}</p>
      {cert.institucion && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{cert.institucion}</p>
      )}
      {cert.descripcion && (
        <p style={{ fontSize: 'var(--text-sm)' }}>{cert.descripcion}</p>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
        {cert.fechaObtencion && <span>Obtención: {cert.fechaObtencion}</span>}
        {cert.fechaExpiracion && <span>Expiración: {cert.fechaExpiracion}</span>}
      </div>
      {cert.imagenUrl && (
        <a href={cert.imagenUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-500)' }}>
          Ver imagen
        </a>
      )}
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
