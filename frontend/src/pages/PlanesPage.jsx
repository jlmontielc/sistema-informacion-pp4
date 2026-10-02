import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Icon } from '../components/common/Icon';
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
      <div className="pg-pagina">
        <div className="pg-seccion pg-card">
          <div className="pg-estado">
            <div className="pg-estado-icono pg-estado-icono--error">
              <Icon name="close" size={32} />
            </div>
            <h2 className="pg-estado-titulo">Error</h2>
            <p className="pg-estado-descripcion">{error}</p>
            <Button variant="primary" onClick={cargarDatos}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pg-pagina">
      {/* Cabecera */}
      <div className="pg-seccion pg-cabecera">
        <div className="pg-cabecera-fila">
          <div className="pg-cabecera-texto">
            <h1 className="pg-titulo">Planes y Mensualidades</h1>
            <p className="pg-subtitulo">
              Define tus planes, métodos de pago y verifica los pagos de tus clientes
            </p>
          </div>
          {(tab === 'planes' || tab === 'metodos') && (
            <Button
              variant="primary"
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
              {tab === 'planes' ? 'Nuevo Plan' : 'Nuevo Método'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="pg-seccion pg-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'planes'} className={`pg-tab ${tab === 'planes' ? 'pg-tab--activa' : ''}`} onClick={() => setTab('planes')}>
          Planes
          <span className="pg-badge-contador">{planes.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'metodos'} className={`pg-tab ${tab === 'metodos' ? 'pg-tab--activa' : ''}`} onClick={() => setTab('metodos')}>
          Métodos de Pago
          <span className="pg-badge-contador">{metodos.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'tasa'} className={`pg-tab ${tab === 'tasa' ? 'pg-tab--activa' : ''}`} onClick={() => setTab('tasa')}>
          Tasa de Cambio
        </button>
        <button type="button" role="tab" aria-selected={tab === 'pagos'} className={`pg-tab ${tab === 'pagos' ? 'pg-tab--activa' : ''}`} onClick={() => setTab('pagos')}>
          Pagos Recibidos
          <span className="pg-badge-contador">{historial.length}</span>
        </button>
      </div>

      {tab === 'planes' && (
        planes.length === 0 ? (
          <div className="pg-seccion pg-card">
            <div className="pg-estado">
              <div className="pg-estado-icono">
                <Icon name="creditcard" size={32} />
              </div>
              <h3 className="pg-estado-titulo">Sin planes</h3>
              <p className="pg-estado-descripcion">
                Crea tu primer plan de mensualidad para que tus clientes puedan pagarlo.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setPlanEdit(null);
                  setFormPlanOpen(true);
                }}
              >
                Crear Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="pg-seccion pg-grid">
            {planes.map((plan) => (
              <div key={plan.id} className="pg-card">
                <div className="pg-card-cuerpo pg-plan-cuerpo">
                  <div className="pg-fila">
                    <p className="pg-plan-nombre">{plan.nombre}</p>
                    <span className={`pg-chip-estado ${plan.activo ? 'pg-chip-estado--activo' : 'pg-chip-estado--inactivo'}`}>
                      {plan.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <div className="pg-valor">
                      {formatUsd(plan.montoUsd)}
                      <span className="pg-valor-unidad">/ mes aprox.</span>
                    </div>
                    <p className="pg-plan-subtexto">
                      ≈ {formatBs(plan.montoUsd, tasaCambio)} · {plan.diasVigencia} días de vigencia
                    </p>
                  </div>
                  {plan.descripcion && (
                    <p className="pg-plan-descripcion">{plan.descripcion}</p>
                  )}
                  <div className="pg-acciones">
                    <Button variant="secondary" size="sm" onClick={() => { setPlanEdit(plan); setFormPlanOpen(true); }}>
                      Editar
                    </Button>
                    {plan.activo ? (
                      <Button variant="danger" size="sm" onClick={() => handleDesactivarPlan(plan)}>
                        Desactivar
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleReactivarPlan(plan)}>
                        Reactivar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'metodos' && (
        metodos.length === 0 ? (
          <div className="pg-seccion pg-card">
            <div className="pg-estado">
              <div className="pg-estado-icono">
                <Icon name="receipt" size={32} />
              </div>
              <h3 className="pg-estado-titulo">Sin métodos de pago</h3>
              <p className="pg-estado-descripcion">
                Configura al menos un método (pago móvil, transferencia, Zelle…) para recibir pagos.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setMetodoEdit(null);
                  setFormMetodoOpen(true);
                }}
              >
                Agregar Método
              </Button>
            </div>
          </div>
        ) : (
          <div className="pg-seccion pg-grid">
            {metodos.map((metodo) => (
              <div key={metodo.id} className="pg-card">
                <div className="pg-card-cuerpo pg-plan-cuerpo">
                  <div className="pg-fila">
                    <p className="pg-plan-nombre">{labelTipo(metodo.tipo)}</p>
                    <span className={`pg-chip-estado ${metodo.activo ? 'pg-chip-estado--activo' : 'pg-chip-estado--inactivo'}`}>
                      {metodo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <DatosMetodo datos={metodo.datos} />
                  {metodo.activo && (
                    <div className="pg-acciones">
                      <Button variant="secondary" size="sm" onClick={() => { setMetodoEdit(metodo); setFormMetodoOpen(true); }}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleEliminarMetodo(metodo)}>
                        Desactivar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'tasa' && (
        <div className="pg-seccion pg-card">
          <div className="pg-card-cabecera">
            <h2 className="pg-card-titulo">
              <Icon name="monitoring" size={20} className="pg-icono" />
              Tasa de cambio ($ → Bs)
            </h2>
          </div>
          <div className="pg-card-cuerpo">
            <p className="pg-subtitulo">
              Bolívares por cada 1 USD. Se usa para calcular los montos en Bs de tus planes y pagos.
            </p>
            <div className="pg-tasa-actual">
              <span className="pg-tasa-valor">
                {tasaCambio !== null ? formatBs(1, tasaCambio).replace('Bs ', '') : '-'}
              </span>
              <span className="pg-tasa-unidad">Bs/USD</span>
            </div>
            <form onSubmit={handleGuardarTasa} className="pg-form">
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
                <div className="pg-aviso pg-aviso--ok">
                  <Icon name="check" size={16} className="pg-icono" />
                  <p>{mensajeTasa}</p>
                </div>
              )}
              {errorTasa && (
                <div className="pg-aviso pg-aviso--error">
                  <Icon name="close" size={16} className="pg-icono" />
                  <p>{errorTasa}</p>
                </div>
              )}
              <div className="pg-acciones">
                <Button type="submit" variant="primary" loading={guardandoTasa}>
                  Guardar tasa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'pagos' && (
        <div className="pg-seccion pg-card">
          <div className="pg-card-cabecera">
            <h2 className="pg-card-titulo">
              <Icon name="history" size={20} className="pg-icono" />
              Historial de pagos
            </h2>
            <div className="pg-selecto">
              <select
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
              <Icon name="next" size={14} className="pg-selecto-flecha" />
            </div>
          </div>

          {cargandoHistorial ? (
            <Loading text="Cargando pagos..." />
          ) : errorHistorial ? (
            <div className="pg-estado">
              <div className="pg-estado-icono pg-estado-icono--error">
                <Icon name="close" size={32} />
              </div>
              <h3 className="pg-estado-titulo">Error</h3>
              <p className="pg-estado-descripcion">{errorHistorial}</p>
            </div>
          ) : historial.length === 0 ? (
            <div className="pg-estado">
              <div className="pg-estado-icono">
                <Icon name="receipt" size={32} />
              </div>
              <h3 className="pg-estado-titulo">Sin pagos</h3>
              <p className="pg-estado-descripcion">
                {filtroEstado
                  ? `No hay pagos con estado "${ESTADOS_FILTRO.find((f) => f.value === filtroEstado)?.label}".`
                  : 'Cuando tus clientes registren pagos aparecerán aquí.'}
              </p>
            </div>
          ) : (
            /* Tabla; en ≤640px se apila en tarjetas vía .rw-tabla */
            <div className="pg-tabla-scroll rw-tabla">
              <table className="pg-tabla">
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
                      <td data-label="Fecha">{formatearFechaISO(pago.fechaPago)}</td>
                      <td data-label="Cliente">{pago.Instruido?.nombre || '-'}</td>
                      <td data-label="Plan">{pago.plan?.nombre || '-'}</td>
                      <td data-label="Monto">
                        {formatUsd(pago.montoUsd)}
                        <span className="tabla-subtexto">
                          {formatBs(pago.montoUsd, pago.tasaAplicada)}
                        </span>
                      </td>
                      <td data-label="Referencia">{pago.referencia}</td>
                      <td data-label="Estado">
                        <EstadoBadge estado={pago.estado} />
                        {pago.estado === 'rechazado' && pago.comentarioRechazo && (
                          <span className="tabla-subtexto tabla-subtexto-estrecha">
                            {pago.comentarioRechazo}
                          </span>
                        )}
                      </td>
                      <td data-label="Acciones">
                        <div className="pg-acciones">
                          <Button variant="secondary" size="sm" onClick={() => setVerComprobanteId(pago.id)}>
                            Ver
                          </Button>
                          {pago.estado === 'pendiente' && (
                            <>
                              <Button variant="primary" size="sm" loading={procesandoId === pago.id} onClick={() => handleVerificar(pago)}>
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
        </div>
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
