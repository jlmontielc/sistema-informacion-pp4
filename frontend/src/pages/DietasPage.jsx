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

const tablaEstilo = { width: '100%', borderCollapse: 'collapse' };
const celdaEstilo = {
  padding: 'var(--space-3)',
  borderBottom: '1px solid var(--color-border)',
  textAlign: 'left',
  fontSize: 'var(--text-sm)',
};

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const partes = String(fecha).split('T')[0].split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const EstadoDieta = ({ decision, activo }) => {
  const colores = {
    pendiente: { bg: 'var(--color-warning-bg, #fff3cd)', color: 'var(--color-warning, #856404)' },
    aprobada: { bg: 'var(--color-success-bg, #d4edda)', color: 'var(--color-success, #155724)' },
    rechazada: { bg: 'var(--color-danger-bg, #f8d7da)', color: 'var(--color-danger, #721c24)' },
    modificada: { bg: 'var(--color-info-bg, #d1ecf1)', color: 'var(--color-info, #0c5460)' },
  };
  const etiquetas = {
    pendiente: 'Pendiente',
    aprobada: 'Activa',
    rechazada: 'Rechazada',
    modificada: 'Modificada',
  };
  const estilo = colores[decision] || colores.pendiente;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        background: estilo.bg,
        color: estilo.color,
      }}
    >
      {etiquetas[decision] || (activo ? 'Activa' : 'Borrador')}
    </span>
  );
};

const MacroBadge = ({ label, value, unit = 'g' }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '6px',
      fontSize: 'var(--text-xs)',
      background: 'var(--color-bg-secondary, #f0f2f5)',
      marginRight: 'var(--space-2)',
      fontWeight: 500,
    }}
  >
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1>Dietas</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
            Planes alimenticios generados por IA y asignados a clientes
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: 'var(--space-3)',
          background: 'var(--color-danger-bg, #f8d7da)',
          color: 'var(--color-danger, #721c24)',
          borderRadius: 'var(--radius)',
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
        }}>
          {error}
          <button
            onClick={() => setError('')}
            style={{ marginLeft: 'var(--space-2)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            x
          </button>
        </div>
      )}

      <Card>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  background: tab === t.key ? 'var(--color-primary, #007bff)' : 'transparent',
                  color: tab === t.key ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: tab === t.key ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {esAdminOEntrenador && (
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                minWidth: 180,
              }}
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
          <table style={tablaEstilo}>
            <thead>
              <tr>
                {esAdminOEntrenador && <th style={celdaEstilo}>Cliente</th>}
                <th style={celdaEstilo}>Calorias</th>
                <th style={celdaEstilo}>Macros (P / C / G)</th>
                <th style={celdaEstilo}>Estado</th>
                <th style={celdaEstilo}>Fecha</th>
                <th style={celdaEstilo}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dietasFiltradas.map((dieta) => {
                const cliente = instruidos.find((i) => i.id === dieta.instruidoId);
                return (
                  <tr key={dieta.id}>
                    {esAdminOEntrenador && (
                      <td style={celdaEstilo}>
                        {cliente?.nombre || `Cliente #${dieta.instruidoId}`}
                      </td>
                    )}
                    <td style={celdaEstilo}>
                      <strong>{dieta.objetivoCalorico}</strong> kcal
                    </td>
                    <td style={celdaEstilo}>
                      <MacroBadge label="P" value={Number(dieta.proteinas).toFixed(0)} />
                      <MacroBadge label="C" value={Number(dieta.carbohidratos).toFixed(0)} />
                      <MacroBadge label="G" value={Number(dieta.grasas).toFixed(0)} />
                    </td>
                    <td style={celdaEstilo}>
                      <EstadoDieta decision={dieta.decision} activo={dieta.activo} />
                    </td>
                    <td style={celdaEstilo}>
                      {formatearFecha(dieta.fechaInicio || dieta.created_at)}
                    </td>
                    <td style={celdaEstilo}>
                      {esAdminOEntrenador && dieta.decision === 'pendiente' && (
                        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
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
        )}
      </Card>

      {esAdminOEntrenador && (
        <Card style={{ marginTop: 'var(--space-4)' }}>
        <div className="card-header">
          <h3 style={{ margin: 0 }}>Generar dieta IA</h3>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
            Selecciona un cliente para generar automaticamente un plan de alimentacion basado en su perfil metabolico y datos medicos.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Proposito:</label>
            <select
              value={propositoSeleccionado}
              onChange={(e) => setPropositoSeleccionado(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {PROPUESTOS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
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
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-1)' }}>
              Accion
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['aceptada', 'modificada', 'rechazada'].map((accion) => (
                <button
                  key={accion}
                  onClick={() => setDecisionForm((prev) => ({ ...prev, accion }))}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)',
                    background: decisionForm.accion === accion
                      ? accion === 'aceptada' ? '#28a745' : accion === 'modificada' ? '#ffc107' : '#dc3545'
                      : 'transparent',
                    color: decisionForm.accion === accion ? '#fff' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: decisionForm.accion === accion ? 600 : 400,
                  }}
                >
                  {accion.charAt(0).toUpperCase() + accion.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-1)' }}>
              Comentario (opcional)
            </label>
            <textarea
              value={decisionForm.comentario}
              onChange={(e) => setDecisionForm((prev) => ({ ...prev, comentario: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                resize: 'vertical',
              }}
              placeholder="Motivo de la decision..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
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
