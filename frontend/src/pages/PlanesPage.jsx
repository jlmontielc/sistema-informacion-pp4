import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import {
  planesPagoApi,
  metodosPagoApi,
  configuracionPagosApi,
  pagosApi,
} from '../services/pagosApi';
import { formatUsd, formatBs } from '../utils/formatters';
import {
  PlanFormModal,
  MetodoPagoModal,
  ComprobanteModal,
  EstadoBadge,
  DatosMetodo,
  TIPOS_METODO,
} from '../components/pagos';

const ESTADOS_FILTRO = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'verificado', label: 'Verificados' },
  { value: 'rechazado', label: 'Rechazados' },
];

const gridCardsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 'var(--space-4)',
};

const tablaEstilo = { width: '100%', borderCollapse: 'collapse' };
const celdaEstilo = {
  padding: 'var(--space-3)',
  borderBottom: '1px solid var(--color-border)',
  textAlign: 'left',
  fontSize: 'var(--text-sm)',
};

const formatearFechaISO = (fecha) => {
  if (!fecha) return '-';
  const partes = String(fecha).split('T')[0].split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const labelTipo = (tipo) =>
  TIPOS_METODO.find((t) => t.value === tipo)?.label || tipo;

export default function PlanesPage() {
  const { user } = useAuth();

  const [tab, setTab] = useState('planes');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [planes, setPlanes] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [tasaCambio, setTasaCambio] = useState(null);

  const [formPlanOpen, setFormPlanOpen] = useState(false);
  const [planEdit, setPlanEdit] = useState(null);
  const [formMetodoOpen, setFormMetodoOpen] = useState(false);
  const [metodoEdit, setMetodoEdit] = useState(null);

  const [tasaInput, setTasaInput] = useState('');
  const [guardandoTasa, setGuardandoTasa] = useState(false);
  const [mensajeTasa, setMensajeTasa] = useState('');
  const [errorTasa, setErrorTasa] = useState('');

  const [historial, setHistorial] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [errorHistorial, setErrorHistorial] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);
  const [rechazarPago, setRechazarPago] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState('');
  const [verComprobanteId, setVerComprobanteId] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [resPlanes, resMetodos, resConfig] = await Promise.all([
        planesPagoApi.listar(),
        metodosPagoApi.listar(),
        configuracionPagosApi.obtener(),
      ]);
      setPlanes(Array.isArray(resPlanes.data) ? resPlanes.data : []);
      setMetodos(Array.isArray(resMetodos.data) ? resMetodos.data : []);
      const tasa = resConfig.data?.tasaCambio ?? 40;
      setTasaCambio(Number(tasa));
      setTasaInput(String(tasa));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los datos de pagos');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarHistorial = useCallback(async (estado) => {
    setCargandoHistorial(true);
    setErrorHistorial('');
    try {
      const res = await pagosApi.historial(estado ? { estado } : {});
      setHistorial(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setErrorHistorial(err.response?.data?.error || 'No se pudo cargar el historial de pagos');
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    cargarHistorial(filtroEstado);
  }, [cargarHistorial, filtroEstado]);

  const handleDesactivarPlan = async (plan) => {
    if (!window.confirm(`¿Desactivar el plan "${plan.nombre}"? Conservará el historial de pagos.`))
      return;
    try {
      await planesPagoApi.eliminar(plan.id);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al desactivar el plan');
    }
  };

  const handleReactivarPlan = async (plan) => {
    try {
      await planesPagoApi.actualizar(plan.id, { activo: true });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al reactivar el plan');
    }
  };

  const handleEliminarMetodo = async (metodo) => {
    if (!window.confirm(`¿Desactivar este método de pago (${labelTipo(metodo.tipo)})?`)) return;
    try {
      await metodosPagoApi.eliminar(metodo.id);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al desactivar el método de pago');
    }
  };

  const handleGuardarTasa = async (e) => {
    e.preventDefault();
    setMensajeTasa('');
    setErrorTasa('');
    const tasa = parseFloat(tasaInput);
    if (!tasa || tasa <= 0) return setErrorTasa('Ingresa una tasa válida');
    setGuardandoTasa(true);
    try {
      await configuracionPagosApi.actualizarTasa(Math.round(tasa * 10000) / 10000);
      setTasaCambio(tasa);
      setMensajeTasa('Tasa actualizada correctamente');
    } catch (err) {
      setErrorTasa(err.response?.data?.error || 'Error al actualizar la tasa');
    } finally {
      setGuardandoTasa(false);
    }
  };

  const handleVerificar = async (pago) => {
    if (
      !window.confirm(
        `¿Verificar el pago de ${pago.Instruido?.nombre || 'el instruido'} por ${formatUsd(
          pago.montoUsd
        )}? Se activará su mensualidad automáticamente.`
      )
    )
      return;
    setProcesandoId(pago.id);
    try {
      await pagosApi.verificar(pago.id);
      cargarHistorial(filtroEstado);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al verificar el pago');
    } finally {
      setProcesandoId(null);
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!rechazarPago) return;
    setProcesandoId(rechazarPago.id);
    try {
      await pagosApi.rechazar(rechazarPago.id, comentarioRechazo.trim());
      setRechazarPago(null);
      setComentarioRechazo('');
      cargarHistorial(filtroEstado);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al rechazar el pago');
    } finally {
      setProcesandoId(null);
    }
  };

  if (user?.tipo === 'instruido') {
    return <Navigate to="/mi-plan" replace />;
  }

  if (cargando) return <Loading text="Cargando planes..." />;

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <h2>Planes y Mensualidades</h2>
        <Card>
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
            <p style={{ fontSize: 48, margin: 0 }}>⚠️</p>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', marginTop: 'var(--space-3)' }}>
              {error}
            </p>
            <Button onClick={cargarDatos} style={{ marginTop: 'var(--space-4)' }}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h2>Planes y Mensualidades</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Define tus planes, métodos de pago y verifica los pagos de tus clientes
          </p>
        </div>
        {(tab === 'planes' || tab === 'metodos') && (
          <Button
            onClick={() => {
              if (tab === 'planes') {
                setPlanEdit(null);
                setFormPlanOpen(true);
              } else {
                setMetodoEdit(null);
                setFormMetodoOpen(true);
              }
            }}
          >
            {tab === 'planes' ? '+ Nuevo Plan' : '+ Nuevo Método'}
          </Button>
        )}
      </div>

      <div className="tabs-container">
        <button type="button" className={`tab-button ${tab === 'planes' ? 'active' : ''}`} onClick={() => setTab('planes')}>
          Planes ({planes.length})
        </button>
        <button type="button" className={`tab-button ${tab === 'metodos' ? 'active' : ''}`} onClick={() => setTab('metodos')}>
          Métodos de Pago ({metodos.length})
        </button>
        <button type="button" className={`tab-button ${tab === 'tasa' ? 'active' : ''}`} onClick={() => setTab('tasa')}>
          Tasa de Cambio
        </button>
        <button type="button" className={`tab-button ${tab === 'pagos' ? 'active' : ''}`} onClick={() => setTab('pagos')}>
          Pagos Recibidos ({historial.length})
        </button>
      </div>

      {tab === 'planes' && (
        planes.length === 0 ? (
          <Card>
            <EmptyState
              icon="💳"
              title="Sin planes"
              description="Crea tu primer plan de mensualidad para que tus clientes puedan pagarlo."
              action={
                <Button
                  onClick={() => {
                    setPlanEdit(null);
                    setFormPlanOpen(true);
                  }}
                >
                  Crear Plan
                </Button>
              }
            />
          </Card>
        ) : (
          <div style={gridCardsStyle}>
            {planes.map((plan) => (
              <Card key={plan.id}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <strong>{plan.nombre}</strong>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 999,
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                        color: '#fff',
                        backgroundColor: plan.activo ? 'var(--color-success)' : 'var(--color-neutral-400)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {plan.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
                      {formatUsd(plan.montoUsd)}
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginLeft: 'var(--space-2)' }}>
                        / mes aprox.
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      ≈ {formatBs(plan.montoUsd, tasaCambio)} · {plan.diasVigencia} días de vigencia
                    </div>
                  </div>
                  {plan.descripcion && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {plan.descripcion}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button variant="secondary" size="sm" onClick={() => { setPlanEdit(plan); setFormPlanOpen(true); }}>
                      Editar
                    </Button>
                    {plan.activo ? (
                      <Button variant="danger" size="sm" onClick={() => handleDesactivarPlan(plan)}>
                        Desactivar
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleReactivarPlan(plan)}>
                        Reactivar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'metodos' && (
        metodos.length === 0 ? (
          <Card>
            <EmptyState
              icon="🏦"
              title="Sin métodos de pago"
              description="Configura al menos un método (pago móvil, transferencia, Zelle…) para recibir pagos."
              action={
                <Button
                  onClick={() => {
                    setMetodoEdit(null);
                    setFormMetodoOpen(true);
                  }}
                >
                  Agregar Método
                </Button>
              }
            />
          </Card>
        ) : (
          <div style={gridCardsStyle}>
            {metodos.map((metodo) => (
              <Card key={metodo.id}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <strong>{labelTipo(metodo.tipo)}</strong>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 999,
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                        color: '#fff',
                        backgroundColor: metodo.activo ? 'var(--color-success)' : 'var(--color-neutral-400)',
                      }}
                    >
                      {metodo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <DatosMetodo datos={metodo.datos} />
                  {metodo.activo && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Button variant="secondary" size="sm" onClick={() => { setMetodoEdit(metodo); setFormMetodoOpen(true); }}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleEliminarMetodo(metodo)}>
                        Desactivar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'tasa' && (
        <Card style={{ maxWidth: 480 }}>
          <form onSubmit={handleGuardarTasa}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <h3 style={{ margin: 0 }}>Tasa de cambio ($ → Bs)</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Bolívares por cada 1 USD. Se usa para calcular los montos en Bs de tus planes y pagos.
                </p>
              </div>
              <div style={{ fontSize: 'var(--text-lg)' }}>
                Tasa actual:{' '}
                <strong>{tasaCambio !== null ? formatBs(1, tasaCambio).replace('Bs ', '') : '-'} Bs/USD</strong>
              </div>
              <Input
                label="Nueva tasa"
                name="tasaCambio"
                type="number"
                min="0.0001"
                step="0.0001"
                value={tasaInput}
                onChange={(e) => {
                  setTasaInput(e.target.value);
                  setMensajeTasa('');
                  setErrorTasa('');
                }}
                placeholder="40.00"
                required
              />
              {mensajeTasa && (
                <div
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--color-success)',
                    color: 'var(--color-text-inverse)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    textAlign: 'center',
                  }}
                >
                  {mensajeTasa}
                </div>
              )}
              {errorTasa && (
                <div
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--color-error)',
                    color: 'var(--color-text-inverse)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    textAlign: 'center',
                  }}
                >
                  {errorTasa}
                </div>
              )}
              <div>
                <Button type="submit" loading={guardandoTasa}>
                  Guardar tasa
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {tab === 'pagos' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <h3 style={{ margin: 0 }}>Historial de pagos</h3>
            <select
              className="field-input"
              style={{ width: 'auto' }}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              {ESTADOS_FILTRO.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {cargandoHistorial ? (
            <Loading text="Cargando pagos..." />
          ) : errorHistorial ? (
            <EmptyState icon="⚠️" title="Error" description={errorHistorial} />
          ) : historial.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="Sin pagos"
              description={
                filtroEstado
                  ? `No hay pagos con estado "${ESTADOS_FILTRO.find((f) => f.value === filtroEstado)?.label}".`
                  : 'Cuando tus clientes registren pagos aparecerán aquí.'
              }
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tablaEstilo}>
                <thead>
                  <tr>
                    <th style={celdaEstilo}>Fecha</th>
                    <th style={celdaEstilo}>Cliente</th>
                    <th style={celdaEstilo}>Plan</th>
                    <th style={celdaEstilo}>Monto</th>
                    <th style={celdaEstilo}>Referencia</th>
                    <th style={celdaEstilo}>Estado</th>
                    <th style={celdaEstilo}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((pago) => (
                    <tr key={pago.id}>
                      <td style={celdaEstilo}>{formatearFechaISO(pago.fechaPago)}</td>
                      <td style={celdaEstilo}>{pago.Instruido?.nombre || '-'}</td>
                      <td style={celdaEstilo}>{pago.plan?.nombre || '-'}</td>
                      <td style={celdaEstilo}>
                        {formatUsd(pago.montoUsd)}
                        <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                          {formatBs(pago.montoUsd, pago.tasaAplicada)}
                        </span>
                      </td>
                      <td style={celdaEstilo}>{pago.referencia}</td>
                      <td style={celdaEstilo}>
                        <EstadoBadge estado={pago.estado} />
                        {pago.estado === 'rechazado' && pago.comentarioRechazo && (
                          <span style={{ display: 'block', marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', maxWidth: 180 }}>
                            {pago.comentarioRechazo}
                          </span>
                        )}
                      </td>
                      <td style={celdaEstilo}>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                          <Button variant="secondary" size="sm" onClick={() => setVerComprobanteId(pago.id)}>
                            Ver
                          </Button>
                          {pago.estado === 'pendiente' && (
                            <>
                              <Button size="sm" loading={procesandoId === pago.id} onClick={() => handleVerificar(pago)}>
                                Verificar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={procesandoId === pago.id}
                                onClick={() => {
                                  setRechazarPago(pago);
                                  setComentarioRechazo('');
                                }}
                              >
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <PlanFormModal
        isOpen={formPlanOpen}
        onClose={() => setFormPlanOpen(false)}
        plan={planEdit}
        onGuardado={cargarDatos}
      />

      <MetodoPagoModal
        isOpen={formMetodoOpen}
        onClose={() => setFormMetodoOpen(false)}
        metodo={metodoEdit}
        onGuardado={cargarDatos}
      />

      <ComprobanteModal
        isOpen={verComprobanteId !== null}
        onClose={() => setVerComprobanteId(null)}
        pagoId={verComprobanteId}
      />

      <Modal isOpen={rechazarPago !== null} onClose={() => setRechazarPago(null)} title="Rechazar pago">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Pago de <strong>{rechazarPago?.Instruido?.nombre}</strong> por{' '}
            <strong>{formatUsd(rechazarPago?.montoUsd)}</strong>. El cliente verá el motivo del rechazo.
          </p>
          <div className="field">
            <label className="field-label" htmlFor="comentarioRechazo">
              Motivo (opcional)
            </label>
            <textarea
              id="comentarioRechazo"
              name="comentarioRechazo"
              className="field-input"
              rows={3}
              maxLength={255}
              value={comentarioRechazo}
              onChange={(e) => setComentarioRechazo(e.target.value)}
              placeholder="Ej. La referencia no corresponde al monto indicado"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={() => setRechazarPago(null)} disabled={procesandoId !== null}>
              Cancelar
            </Button>
            <Button variant="danger" loading={procesandoId === rechazarPago?.id} onClick={handleConfirmarRechazo}>
              Rechazar pago
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
