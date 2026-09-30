import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { Icon } from '../components/common/Icon';
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

  const iconoSuscripcion = suscripcionActiva ? 'check' : suscripcionVencida ? 'clock' : 'receipt';
  const claseSuscripcion = suscripcionActiva
    ? 'pg-suscripcion-icono--activa'
    : suscripcionVencida
    ? 'pg-suscripcion-icono--vencida'
    : '';

  return (
    <div className="pg-pagina">
      {/* Cabecera */}
      <div className="pg-seccion pg-cabecera">
        <div className="pg-cabecera-texto">
          <h1 className="pg-titulo">Mi Plan</h1>
          <p className="pg-subtitulo">Consulta tu mensualidad y realiza tus pagos</p>
        </div>
      </div>

      {error && (
        <div className="pg-seccion pg-card">
          <div className="pg-estado">
            <div className="pg-estado-icono pg-estado-icono--error">
              <Icon name="close" size={32} />
            </div>
            <h2 className="pg-estado-titulo">Error</h2>
            <p className="pg-estado-descripcion">{error}</p>
          </div>
        </div>
      )}

      {sinEntrenador ? (
        <div className="pg-seccion pg-card">
          <div className="pg-estado">
            <div className="pg-estado-icono">
              <Icon name="user" size={32} />
            </div>
            <h3 className="pg-estado-titulo">Sin entrenador asignado</h3>
            <p className="pg-estado-descripcion">
              Aún no tienes un entrenador asignado. Cuando te asignen uno podrás ver sus planes aquí.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Estado de la suscripción */}
          <div className="pg-seccion pg-card">
            <div className="pg-suscripcion">
              <div className="pg-suscripcion-principal">
                <div className={`pg-suscripcion-icono ${claseSuscripcion}`} aria-hidden="true">
                  <Icon name={iconoSuscripcion} size={26} />
                </div>
                <div className="pg-suscripcion-info">
                  <h2 className="pg-suscripcion-titulo">
                    {suscripcionActiva ? 'Mensualidad activa' : suscripcionVencida ? 'Mensualidad vencida' : 'Sin mensualidad'}
                  </h2>
                  <p className="pg-suscripcion-detalle">
                    {suscripcionActiva &&
                      `Plan ${suscripcion.plan || ''} · hasta el ${formatearFechaISO(suscripcion.fechaFin)}`}
                    {suscripcionVencida && (suscripcion.mensaje || `Venció el ${formatearFechaISO(suscripcion.fechaFin)}`)}
                    {!suscripcionActiva && !suscripcionVencida && (suscripcion?.mensaje || 'Aún no tienes pagos registrados')}
                  </p>
                </div>
              </div>
              {suscripcionActiva && (
                <div className="pg-suscripcion-dias">
                  <span className="pg-valor pg-valor--exito">{suscripcion.diasRestantes}</span>
                  <span className="pg-suscripcion-dias-label">
                    {suscripcion.diasRestantes === 1 ? 'día restante' : 'días restantes'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Planes disponibles */}
          <div className="pg-seccion">
            <h2 className="pg-titulo-seccion">Planes disponibles</h2>
          </div>
          {error && planes.length === 0 ? null : planes.length === 0 ? (
            <div className="pg-seccion pg-card">
              <div className="pg-estado">
                <div className="pg-estado-icono">
                  <Icon name="creditcard" size={32} />
                </div>
                <h3 className="pg-estado-titulo">Sin planes publicados</h3>
                <p className="pg-estado-descripcion">
                  Tu entrenador aún no ha publicado planes de mensualidad.
                </p>
              </div>
            </div>
          ) : (
            <div className="pg-seccion pg-grid pg-grid--dos">
              {planes.map((plan) => (
                <div key={plan.id} className="pg-card">
                  <div className="pg-card-cuerpo pg-plan-cuerpo">
                    <p className="pg-plan-nombre">{plan.nombre}</p>
                    {plan.ofrecimiento && (
                      <span className="pg-chip-ofrecimiento">
                        <Icon name={plan.ofrecimiento === 'dietas' ? 'apple' : 'dumbbell'} size={12} />
                        {plan.ofrecimiento === 'ambos' && <Icon name="apple" size={12} />}
                        {labelOfrecimiento(plan.ofrecimiento)}
                      </span>
                    )}
                    <div>
                      <div className="pg-valor">{formatUsd(plan.montoUsd)}</div>
                      <p className="pg-plan-subtexto">
                        ≈ {tasaCambio ? formatBs(plan.montoUsd, tasaCambio) : '—'} · {plan.diasVigencia} días
                      </p>
                    </div>
                    {plan.descripcion && (
                      <p className="pg-plan-descripcion">{plan.descripcion}</p>
                    )}
                    <Button className="w-full" variant="primary" onClick={() => setPlanAPagar(plan)} disabled={metodos.length === 0}>
                      Pagar este plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mis pagos */}
          <div className="pg-seccion pg-card">
            <div className="pg-card-cabecera">
              <h2 className="pg-card-titulo">
                <Icon name="history" size={20} className="pg-icono" />
                Mis pagos
              </h2>
            </div>
            {misPagos.length === 0 ? (
              <div className="pg-estado">
                <div className="pg-estado-icono">
                  <Icon name="receipt" size={32} />
                </div>
                <h3 className="pg-estado-titulo">Sin pagos registrados</h3>
                <p className="pg-estado-descripcion">
                  Cuando realices un pago aparecerá aquí con su estado.
                </p>
              </div>
            ) : (
              <div className="pg-tabla-scroll">
                <table className="pg-tabla">
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
