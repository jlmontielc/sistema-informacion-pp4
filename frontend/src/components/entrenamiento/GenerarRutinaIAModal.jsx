import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { hitlApi, instruidosApi, plantillasApi } from '../../services/rutinasApi';

export function GenerarRutinaIAModal({ isOpen, onClose, onGenerada }) {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteId, setClienteId] = useState('');
  const [excluir, setExcluir] = useState('');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [plantillasMap, setPlantillasMap] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setLoadingClientes(true);
    instruidosApi.listar()
      .then((res) => {
        const data = res.data?.instruidos || res.data || [];
        setClientes(Array.isArray(data) ? data : []);
      })
      .catch(() => setClientes([]))
      .finally(() => setLoadingClientes(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    plantillasApi.listar({ activa: true })
      .then((res) => {
        const arr = res.data?.plantillas || res.data || [];
        const m = {};
        (Array.isArray(arr) ? arr : []).forEach((p) => { m[p.id] = p; });
        setPlantillasMap(m);
      })
      .catch(() => setPlantillasMap({}));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setClienteId('');
    setExcluir('');
    setError(null);
    setResultado(null);
  }, [isOpen]);

  const handleGenerar = async () => {
    if (!clienteId) {
      setError('Selecciona un cliente');
      return;
    }
    setGenerando(true);
    setError(null);
    setResultado(null);
    try {
      const preferencias = {};
      if (excluir.trim()) {
        preferencias.excluir = excluir.split(',').map((s) => s.trim()).filter(Boolean);
      }
      const res = await hitlApi.sugerirRutina(Number(clienteId), preferencias);
      setResultado(res.data);
    } catch (err) {
      setError(err.response?.error || err.response?.data?.error || 'Error al recomendar plantillas');
    } finally {
      setGenerando(false);
    }
  };

  const clienteSeleccionado = clientes.find((c) => c.id === Number(clienteId));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Obtener recomendación de plantilla" size="lg">
      <div className="stack">
        {error && (
          <div className="alerta alerta-error">
            {error}
          </div>
        )}

        {!resultado && (
          <>
            {loadingClientes ? (
              <Loading text="Cargando clientes..." />
            ) : clientes.length === 0 ? (
              <EmptyState
                icon="👥"
                title="Sin clientes"
                description="No hay clientes registrados para recomendar plantillas."
              />
            ) : (
              <>
                <div className="field">
                  <label className="field-label">Cliente *</label>
                  <select
                    className="field-input"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    disabled={generando}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}{c.email ? ` (${c.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Excluir ejercicios (opcional)</label>
                  <input
                    className="field-input"
                    type="text"
                    value={excluir}
                    onChange={(e) => setExcluir(e.target.value)}
                    placeholder="Nombres separados por coma..."
                    disabled={generando}
                  />
                  <p className="field-ayuda">
                    Indica nombres de ejercicios que no quieres en las plantillas
                  </p>
                </div>

                {clienteSeleccionado && (
                  <div className="nota-informativa">
                    La IA analizará el perfil de <strong>{clienteSeleccionado.nombre}</strong>, su historial de entrenamiento, lesiones y condiciones médicas para recomendar las mejores plantillas del entrenador.
                  </div>
                )}

                <div className="form-acciones">
                  <button className="btn btn-secondary" onClick={onClose} disabled={generando}>
                    Cancelar
                  </button>
                  <Button onClick={handleGenerar} loading={generando}>
                    {generando ? 'Recomendando...' : 'Obtener recomendación de plantilla'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {generando && (
          <div className="stack text-center">
            <Loading text="La IA está analizando el perfil y evaluando plantillas..." />
            <p className="field-ayuda">
              Esto puede tomar unos segundos mientras se procesan las plantillas disponibles
            </p>
          </div>
        )}

        {resultado && !generando && (
          <div className="stack">
            <div className="ia-panel ia-panel-exito">
              <h4>Recomendación generada exitosamente</h4>
              {resultado.plantilla_id == null && (
                <p className="ia-panel-texto">
                  No se encontró una plantilla viable: todas fueron descartadas por lesiones o restricciones de seguridad.
                </p>
              )}
              {resultado.explicacion && (
                <p className="ia-panel-texto">
                  {resultado.explicacion}
                </p>
              )}
            </div>

            {resultado.confianza != null && (
              <div className="row">
                <span className="text-sm text-muted">Confianza IA:</span>
                <span className={`badge ${resultado.confianza >= 70 ? 'badge-success' : 'badge-warning'}`}>
                  {Math.round(resultado.confianza)}%
                </span>
              </div>
            )}

            {resultado.plantilla_id != null && (() => {
              const p = plantillasMap[resultado.plantilla_id];
              return (
                <div className="stack stack-sm">
                  <span className="text-sm text-medium">
                    Plantilla recomendada:
                  </span>
                  <div className="ia-panel ia-panel-info">
                    <div className="row-between">
                      <p className="text-medium">
                        {p?.nombre || `Plantilla #${resultado.plantilla_id}`}
                      </p>
                      <span className="badge badge-success">
                        {Math.round(resultado.confianza)}%
                      </span>
                    </div>
                    <p className="ia-panel-texto text-xs text-muted">
                      {p?.tipo || '—'} · {p?.nivelDificultad || p?.nivel_dificultad || '—'} · {p?.frecuenciaSemanal || p?.dias_semana || '?'} días/semana
                    </p>
                  </div>
                </div>
              );
            })()}

            {resultado.advertencia && (
              <div className="ia-panel ia-panel-aviso">
                <p>
                  <strong>Advertencia:</strong> {resultado.advertencia}
                </p>
              </div>
            )}

            {resultado.alertas_seguridad && resultado.alertas_seguridad.length > 0 && (
              <div className="ia-panel ia-panel-peligro">
                <p>
                  <strong>Alertas de seguridad:</strong>
                </p>
                <ul className="ia-lista">
                  {resultado.alertas_seguridad.map((a, i) => (
                    <li key={i}>{typeof a === 'string' ? a : a.mensaje || JSON.stringify(a)}</li>
                  ))}
                </ul>
              </div>
            )}

            {(resultado.hasLesiones || resultado.sinLesiones === false || resultado.sinLesiones === null) && (() => {
              const esIndeterminado = resultado.sinLesiones === null;
              const titulo = esIndeterminado
                ? 'No se pudo determinar el estado médico del instruido'
                : 'Atención: el instruido tiene antecedentes médicos registrados';
              const mensaje = esIndeterminado
                ? 'Verifica el perfil médico.'
                : 'Revísalos en el perfil médico antes de asignar la rutina.';

              return (
                <div className="ia-panel ia-panel-aviso row">
                  <span className="ia-panel-icono" aria-hidden="true">⚠️</span>
                  <div>
                    <p className="text-medium">
                      {titulo}
                    </p>
                    <p className="ia-panel-texto">
                      {mensaje}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="ia-panel ia-panel-info">
              <p>
                La recomendación ha sido guardada como <strong>pendiente de revisión</strong>. Ve al tab &quot;Recomendadas IA&quot; para aprobarla, modificarla o rechazarla.
              </p>
            </div>

            <div className="form-acciones">
              <button className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
              <Button onClick={() => { onGenerada?.(); onClose(); }}>
                Ver en Recomendadas
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
