import { useState } from 'react';
import api from '../../services/api';

/* ============================================================
   Tarjeta de una certificación del entrenador.
   Estilo Material 3 oscuro (clases pe-); icono no requerido:
   sin emojis y sin depender del botón global.
   ============================================================ */

/* Formatea fecha con es-ES cuando se puede parsear; si no, la muestra tal cual */
function formatearFecha(fecha) {
  if (!fecha) return '';
  const parseada = new Date(fecha);
  if (Number.isNaN(parseada.getTime())) return fecha;
  return parseada.toLocaleDateString('es-ES');
}

export function CertificacionCard({ cert }) {
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState('');

  /* Descarga el archivo como blob, lo abre en una pestaña nueva
     y libera la URL temporal pasados 10 segundos */
  const verArchivo = async () => {
    setErrorArchivo('');
    setCargandoArchivo(true);
    try {
      const res = await api.get(`/auth/certifications/${cert.id}/archivo`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setErrorArchivo('No se pudo abrir el archivo');
    } finally {
      setCargandoArchivo(false);
    }
  };

  return (
    <div className="pe-cert">
      <p className="pe-cert-nombre">{cert.nombre}</p>
      {cert.institucion && (
        <p className="pe-cert-institucion">{cert.institucion}</p>
      )}
      {cert.descripcion && (
        <p className="pe-cert-descripcion">{cert.descripcion}</p>
      )}
      {(cert.fechaObtencion || cert.fechaExpiracion) && (
        <div className="pe-cert-fechas">
          {cert.fechaObtencion && (
            <span className="pe-cert-fecha">
              Obtención: {formatearFecha(cert.fechaObtencion)}
            </span>
          )}
          {cert.fechaExpiracion && (
            <span className="pe-cert-fecha">
              Expiración: {formatearFecha(cert.fechaExpiracion)}
            </span>
          )}
        </div>
      )}
      {cert.tieneArchivo && (
        <div className="pe-cert-acciones">
          <button
            type="button"
            className="pe-boton-archivo"
            onClick={verArchivo}
            disabled={cargandoArchivo}
            aria-label={`Ver archivo de la certificación ${cert.nombre}`}
          >
            {cargandoArchivo && <span className="pe-spinner" aria-hidden="true" />}
            {cargandoArchivo ? 'Cargando...' : 'Ver archivo'}
          </button>
          {errorArchivo && <p className="pe-error">{errorArchivo}</p>}
        </div>
      )}
      {!cert.tieneArchivo && cert.imagenUrl && (
        <a
          href={cert.imagenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pe-enlace-imagen"
        >
          Ver imagen
        </a>
      )}
    </div>
  );
}
