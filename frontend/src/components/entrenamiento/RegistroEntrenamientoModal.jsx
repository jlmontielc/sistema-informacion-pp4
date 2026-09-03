import { useEffect, useMemo, useState, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { registroEntrenamientoApi } from '../../services/rutinasApi';
import { obtenerNombreDia } from './DiaSelector';
import { EjercicioRegistroCard } from './EjercicioRegistroCard';

const formatearTiempo = (segundos) => {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function RegistroEntrenamientoModal({
  isOpen,
  onClose,
  rutina,
  dia,
  ejercicios,
  onFinalizado,
}) {
  const [sesion, setSesion] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);
  const [finalizando, setFinalizando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const iniciarSesion = useCallback(async () => {
    if (!rutina) return;
    setLoading(true);
    setError(null);
    try {
      const res = await registroEntrenamientoApi.iniciar({
        rutinaAsignadaId: rutina.id,
      });
      setSesion(res.data);
    } catch (err) {
      setError('No se pudo iniciar la sesion de entrenamiento.');
    } finally {
      setLoading(false);
    }
  }, [rutina]);

  const cargarSeries = useCallback(async (sesionId) => {
    if (!sesionId) return;
    try {
      const res = await registroEntrenamientoApi.listarSeries(sesionId);
      setSeries(res.data || []);
    } catch {
      setSeries([]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      iniciarSesion();
    } else {
      setSesion(null);
      setSeries([]);
      setSegundosTranscurridos(0);
      setError(null);
    }
  }, [isOpen, iniciarSesion]);

  useEffect(() => {
    if (sesion?.id) {
      cargarSeries(sesion.id);
    }
  }, [sesion, cargarSeries]);

  useEffect(() => {
    if (!sesion?.fechaInicio || finalizando || cancelando) return;

    const calcular = () => {
      const inicio = new Date(sesion.fechaInicio).getTime();
      const ahora = Date.now();
      setSegundosTranscurridos(Math.max(0, Math.floor((ahora - inicio) / 1000)));
    };

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [sesion, finalizando, cancelando]);

  const seriesPorEjercicio = useMemo(() => {
    const map = {};
    ejercicios.forEach((ej) => {
      map[ej.ejercicio_id] = [];
    });
    series.forEach((serie) => {
      if (!map[serie.ejercicioId]) map[serie.ejercicioId] = [];
      map[serie.ejercicioId].push(serie);
    });
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.numeroSerie - b.numeroSerie);
    });
    return map;
  }, [series, ejercicios]);

  const volumenTotal = useMemo(() => {
    return series.reduce((acc, s) => acc + (s.pesoKg || 0) * (s.repeticionesRealizadas || 0), 0);
  }, [series]);

  const handleCrearSerie = async (datos) => {
    if (!sesion) return;
    try {
      await registroEntrenamientoApi.crearSerie(sesion.id, datos);
      await cargarSeries(sesion.id);
    } catch {
      setError('Error al guardar la serie.');
    }
  };

  const handleEditarSerie = async (serieId, datos) => {
    if (!sesion) return;
    try {
      await registroEntrenamientoApi.editarSerie(sesion.id, serieId, datos);
      await cargarSeries(sesion.id);
    } catch {
      setError('Error al actualizar la serie.');
    }
  };

  const handleEliminarSerie = async (serieId) => {
    if (!sesion) return;
    try {
      await registroEntrenamientoApi.eliminarSerie(sesion.id, serieId);
      await cargarSeries(sesion.id);
    } catch {
      setError('Error al eliminar la serie.');
    }
  };

  const handleFinalizar = async () => {
    if (!sesion) return;
    setFinalizando(true);
    try {
      const duracionMinutos = Math.floor(segundosTranscurridos / 60);
      await registroEntrenamientoApi.finalizar(sesion.id, {
        duracionMinutos,
      });
      onFinalizado?.();
      onClose();
    } catch {
      setError('Error al finalizar el entrenamiento.');
    } finally {
      setFinalizando(false);
    }
  };

  const handleCancelar = async () => {
    if (!sesion) return;
    if (!window.confirm('¿Seguro que quieres cancelar esta sesion?')) return;
    setCancelando(true);
    try {
      await registroEntrenamientoApi.cancelar(sesion.id);
      onClose();
    } catch {
      setError('Error al cancelar el entrenamiento.');
    } finally {
      setCancelando(false);
    }
  };

  const handleCerrar = () => {
    if (sesion && series.length > 0) {
      const confirmar = window.confirm(
        'Si cierras ahora perderas el progreso no guardado. ¿Quieres cancelar la sesion?'
      );
      if (!confirmar) return;
      registroEntrenamientoApi.cancelar(sesion.id).finally(onClose);
      return;
    }
    onClose();
  };

  const titulo = `Entrenamiento · ${obtenerNombreDia(dia)}`;

  return (
    <Modal isOpen={isOpen} onClose={handleCerrar} title={titulo} size="xl">
      <div className="registro-modal">
        {loading && !sesion ? (
          <Loading text="Iniciando sesion..." />
        ) : error ? (
          <div className="registro-modal-error">
            <p>{error}</p>
            <Button variant="secondary" onClick={iniciarSesion}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className="registro-modal-header">
              <div className="registro-modal-stats">
                <div className="registro-modal-stat">
                  <span className="registro-modal-stat-value">{series.length}</span>
                  <span className="registro-modal-stat-label">series</span>
                </div>
                <div className="registro-modal-stat">
                  <span className="registro-modal-stat-value">{volumenTotal.toFixed(0)}</span>
                  <span className="registro-modal-stat-label">volumen (kg)</span>
                </div>
                <div className="registro-modal-stat">
                  <span className="registro-modal-stat-value">
                    {formatearTiempo(segundosTranscurridos)}
                  </span>
                  <span className="registro-modal-stat-label">tiempo</span>
                </div>
              </div>
            </div>

            <div className="registro-modal-body">
              {ejercicios.length === 0 ? (
                <p className="serie-empty">No hay ejercicios programados para hoy.</p>
              ) : (
                ejercicios.map((ejercicio) => (
                  <EjercicioRegistroCard
                    key={ejercicio.ejercicio_id}
                    ejercicio={ejercicio}
                    series={seriesPorEjercicio[ejercicio.ejercicio_id] || []}
                    onCrearSerie={handleCrearSerie}
                    onEditarSerie={handleEditarSerie}
                    onEliminarSerie={handleEliminarSerie}
                  />
                ))
              )}
            </div>

            <div className="registro-modal-footer">
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinalizar}
                loading={finalizando}
                disabled={finalizando || cancelando}
              >
                Finalizar entrenamiento
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleCancelar}
                loading={cancelando}
                disabled={finalizando || cancelando}
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
