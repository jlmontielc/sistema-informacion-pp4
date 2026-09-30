import { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { rutinasAsignadasApi, hitlApi } from '../../services/rutinasApi';
import { GenerarRutinaIAModal } from './GenerarRutinaIAModal';
import { RecomendacionDetalle } from './RecomendacionDetalle';
import { ConfirmacionDialog } from './ConfirmacionDialog';
import { Icon } from '../common/Icon';

const TIPO_LABELS = {
  fuerza: 'Fuerza', hipertrofia: 'Hipertrofia', resistencia: 'Resistencia',
  cardio: 'Cardio', funcional: 'Funcional', flexibilidad: 'Flexibilidad',
};

export function RecomendacionesIAView({ onRecargar }) {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generarOpen, setGenerarOpen] = useState(false);
  const [verRutina, setVerRutina] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  const cargarRutinas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rutinasAsignadasApi.listar({ ia: 'true' });
      setRutinas(res.data?.rutinas || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarRutinas(); }, [cargarRutinas]);

  /* Abre el diálogo de confirmación para aceptar la recomendación
     y asignarla como rutina activa. */
  const handleAprobar = (rutinaId, datos = {}) => {
    const nombre = rutinas.find((r) => r.id === rutinaId)?.nombre || 'la recomendación';
    setConfirmacion({
      titulo: 'Aceptar recomendación',
      mensaje: `¿Aceptar la recomendación «${nombre}» y asignarla como rutina activa?`,
      accion: 'cian',
      alConfirmar: async () => {
        setConfirmacion((prev) => ({ ...prev, cargando: true }));
        setProcesando(true);
        try {
          await hitlApi.decidir(rutinaId, {
            accion: 'aceptada',
            comentario: datos.observaciones || null,
          });
          setConfirmacion(null);
          setErrorAccion(null);
          setVerRutina(null);
          await cargarRutinas();
          onRecargar?.();
        } catch (err) {
          setConfirmacion(null);
          setErrorAccion(err.response?.error || err.response?.data?.error || 'Error al aprobar la rutina');
        } finally {
          setProcesando(false);
        }
      },
    });
  };

  /* Abre el diálogo de confirmación para rechazar la recomendación
     (permite ajustarla y generar una nueva versión). */
  const handleRechazar = (rutinaId, datos = {}) => {
    const nombre = rutinas.find((r) => r.id === rutinaId)?.nombre || 'la recomendación';
    setConfirmacion({
      titulo: 'Rechazar recomendación',
      mensaje: `¿Rechazar la recomendación «${nombre}»? Podrás generar una nueva con ajustes.`,
      accion: 'lavanda',
      alConfirmar: async () => {
        setConfirmacion((prev) => ({ ...prev, cargando: true }));
        setProcesando(true);
        try {
          await hitlApi.decidir(rutinaId, {
            accion: 'rechazada',
            comentario: datos.observaciones || null,
          });
          setConfirmacion(null);
          setErrorAccion(null);
          setVerRutina(null);
          await cargarRutinas();
          onRecargar?.();
        } catch (err) {
          setConfirmacion(null);
          setErrorAccion(err.response?.error || err.response?.data?.error || 'Error al rechazar la rutina');
        } finally {
          setProcesando(false);
        }
      },
    });
  };

  /* Abre el diálogo de confirmación para eliminar la recomendación. */
  const handleEliminar = (rutinaId) => {
    setConfirmacion({
      titulo: 'Eliminar recomendación',
      mensaje: '¿Eliminar esta recomendación? Esta acción no se puede deshacer.',
      accion: 'peligro',
      alConfirmar: async () => {
        setConfirmacion((prev) => ({ ...prev, cargando: true }));
        setProcesando(true);
        try {
          await rutinasAsignadasApi.eliminar(rutinaId);
          setConfirmacion(null);
          setErrorAccion(null);
          setVerRutina(null);
          await cargarRutinas();
          onRecargar?.();
        } catch (err) {
          setConfirmacion(null);
          setErrorAccion(err.response?.data?.error || err.response?.data?.message || 'Error al eliminar la recomendación');
        } finally {
          setProcesando(false);
        }
      },
    });
  };

  if (loading) return <Loading text="Cargando recomendaciones IA..." />;

  if (error) {
    return (
      <div className="gt-carta gt-vacio">
        <Icon name="close" size={40} className="gt-vacio-icono" />
        <p className="gt-vacio-texto">{error}</p>
        <button type="button" className="gt-boton-secundario" onClick={cargarRutinas}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="gt-seccion-ia">
      <div className="gt-fila-ia">
        <button type="button" className="gt-boton-primario" onClick={() => setGenerarOpen(true)}>
          <Icon name="bolt" size={16} />
          Obtener recomendación de plantilla
        </button>
      </div>

      {errorAccion && (
        <div className="gt-alerta-error" role="alert">
          <Icon name="close" size={16} />
          <span className="gt-alerta-error-texto">{errorAccion}</span>
          <button
            type="button"
            className="gt-alerta-cerrar"
            onClick={() => setErrorAccion(null)}
            aria-label="Descartar error"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {rutinas.length === 0 ? (
        <div className="gt-carta gt-vacio">
          <Icon name="bolt" size={40} className="gt-vacio-icono" />
          <p className="gt-vacio-titulo">Sin recomendaciones pendientes</p>
          <p className="gt-vacio-descripcion">
            Obtén una recomendación de plantilla del entrenador para un cliente. La
            recomendación aparecerá aquí para que la revises antes de activarla.
          </p>
          <button type="button" className="gt-boton-primario" onClick={() => setGenerarOpen(true)}>
            Obtener recomendación de plantilla
          </button>
        </div>
      ) : (
        <div className="gt-grid">
          {rutinas.map((r, i) => (
            <div
              key={r.id}
              className="gt-carta gt-carta-ia"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="gt-carta-cuerpo">
                <div className="gt-carta-cabecera">
                  <h3 className="gt-carta-titulo">{r.nombre}</h3>
                  <div className="gt-fila">
                    <span className={`gt-chip gt-chip-${r.tipo}`}>
                      {TIPO_LABELS[r.tipo] || r.tipo}
                    </span>
                    <span className="gt-chip gt-estado-pendiente">
                      Pendiente
                    </span>
                  </div>
                </div>

                {r.Instruido && (
                  <div className="gt-cliente">
                    <Icon name="user" size={15} className="gt-cliente-icono" />
                    <span className="gt-cliente-nombre">{r.Instruido.nombre}</span>
                  </div>
                )}

                <div className="gt-metricas-panel">
                  <div className="rutina-resumen-stats">
                    <div className="rutina-resumen-stat">
                      <div className="rutina-resumen-stat-value">{r.frecuenciaSemanal || '?'}</div>
                      <div className="rutina-resumen-stat-label">x/semana</div>
                    </div>
                    <div className="rutina-resumen-stat">
                      <div className="rutina-resumen-stat-value">
                        {r.ejercicios?.plantillas_recomendadas
                          ? r.ejercicios.plantillas_recomendadas.length
                          : Array.isArray(r.ejercicios) ? r.ejercicios.length : 0}
                      </div>
                      <div className="rutina-resumen-stat-label">plantillas</div>
                    </div>
                  </div>
                </div>

                {r.createdAt && (
                  <span className="gt-ia-fecha">
                    <Icon name="clock" size={12} />
                    Recomendada: {new Date(r.createdAt).toLocaleDateString('es-ES')}
                  </span>
                )}

                <div className="gt-acciones">
                  <button
                    type="button"
                    className="gt-ver"
                    onClick={() => setVerRutina(verRutina === r.id ? null : r.id)}
                  >
                    <Icon name="eye" size={14} />
                    {verRutina === r.id ? 'Ocultar' : 'Ver y Revisar'}
                  </button>
                  <button
                    type="button"
                    className="gt-accion-peligro"
                    onClick={() => handleEliminar(r.id)}
                    disabled={procesando}
                  >
                    Eliminar
                  </button>
                </div>

                {verRutina === r.id && (
                  <RecomendacionDetalle
                    rutina={r}
                    onAprobar={handleAprobar}
                    onRechazar={handleRechazar}
                    procesando={procesando}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <GenerarRutinaIAModal
        isOpen={generarOpen}
        onClose={() => setGenerarOpen(false)}
        onGenerada={() => { cargarRutinas(); onRecargar?.(); }}
      />

      <ConfirmacionDialog
        abierto={Boolean(confirmacion)}
        titulo={confirmacion?.titulo || ''}
        mensaje={confirmacion?.mensaje || ''}
        accion={confirmacion?.accion || 'cian'}
        cargando={Boolean(confirmacion?.cargando)}
        onConfirmar={confirmacion?.alConfirmar}
        onCerrar={() => setConfirmacion(null)}
      />
    </div>
  );
}
