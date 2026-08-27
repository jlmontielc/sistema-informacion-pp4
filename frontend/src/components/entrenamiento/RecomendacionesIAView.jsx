import { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { rutinasAsignadasApi, hitlApi } from '../../services/rutinasApi';
import { GenerarRutinaIAModal } from './GenerarRutinaIAModal';
import { RecomendacionDetalle } from './RecomendacionDetalle';

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

  const handleAprobar = async (rutinaId, datos = {}) => {
    setProcesando(true);
    try {
      await hitlApi.registrarFeedback({
        clienteId: rutinas.find((r) => r.id === rutinaId)?.instruidoId,
        rutinaSugeridaId: rutinaId,
        accion: 'aprobada',
        observaciones: datos.observaciones || null,
        tipo: 'rutina',
      });
      await rutinasAsignadasApi.actualizar(rutinaId, { activa: true });
      setVerRutina(null);
      await cargarRutinas();
      onRecargar?.();
    } catch (err) {
      alert(err.response?.error || err.response?.data?.error || 'Error al aprobar la rutina');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async (rutinaId, datos = {}) => {
    setProcesando(true);
    try {
      await hitlApi.registrarFeedback({
        clienteId: rutinas.find((r) => r.id === rutinaId)?.instruidoId,
        rutinaSugeridaId: rutinaId,
        accion: 'rechazada',
        observaciones: datos.observaciones || null,
        tipo: 'rutina',
      });
      await rutinasAsignadasApi.eliminar(rutinaId);
      setVerRutina(null);
      await cargarRutinas();
      onRecargar?.();
    } catch (err) {
      alert(err.response?.error || err.response?.data?.error || 'Error al rechazar la rutina');
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (rutinaId) => {
    if (!window.confirm('Eliminar esta recomendacion? Esta accion no se puede deshacer.')) return;
    setProcesando(true);
    try {
      await rutinasAsignadasApi.eliminar(rutinaId);
      setVerRutina(null);
      await cargarRutinas();
      onRecargar?.();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Error al eliminar la recomendacion');
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <Loading text="Cargando recomendaciones IA..." />;

  if (error) {
    return (
      <Card>
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--color-error)',
        }}>
          <p style={{ fontSize: 48, margin: 0 }}>⚠️</p>
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', marginTop: 'var(--space-3)' }}>
            {error}
          </p>
          <Button onClick={cargarRutinas} style={{ marginTop: 'var(--space-4)' }}>
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => setGenerarOpen(true)}>
          Obtener recomendación de plantilla
        </Button>
      </div>

      {rutinas.length === 0 ? (
        <Card>
          <EmptyState
            icon="🤖"
            title="Sin recomendaciones pendientes"
            description="Obtén una recomendación de plantilla del entrenador para un cliente. La recomendación aparecerá aqui para que la revises antes de activarla."
            action={<Button onClick={() => setGenerarOpen(true)}>Obtener recomendación de plantilla</Button>}
          />
        </Card>
      ) : (
        <div className="rutinas-grid">
          {rutinas.map((r) => (
            <Card key={r.id}>
              <div style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{r.nombre}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span className={`rutina-tipo-badge ${r.tipo}`}>
                      {TIPO_LABELS[r.tipo] || r.tipo}
                    </span>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-full)',
                      background: '#fef9c3',
                      color: '#854d0e',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-medium)',
                    }}>
                      Pendiente
                    </span>
                  </div>
                </div>

                {r.Instruido && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                    Cliente: {r.Instruido.nombre}
                  </p>
                )}

                <div className="rutina-resumen-stats" style={{ marginTop: 'var(--space-2)' }}>
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

                {r.createdAt && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                    Recomendada: {new Date(r.createdAt).toLocaleDateString('es-ES')}
                  </p>
                )}

                <div className="rutina-acciones">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setVerRutina(verRutina === r.id ? null : r.id)}
                  >
                    {verRutina === r.id ? 'Ocultar' : 'Ver y Revisar'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-error)' }}
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
            </Card>
          ))}
        </div>
      )}

      <GenerarRutinaIAModal
        isOpen={generarOpen}
        onClose={() => setGenerarOpen(false)}
        onGenerada={() => { cargarRutinas(); onRecargar?.(); }}
      />
    </div>
  );
}
