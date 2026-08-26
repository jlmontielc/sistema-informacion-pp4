import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { hitlApi, instruidosApi } from '../../services/rutinasApi';

export function GenerarRutinaIAModal({ isOpen, onClose, onGenerada }) {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteId, setClienteId] = useState('');
  const [excluir, setExcluir] = useState('');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

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
    <Modal isOpen={isOpen} onClose={onClose} title="Recomendar Plantillas IA" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}>
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
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                    Indica nombres de ejercicios que no quieres en las plantillas
                  </p>
                </div>

                {clienteSeleccionado && (
                  <div style={{
                    padding: 'var(--space-3)',
                    background: 'var(--color-neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    La IA analizará el perfil de <strong>{clienteSeleccionado.nombre}</strong>, su historial de entrenamiento, lesiones y condiciones médicas para recomendar las mejores plantillas del entrenador.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={onClose} disabled={generando}>
                    Cancelar
                  </button>
                  <Button onClick={handleGenerar} loading={generando}>
                    {generando ? 'Recomendando...' : 'Recomendar'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {generando && (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <Loading text="La IA está analizando el perfil y evaluando plantillas..." />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}>
              Esto puede tomar unos segundos mientras se procesan las plantillas disponibles
            </p>
          </div>
        )}

        {resultado && !generando && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{
              padding: 'var(--space-4)',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
            }}>
              <h4 style={{ margin: 0, color: '#166534', fontSize: 'var(--text-base)' }}>
                Recomendación generada exitosamente
              </h4>
              {resultado.explicacion && (
                <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--text-sm)', color: '#166534' }}>
                  {resultado.explicacion}
                </p>
              )}
            </div>

            {resultado.confianza != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Confianza IA:</span>
                <div style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  background: resultado.confianza >= 0.7 ? '#dcfce7' : '#fef9c3',
                  color: resultado.confianza >= 0.7 ? '#166534' : '#854d0e',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                }}>
                  {Math.round(resultado.confianza * 100)}%
                </div>
              </div>
            )}

            {resultado.plantillas_recomendadas && resultado.plantillas_recomendadas.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                  Plantillas recomendadas ({resultado.plantillas_recomendadas.length}):
                </span>
                {resultado.plantillas_recomendadas.map((p, i) => (
                  <div key={p.plantilla_id || i} style={{
                    padding: 'var(--space-3)',
                    background: i === 0 ? '#f0f9ff' : 'var(--color-neutral-50)',
                    border: i === 0 ? '1px solid #bae6fd' : '1px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 'var(--font-medium)' }}>
                        {p.nombre}
                      </p>
                      <span style={{
                        padding: 'var(--space-1) var(--space-2)',
                        borderRadius: 'var(--radius-full)',
                        background: i === 0 ? '#dcfce7' : '#f3f4f6',
                        color: i === 0 ? '#166534' : '#6b7280',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                      }}>
                        {Math.round(p.score * 100)}%
                      </span>
                    </div>
                    <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                      {p.tipo} · {p.nivel_dificultad} · {p.dias_semana || p.frecuencia_semanal} días/semana
                      {p.ejercicios_bloqueados_count > 0 && (
                        <span style={{ color: '#991b1b' }}> · {p.ejercicios_bloqueados_count} ejercicio(s) bloqueado(s)</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {resultado.alertas_seguridad && resultado.alertas_seguridad.length > 0 && (
              <div style={{
                padding: 'var(--space-3)',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: '#991b1b',
              }}>
                <strong>Alertas de seguridad:</strong>
                <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
                  {resultado.alertas_seguridad.map((a, i) => (
                    <li key={i}>{typeof a === 'string' ? a : a.mensaje || JSON.stringify(a)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{
              padding: 'var(--space-3)',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: '#1e40af',
            }}>
              La recomendación ha sido guardada como <strong>pendiente de revisión</strong>. Ve al tab &quot;Recomendadas IA&quot; para aprobarla, modificarla o rechazarla.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
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
