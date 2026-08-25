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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2>Mi Plan</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Consulta tu mensualidad y realiza tus pagos
        </p>
      </div>

      {error && (
        <Card>
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
            <p style={{ fontSize: 48, margin: 0 }}>⚠️</p>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', marginTop: 'var(--space-3)' }}>
              {error}
            </p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 32 }}>{suscripcionActiva ? '✅' : suscripcionVencida ? '⏰' : '📭'}</span>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {suscripcionActiva ? 'Mensualidad activa' : suscripcionVencida ? 'Mensualidad vencida' : 'Sin mensualidad'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {suscripcionActiva &&
                      `Plan ${suscripcion.plan || ''} · hasta el ${formatearFechaISO(suscripcion.fechaFin)}`}
                    {suscripcionVencida && (suscripcion.mensaje || `Venció el ${formatearFechaISO(suscripcion.fechaFin)}`)}
                    {!suscripcionActiva && !suscripcionVencida && (suscripcion?.mensaje || 'Aún no tienes pagos registrados')}
                  </p>
                </div>
              </div>
              {suscripcionActiva && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-success)' }}>
                    {suscripcion.diasRestantes}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {suscripcion.diasRestantes === 1 ? 'día restante' : 'días restantes'}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div>
            <h3>Planes disponibles</h3>
            {error && planes.length === 0 ? null : planes.length === 0 ? (
              <Card>
                <EmptyState
                  icon="💳"
                  title="Sin planes publicados"
                  description="Tu entrenador aún no ha publicado planes de mensualidad."
                />
              </Card>
            ) : (
              <div style={gridCardsStyle}>
                {planes.map((plan) => (
                  <Card key={plan.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%' }}>
                      <strong>{plan.nombre}</strong>
                      {plan.ofrecimiento && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          background: 'var(--color-info-bg, #d1ecf1)',
                          color: 'var(--color-info, #0c5460)',
                          alignSelf: 'flex-start',
                        }}>
                          {iconoOfrecimiento(plan.ofrecimiento)} {labelOfrecimiento(plan.ofrecimiento)}
                        </span>
                      )}
                      <div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
                          {formatUsd(plan.montoUsd)}
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                          ≈ {tasaCambio ? formatBs(plan.montoUsd, tasaCambio) : '—'} · {plan.diasVigencia} días
                        </div>
                      </div>
                      {plan.descripcion && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0, flexGrow: 1 }}>
                          {plan.descripcion}
                        </p>
                      )}
                      <Button onClick={() => setPlanAPagar(plan)} disabled={metodos.length === 0}>
                        Pagar este plan
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card>
            <h3 style={{ marginTop: 0 }}>Mis pagos</h3>
            {misPagos.length === 0 ? (
              <EmptyState
                icon="🧾"
                title="Sin pagos registrados"
                description="Cuando realices un pago aparecerá aquí con su estado."
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tablaEstilo}>
                  <thead>
                    <tr>
                      <th style={celdaEstilo}>Fecha</th>
                      <th style={celdaEstilo}>Plan</th>
                      <th style={celdaEstilo}>Método</th>
                      <th style={celdaEstilo}>Monto</th>
                      <th style={celdaEstilo}>Estado</th>
                      <th style={celdaEstilo}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misPagos.map((pago) => (
                      <tr key={pago.id}>
                        <td style={celdaEstilo}>{formatearFechaISO(pago.fechaPago)}</td>
                        <td style={celdaEstilo}>{pago.plan?.nombre || '-'}</td>
                        <td style={celdaEstilo}>{labelTipo(pago.metodo?.tipo)}</td>
                        <td style={celdaEstilo}>
                          {formatUsd(pago.montoUsd)}
                          <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                            {formatBs(pago.montoUsd, pago.tasaAplicada)}
                          </span>
                        </td>
                        <td style={celdaEstilo}>
                          <EstadoBadge estado={pago.estado} />
                          {pago.estado === 'rechazado' && pago.comentarioRechazo && (
                            <span
                              style={{
                                display: 'block',
                                marginTop: 4,
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-error)',
                                maxWidth: 200,
                              }}
                              title={pago.comentarioRechazo}
                            >
                              Motivo: {pago.comentarioRechazo}
                            </span>
                          )}
                        </td>
                        <td style={celdaEstilo}>
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
