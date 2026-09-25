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
      <div className="page">
        <div className="page-header">
          <div className="page-header-text">
            <h2 className="page-title">Planes y Mensualidades</h2>
          </div>
        </div>
        <Card>
          <div className="empty-state">
            <p className="empty-state-icono" aria-hidden="true">⚠️</p>
            <p className="text-lg text-medium text-error">{error}</p>
            <Button onClick={cargarDatos}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h2 className="page-title">Planes y Mensualidades</h2>
          <p className="page-subtitle">
            Define tus planes, métodos de pago y verifica los pagos de tus clientes
          </p>
        </div>
        {(tab === 'planes' || tab === 'metodos') && (
          <div className="page-actions">
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
          </div>
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
          <div className="grid-auto">
            {planes.map((plan) => (
              <Card key={plan.id}>
                <div className="stack">
                  <div className="row-between">
                    <strong>{plan.nombre}</strong>
                    <span className={`badge ${plan.activo ? 'badge-success' : 'badge-neutral'}`}>
                      {plan.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <div className="valor-destacado">
                      {formatUsd(plan.montoUsd)}
                      <span className="text-sm text-muted ml-sm">
                        / mes aprox.
                      </span>
                    </div>
                    <div className="text-sm text-muted">
                      ≈ {formatBs(plan.montoUsd, tasaCambio)} · {plan.diasVigencia} días de vigencia
                    </div>
                  </div>
                  {plan.descripcion && (
                    <p className="text-sm text-muted">
                      {plan.descripcion}
                    </p>
                  )}
                  <div className="row">
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
          <div className="grid-auto">
            {metodos.map((metodo) => (
              <Card key={metodo.id}>
                <div className="stack">
                  <div className="row-between">
                    <strong>{labelTipo(metodo.tipo)}</strong>
                    <span className={`badge ${metodo.activo ? 'badge-success' : 'badge-neutral'}`}>
                      {metodo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <DatosMetodo datos={metodo.datos} />
                  {metodo.activo && (
                    <div className="row">
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
        <Card className="form-estrecho">
          <form onSubmit={handleGuardarTasa}>
            <div className="stack">
              <div>
                <h3 className="card-titulo card-titulo-md">Tasa de cambio ($ → Bs)</h3>
                <p className="text-sm text-muted">
                  Bolívares por cada 1 USD. Se usa para calcular los montos en Bs de tus planes y pagos.
                </p>
              </div>
              <div className="text-lg">
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
                <div className="alerta alerta-success text-center">
                  {mensajeTasa}
                </div>
              )}
              {errorTasa && (
                <div className="alerta alerta-error text-center">
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
          <div className="toolbar row-between">
            <h3 className="card-titulo card-titulo-md">Historial de pagos</h3>
            <select
              className="field-input select-filtro"
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
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Plan</th>
                    <th>Monto</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((pago) => (
                    <tr key={pago.id}>
                      <td>{formatearFechaISO(pago.fechaPago)}</td>
                      <td>{pago.Instruido?.nombre || '-'}</td>
                      <td>{pago.plan?.nombre || '-'}</td>
                      <td>
                        {formatUsd(pago.montoUsd)}
                        <span className="tabla-subtexto">
                          {formatBs(pago.montoUsd, pago.tasaAplicada)}
                        </span>
                      </td>
                      <td>{pago.referencia}</td>
                      <td>
                        <EstadoBadge estado={pago.estado} />
                        {pago.estado === 'rechazado' && pago.comentarioRechazo && (
                          <span className="tabla-subtexto tabla-subtexto-estrecha">
                            {pago.comentarioRechazo}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="row row-gap-sm">
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
        <div className="stack">
          <p className="text-sm text-muted">
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
              className="field-input field-textarea"
              rows={3}
              maxLength={255}
              value={comentarioRechazo}
              onChange={(e) => setComentarioRechazo(e.target.value)}
              placeholder="Ej. La referencia no corresponde al monto indicado"
            />
          </div>
          <div className="form-acciones">
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
