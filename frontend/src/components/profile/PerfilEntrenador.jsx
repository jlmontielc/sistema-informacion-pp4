import { useState, useEffect } from 'react';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { CertificacionCard } from './CertificacionCard';
import api from '../../services/api';

/* ============================================================
   Perfil del entrenador del instruido ("Mi Entrenador").
   Vista Material 3 oscura; todos los iconos van via el componente
   Icon (SVG) — prohibido usar emojis en la interfaz.
   ============================================================ */

/* Devuelve 2 iniciales en mayúsculas (nombre y apellido);
   si solo hay una palabra, una sola letra */
function iniciales(nombre) {
  if (typeof nombre !== 'string') return '—';
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '—';
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
}

/* Valor seguro para texto: null/undefined → guion largo */
function textoSeguro(valor) {
  return valor || '—';
}

/* Formatea fecha con es-ES cuando se puede parsear; si no, la muestra tal cual */
function formatearFecha(fecha) {
  if (!fecha) return '';
  const parseada = new Date(fecha);
  if (Number.isNaN(parseada.getTime())) return fecha;
  return parseada.toLocaleDateString('es-ES');
}

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

  if (error) {
    return (
      <div className="pe-pagina">
        <div className="pe-seccion">
          <div className="pe-estado">
            <div className="pe-estado-icono pe-estado-icono--error">
              <Icon name="close" size={40} />
            </div>
            <h2 className="pe-estado-titulo">Error</h2>
            <p className="pe-estado-descripcion">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!entrenador) {
    return (
      <div className="pe-pagina">
        <div className="pe-seccion">
          <div className="pe-estado">
            <div className="pe-estado-icono pe-estado-icono--vacio">
              <Icon name="user" size={40} />
            </div>
            <h2 className="pe-estado-titulo">Sin entrenador</h2>
            <p className="pe-estado-descripcion">No tienes un entrenador asignado.</p>
          </div>
        </div>
      </div>
    );
  }

  const certificaciones = entrenador.certificaciones || [];

  return (
    <div className="pe-pagina">
      {/* Cabecera */}
      <div className="pe-seccion pe-cabecera">
        <h1 className="pe-titulo">Mi Entrenador</h1>
        <p className="pe-subtitulo">Información de tu entrenador personal</p>
      </div>

      {/* Identidad del entrenador */}
      <div className="pe-seccion pe-card">
        <div className="pe-identidad">
          <div className="pe-avatar" aria-hidden="true">{iniciales(entrenador.nombre)}</div>
          <div className="pe-identidad-info">
            <p className="pe-nombre">{entrenador.nombre}</p>
            <p className="pe-email">{textoSeguro(entrenador.email)}</p>
            {entrenador.especialidad && (
              <span className="pe-chip-especialidad">
                <Icon name="dumbbell" size={12} />
                {entrenador.especialidad}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Certificaciones */}
      <div className="pe-seccion pe-card">
        <div className="pe-card-cabecera">
          <h2 className="pe-card-titulo">
            <Icon name="receipt" size={20} className="pe-card-titulo-icono" />
            Certificaciones
          </h2>
          {certificaciones.length > 0 && (
            <span className="pe-badge">{certificaciones.length}</span>
          )}
        </div>
        {certificaciones.length > 0 ? (
          <div className="pe-cert-grid">
            {certificaciones.map((cert) => (
              <CertificacionCard key={cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <div className="pe-estado">
            <div className="pe-estado-icono pe-estado-icono--vacio">
              <Icon name="receipt" size={40} />
            </div>
            <h3 className="pe-estado-titulo">Sin certificaciones</h3>
            <p className="pe-estado-descripcion">
              Este entrenador aún no tiene certificaciones registradas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
