import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { dietasApi } from '../services/dietasApi';
import { instruidosApi } from '../services/rutinasApi';

const TABS = [
  { key: 'pendientes', label: 'Pendientes de revision' },
  { key: 'activas', label: 'Activas' },
  { key: 'rechazadas', label: 'Rechazadas' },
];

const PROPUESTOS = [
  { value: 'perder_peso', label: 'Perder peso' },
  { value: 'ganar_musculo', label: 'Ganar musculo' },
  { value: 'mantener', label: 'Mantener' },
];

const ACCIONES_DECISION = [
  { valor: 'aceptada', chip: 'chip-success' },
  { valor: 'modificada', chip: 'chip-warning' },
  { valor: 'rechazada', chip: 'chip-danger' },
];

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const partes = String(fecha).split('T')[0].split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const EstadoDieta = ({ decision, activo }) => {
  const clases = {
    pendiente: 'badge-warning',
    aprobada: 'badge-success',
    rechazada: 'badge-danger',
    modificada: 'badge-info',
  };
  const etiquetas = {
    pendiente: 'Pendiente',
    aprobada: 'Activa',
    rechazada: 'Rechazada',
    modificada: 'Modificada',
  };
  const clase = clases[decision] || 'badge-neutral';
  return (
    <span className={`badge ${clase}`}>
      {etiquetas[decision] || (activo ? 'Activa' : 'Borrador')}
    </span>
  );
};

const MacroBadge = ({ label, value, unit = 'g' }) => (
  <span className="badge badge-neutral">
    {label}: {value}{unit}
  </span>
);

