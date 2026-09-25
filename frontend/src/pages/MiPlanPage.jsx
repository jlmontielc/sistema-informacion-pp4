import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/EmptyState';
import { pagosApi } from '../services/pagosApi';
import { formatUsd, formatBs } from '../utils/formatters';
import { RegistrarPagoModal, ComprobanteModal, EstadoBadge, TIPOS_METODO } from '../components/pagos';

const formatearFechaISO = (fecha) => {
  if (!fecha) return '-';
  const partes = String(fecha).split('T')[0].split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const labelTipo = (tipo) =>
  TIPOS_METODO.find((t) => t.value === tipo)?.label || tipo;

const labelOfrecimiento = (valor) => {
  const mapa = {
    entrenamiento: 'Entrenamiento',
    dietas: 'Dietas',
    ambos: 'Entrenamiento + Dietas',
  };
  return mapa[valor] || valor;
};

const iconoOfrecimiento = (valor) => {
  const mapa = {
    entrenamiento: '🏋️',
    dietas: '🥗',
    ambos: '🏋️🥗',
  };
  return mapa[valor] || '📦';
};

export default function MiPlanPage() {
  const { user, setUser } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [entrenadorId, setEntrenadorId] = useState(user?.entrenadorId ?? null);
  const [sinEntrenador, setSinEntrenador] = useState(false);
  const [error, setError] = useState('');

  const [suscripcion, setSuscripcion] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [tasaCambio, setTasaCambio] = useState(null);
  const [misPagos, setMisPagos] = useState([]);

  const [planAPagar, setPlanAPagar] = useState(null);
  const [verComprobanteId, setVerComprobanteId] = useState(null);

  const cargarDatos = useCallback(async (idEntrenador) => {
    try {
      const [resSuscripcion, resCatalogo, resPagos] = await Promise.all([
        pagosApi.miSuscripcion(),
        pagosApi.catalogo(idEntrenador),
        pagosApi.misPagos(),
      ]);
      setSuscripcion(resSuscripcion.data || null);
      setPlanes(Array.isArray(resCatalogo.data?.planes) ? resCatalogo.data.planes : []);
      setMetodos(Array.isArray(resCatalogo.data?.metodos) ? resCatalogo.data.metodos : []);
      setTasaCambio(resCatalogo.data?.tasaCambio != null ? Number(resCatalogo.data.tasaCambio) : null);
      setMisPagos(Array.isArray(resPagos.data) ? resPagos.data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar tu información de pagos');
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    const inicializar = async () => {
      setCargando(true);
      setError('');
      let idEntrenador = user?.entrenadorId ?? null;

      try {
        if (!idEntrenador) {
          const resPerfil = await api.get('/auth/me');
          if (cancelado) return;
          setUser((prev) => ({ ...prev, ...resPerfil.data }));
          idEntrenador = resPerfil.data?.entrenadorId ?? null;
        }

        if (!idEntrenador) {
          setSinEntrenador(true);
          return;
        }
        setEntrenadorId(idEntrenador);
        setSinEntrenador(false);
        await cargarDatos(idEntrenador);
      } catch (err) {
        if (!cancelado) {
          setError(err.response?.data?.error || 'No se pudo cargar tu información de pagos');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    inicializar();
    return () => {
      cancelado = true;
    };
  }, []);

  const handlePagoRegistrado = () => {
    if (entrenadorId) cargarDatos(entrenadorId);
  };

  if (user && user.tipo !== 'instruido' && user.rol !== 'instruido') {
    return <Navigate to="/planes" replace />;
  }

  if (cargando) return <Loading text="Cargando tu plan..." />;

  const suscripcionActiva = suscripcion?.activa === true;
  const suscripcionVencida = suscripcion?.vencida === true;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h2 className="page-title">Mi Plan</h2>
          <p className="page-subtitle">Consulta tu mensualidad y realiza tus pagos</p>
        </div>
      </div>

      {error && (
        <Card>
          <div className="empty-state">
            <p className="empty-state-icono" aria-hidden="true">⚠️</p>
            <p className="text-lg text-error text-medium">{error}</p>
          </div>
        </Card>
      )}

      {sinEntrenador ? (
        <Card>
          <EmptyState
            icon="👨‍🏫"
            title="Sin entrenador asignado"
            description="Aún no tienes un entrenador asignado. Cuando te asignen uno podrás ver sus planes aquí."
          />
        </Card>
      ) : (
        <>
          <Card>
            <div className="row-between">
              <div className="row">
                <span className="icono-mediano" aria-hidden="true">
                  {suscripcionActiva ? '✅' : suscripcionVencida ? '⏰' : '📭'}
                </span>
                <div>
                  <h3 className="card-titulo card-titulo-md">
                    {suscripcionActiva ? 'Mensualidad activa' : suscripcionVencida ? 'Mensualidad vencida' : 'Sin mensualidad'}
                  </h3>
                  <p className="page-subtitle">
                    {suscripcionActiva &&
                      `Plan ${suscripcion.plan || ''} · hasta el ${formatearFechaISO(suscripcion.fechaFin)}`}
                    {suscripcionVencida && (suscripcion.mensaje || `Venció el ${formatearFechaISO(suscripcion.fechaFin)}`)}
                    {!suscripcionActiva && !suscripcionVencida && (suscripcion?.mensaje || 'Aún no tienes pagos registrados')}
                  </p>
                </div>
              </div>
              {suscripcionActiva && (
                <div className="text-center">
                  <div className="valor-destacado valor-destacado-exito">
                    {suscripcion.diasRestantes}
                  </div>
                  <div className="text-xs text-muted">
                    {suscripcion.diasRestantes === 1 ? 'día restante' : 'días restantes'}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="stack">
            <h3 className="card-titulo card-titulo-md">Planes disponibles</h3>
            {error && planes.length === 0 ? null : planes.length === 0 ? (
              <Card>
                <EmptyState
                  icon="💳"
                  title="Sin planes publicados"
                  description="Tu entrenador aún no ha publicado planes de mensualidad."
                />
              </Card>
            ) : (
              <div className="grid grid-cols-2">
                {planes.map((plan) => (
                  <Card key={plan.id}>
                    <div className="card-body stack w-full">
                      <strong>{plan.nombre}</strong>
                      {plan.ofrecimiento && (
                        <span className="badge badge-info">
                          {iconoOfrecimiento(plan.ofrecimiento)} {labelOfrecimiento(plan.ofrecimiento)}
                        </span>
                      )}
                      <div>
                        <div className="valor-destacado">
                          {formatUsd(plan.montoUsd)}
                        </div>
                        <div className="text-sm text-muted">
                          ≈ {tasaCambio ? formatBs(plan.montoUsd, tasaCambio) : '—'} · {plan.diasVigencia} días
                        </div>
                      </div>
                      {plan.descripcion && (
                        <p className="text-sm text-muted flex-1">
                          {plan.descripcion}
                        </p>
                      )}
                      <Button className="w-full" onClick={() => setPlanAPagar(plan)} disabled={metodos.length === 0}>
                        Pagar este plan
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card>
            <div className="card-body stack">
              <h3 className="card-titulo card-titulo-md">Mis pagos</h3>
              {misPagos.length === 0 ? (
                <EmptyState
                  icon="🧾"
                  title="Sin pagos registrados"
                  description="Cuando realices un pago aparecerá aquí con su estado."
                />
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Plan</th>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misPagos.map((pago) => (
                        <tr key={pago.id}>
                          <td>{formatearFechaISO(pago.fechaPago)}</td>
                          <td>{pago.plan?.nombre || '-'}</td>
                          <td>{labelTipo(pago.metodo?.tipo)}</td>
                          <td>
                            {formatUsd(pago.montoUsd)}
                            <span className="tabla-subtexto">
                              {formatBs(pago.montoUsd, pago.tasaAplicada)}
                            </span>
                          </td>
                          <td>
                            <EstadoBadge estado={pago.estado} />
                            {pago.estado === 'rechazado' && pago.comentarioRechazo && (
                              <span
                                className="tabla-nota-error"
                                title={pago.comentarioRechazo}
                              >
                                Motivo: {pago.comentarioRechazo}
                              </span>
                            )}
                          </td>
                          <td>
                            <Button variant="secondary" size="sm" onClick={() => setVerComprobanteId(pago.id)}>
                              Ver comprobante
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          <RegistrarPagoModal
            isOpen={planAPagar !== null}
            onClose={() => setPlanAPagar(null)}
            plan={planAPagar}
            metodos={metodos.filter((m) => m.activo)}
            tasaCambio={tasaCambio}
            onRegistrado={handlePagoRegistrado}
          />
        </>
      )}

      <ComprobanteModal
        isOpen={verComprobanteId !== null}
        onClose={() => setVerComprobanteId(null)}
        pagoId={verComprobanteId}
      />
    </div>
  );
}