export default function DietasPage() {
  const { user } = useAuth();
  const esAdminOEntrenador = user?.tipo === 'administrador' || user?.tipo === 'entrenador';

  const [dietas, setDietas] = useState([]);
  const [instruidos, setInstruidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [tab, setTab] = useState('pendientes');
  const [filtroCliente, setFiltroCliente] = useState('');

  const [generando, setGenerando] = useState(false);
  const [generandoClienteId, setGenerandoClienteId] = useState(null);
  const [propositoSeleccionado, setPropositoSeleccionado] = useState('mantener');

  const [modalDecision, setModalDecision] = useState(null);
  const [decisionForm, setDecisionForm] = useState({ accion: '', comentario: '' });
  const [guardandoDecision, setGuardandoDecision] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const dietasRes = await dietasApi.listar();
      setDietas(dietasRes.data);

      // Solo admin/entrenador cargan la lista de instruidos
      if (esAdminOEntrenador) {
        try {
          const instruidosRes = await instruidosApi.listar();
          setInstruidos(instruidosRes.data);
        } catch {
          // Silenciar: la lista de instruidos es auxiliar
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  }, [esAdminOEntrenador]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const dietasFiltradas = dietas.filter((d) => {
    if (filtroCliente && d.instruidoId !== Number(filtroCliente)) return false;
    if (tab === 'pendientes') return d.decision === 'pendiente';
    if (tab === 'activas') return d.activo;
    if (tab === 'rechazadas') return d.decision === 'rechazada';
    return true;
  });

  const handleGenerar = async (instruidoId) => {
    try {
      setGenerando(true);
      setGenerandoClienteId(instruidoId);
      await dietasApi.generar(instruidoId, { proposito: propositoSeleccionado });
      await cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al generar dieta';
      setError(msg);
    } finally {
      setGenerando(false);
      setGenerandoClienteId(null);
    }
  };

  const handleDecision = async () => {
    if (!modalDecision || !decisionForm.accion) return;
    try {
      setGuardandoDecision(true);
      await dietasApi.decidir(modalDecision.id, {
        accion: decisionForm.accion,
        comentario: decisionForm.comentario || undefined,
      });
      setModalDecision(null);
      setDecisionForm({ accion: '', comentario: '' });
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar decision');
    } finally {
      setGuardandoDecision(false);
    }
  };

  if (cargando) return <Loading />;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Dietas</h1>
          <p className="page-subtitle">
            Planes alimenticios generados por IA y asignados a clientes
          </p>
        </div>
      </div>

      {error && (
        <div className="alerta alerta-error">
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError('')}
            className="alerta-cerrar"
            aria-label="Cerrar aviso"
          >
            x
          </button>
        </div>
      )}

      <Card>
        <div className="toolbar">
          <div className="tabs-container tabs-inline">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`tab-button ${tab === t.key ? 'active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {esAdminOEntrenador && (
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="field-input select-filtro"
              aria-label="Filtrar por cliente"
            >
              <option value="">Todos los clientes</option>
              {instruidos.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          )}
        </div>

        {dietasFiltradas.length === 0 ? (
          <EmptyState
            icon="🥗"
            title="Sin dietas"
            description={
              tab === 'pendientes'
                ? 'No hay dietas pendientes de revision. Genera una dieta IA para un cliente.'
                : tab === 'activas'
                  ? 'No hay dietas activas actualmente.'
                  : 'No hay dietas rechazadas.'
            }
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {esAdminOEntrenador && <th>Cliente</th>}
                  <th>Calorias</th>
                  <th>Macros (P / C / G)</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dietasFiltradas.map((dieta) => {
                  const cliente = instruidos.find((i) => i.id === dieta.instruidoId);
                  return (
                    <tr key={dieta.id}>
                      {esAdminOEntrenador && (
                        <td>
                          {cliente?.nombre || `Cliente #${dieta.instruidoId}`}
                        </td>
                      )}
                      <td>
                        <strong>{dieta.objetivoCalorico}</strong> kcal
                      </td>
                      <td>
                        <div className="row">
                          <MacroBadge label="P" value={Number(dieta.proteinas).toFixed(0)} />
                          <MacroBadge label="C" value={Number(dieta.carbohidratos).toFixed(0)} />
                          <MacroBadge label="G" value={Number(dieta.grasas).toFixed(0)} />
                        </div>
                      </td>
                      <td>
                        <EstadoDieta decision={dieta.decision} activo={dieta.activo} />
                      </td>
                      <td>
                        {formatearFecha(dieta.fechaInicio || dieta.created_at)}
                      </td>
                      <td>
                        {esAdminOEntrenador && dieta.decision === 'pendiente' && (
                          <div className="row">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => {
                                setModalDecision(dieta);
                                setDecisionForm({ accion: 'aceptada', comentario: '' });
                              }}
                            >
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => {
                                setModalDecision(dieta);
                                setDecisionForm({ accion: 'modificada', comentario: '' });
                              }}
                            >
                              Modificar
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setModalDecision(dieta);
                                setDecisionForm({ accion: 'rechazada', comentario: '' });
                              }}
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {esAdminOEntrenador && (
        <Card>
          <div className="card-header">
            <h3 className="card-titulo card-titulo-md">Generar dieta IA</h3>
          </div>
          <div className="card-body stack">
            <p className="text-sm text-muted">
              Selecciona un cliente para generar automaticamente un plan de alimentacion basado en su perfil metabolico y datos medicos.
            </p>
            <div className="row">
              <label className="field-label" htmlFor="proposito-dieta">Proposito:</label>
              <select
                id="proposito-dieta"
                value={propositoSeleccionado}
                onChange={(e) => setPropositoSeleccionado(e.target.value)}
                className="field-input"
              >
                {PROPUESTOS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="row">
              {instruidos.map((i) => (
                <Button
                  key={i.id}
                  variant="outline"
                  size="sm"
                  loading={generando && generandoClienteId === i.id}
                  disabled={generando}
                  onClick={() => handleGenerar(i.id)}
                >
                  {i.nombre}
                </Button>
              ))}
            </div>
            {instruidos.length === 0 && (
              <p className="text-sm text-muted">
                No hay clientes registrados.
              </p>
            )}
          </div>
        </Card>
      )}

      <Modal
        isOpen={!!modalDecision}
        onClose={() => { setModalDecision(null); setDecisionForm({ accion: '', comentario: '' }); }}
        title={`Decision: Dieta #${modalDecision?.id || ''}`}
      >
        <div className="stack">
          <div className="field">
            <span className="field-label">Accion</span>
            <div className="chip-group">
              {ACCIONES_DECISION.map(({ valor, chip }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setDecisionForm((prev) => ({ ...prev, accion: valor }))}
                  className={`chip ${chip}${decisionForm.accion === valor ? ' active' : ''}`}
                >
                  {valor.charAt(0).toUpperCase() + valor.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="comentario-decision">
              Comentario (opcional)
            </label>
            <textarea
              id="comentario-decision"
              value={decisionForm.comentario}
              onChange={(e) => setDecisionForm((prev) => ({ ...prev, comentario: e.target.value }))}
              rows={3}
              className="field-input field-textarea"
              placeholder="Motivo de la decision..."
            />
          </div>

          <div className="form-acciones">
            <Button
              variant="secondary"
              onClick={() => { setModalDecision(null); setDecisionForm({ accion: '', comentario: '' }); }}
            >
              Cancelar
            </Button>
            <Button
              variant={decisionForm.accion === 'aceptada' ? 'success' : decisionForm.accion === 'modificada' ? 'warning' : 'danger'}
              loading={guardandoDecision}
              disabled={!decisionForm.accion}
              onClick={handleDecision}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
