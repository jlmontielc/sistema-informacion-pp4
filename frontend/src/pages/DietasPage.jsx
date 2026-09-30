import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Icon } from '../components/common/Icon';
import { dietasApi } from '../services/dietasApi';
import { instruidosApi } from '../services/rutinasApi';

/* ---------------------------------------------------------------------------
   Constantes de la vista (los VALUES se envían al backend intactos)
   --------------------------------------------------------------------------- */

const TABS = [
  { key: 'pendientes', label: 'Pendientes de revisión' },
  { key: 'activas', label: 'Activas' },
  { key: 'rechazadas', label: 'Rechazadas' },
];

const PROPUESTOS = [
  { value: 'perder_peso', label: 'Perder peso' },
  { value: 'ganar_musculo', label: 'Ganar músculo' },
  { value: 'mantener', label: 'Mantener' },
];

/* Macros de la tabla: clave con el color M3 asignado a cada uno */
const MACROS = [
  { key: 'proteinas', etiqueta: 'P' },
  { key: 'carbohidratos', etiqueta: 'C' },
  { key: 'grasas', etiqueta: 'G' },
];

/* ---------------------------------------------------------------------------
   Utilidades puras (comentarios en español)
   --------------------------------------------------------------------------- */

/* Devuelve 2 iniciales en mayúsculas (nombre y apellido);
   si solo hay una palabra, una sola letra */
const iniciales = (nombre) => {
  if (typeof nombre !== 'string') return '—';
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '—';
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
};

/* Formatea una fecha ISO como dd/mm/yyyy; sin fecha devuelve guion */
const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const partes = String(fecha).split('T')[0].split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

/* Clase del chip de estado según la decisión y el flag activo */
const claseChipEstado = (decision, activo) => {
  const clases = {
    pendiente: 'dd-chip-estado--pendiente',
    rechazada: 'dd-chip-estado--rechazada',
    modificada: 'dd-chip-estado--modificada',
  };
  if (clases[decision]) return clases[decision];
  return activo ? 'dd-chip-estado--activa' : 'dd-chip-estado--borrador';
};

/* Etiqueta del chip de estado (mismas etiquetas que la vista original) */
const etiquetaEstado = (decision, activo) => {
  const etiquetas = {
    pendiente: 'Pendiente',
    rechazada: 'Rechazada',
    modificada: 'Modificada',
  };
  if (etiquetas[decision]) return etiquetas[decision];
  return activo ? 'Activa' : 'Borrador';
};

/* ---------------------------------------------------------------------------
   Subcomponentes de presentación
   --------------------------------------------------------------------------- */

/* Chip de macronutriente con formato "P: 144g" como la vista original */
function ChipMacro({ macro, valor }) {
  return (
    <span className={`dd-chip-macro dd-chip-macro--${macro.key}`}>
      {macro.etiqueta}: {Number(valor).toFixed(0)}g
    </span>
  );
}

/* Chip de estado de la dieta; solo el chip "activa" lleva punto animado */
function ChipEstado({ decision, activo }) {
  const clase = claseChipEstado(decision, activo);
  return (
    <span className={`dd-chip-estado ${clase}`}>
      {clase === 'dd-chip-estado--activa' && <span className="dd-punto" />}
      {etiquetaEstado(decision, activo)}
    </span>
  );
}

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
      setError(err.response?.data?.error || 'Error al procesar decisión');
    } finally {
      setGuardandoDecision(false);
    }
  };

  if (cargando) return <Loading />;

  return (
    <div className="dd-pagina">
      {/* Cabecera de la página */}
      <header className="dd-seccion dd-cabecera">
        <h1>Dietas</h1>
        <p>Planes alimenticios generados por IA y asignados a clientes</p>
      </header>

      {error && (
        <div className="dd-seccion dd-alerta" role="alert">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="dd-alerta-cerrar"
            aria-label="Cerrar aviso"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Card principal: tabs + tabla de dietas */}
      <section className="dd-seccion dd-card">
        <div className="dd-toolbar">
          <div className="dd-segmentos" role="tablist" aria-label="Filtrar por estado">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`dd-segmento ${tab === t.key ? 'active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {esAdminOEntrenador && (
            <div className="dd-select-cliente">
              <select
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                aria-label="Filtrar por cliente"
              >
                <option value="">Todos los clientes</option>
                {instruidos.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
              <Icon name="next" size={14} className="dd-select-flecha" />
            </div>
          )}
        </div>

        {dietasFiltradas.length === 0 ? (
          /* Estado vacío: sin emojis, solo el icono SVG 'restaurant' */
          <div className="dd-estado">
            <span className="dd-estado-icono" aria-hidden="true">
              <Icon name="restaurant" size={32} />
            </span>
            <h3 className="dd-estado-titulo">Sin dietas</h3>
            <p className="dd-estado-descripcion">
              {tab === 'pendientes'
                ? 'No hay dietas pendientes de revisión. Genera una dieta IA para un cliente.'
                : tab === 'activas'
                  ? 'No hay dietas activas actualmente.'
                  : 'No hay dietas rechazadas.'}
            </p>
          </div>
        ) : (
          /* Tabla: scroll horizontal en móvil vía .table-wrapper */
          <div className="table-wrapper dd-tabla-envoltura">
            <table className="dd-tabla">
              <thead>
                <tr>
                  {esAdminOEntrenador && <th>Cliente</th>}
                  <th>Calorías</th>
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
                          <div className="dd-cliente">
                            <span className="dd-avatar" aria-hidden="true">
                              {iniciales(cliente?.nombre || `Cliente ${dieta.instruidoId}`)}
                            </span>
                            <span className="dd-nombre-cliente">
                              {cliente?.nombre || `Cliente #${dieta.instruidoId}`}
                            </span>
                          </div>
                        </td>
                      )}
                      <td>
                        <span className="dd-calorias">
                          {dieta.objetivoCalorico}
                          <span className="dd-unidad-kcal"> kcal</span>
                        </span>
                      </td>
                      <td>
                        <div className="dd-macros">
                          <ChipMacro macro={MACROS[0]} valor={dieta.proteinas} />
                          <ChipMacro macro={MACROS[1]} valor={dieta.carbohidratos} />
                          <ChipMacro macro={MACROS[2]} valor={dieta.grasas} />
                        </div>
                      </td>
                      <td>
                        <ChipEstado decision={dieta.decision} activo={dieta.activo} />
                      </td>
                      <td>
                        <span className="dd-fecha">
                          {formatearFecha(dieta.fechaInicio || dieta.created_at)}
                        </span>
                      </td>
                      <td>
                        {esAdminOEntrenador && dieta.decision === 'pendiente' && (
                          <div className="dd-acciones">
                            <button
                              type="button"
                              className="dd-boton dd-boton-aceptar"
                              onClick={() => {
                                setModalDecision(dieta);
                                setDecisionForm({ accion: 'aceptada', comentario: '' });
                              }}
                            >
                              Aceptar
                            </button>
                            <button
                              type="button"
                              className="dd-boton dd-boton-modificar"
                              onClick={() => {
                                setModalDecision(dieta);
                                setDecisionForm({ accion: 'modificada', comentario: '' });
                              }}
                            >
                              Modificar
                            </button>
                            <button
                              type="button"
                              className="dd-boton dd-boton-rechazar"
                              onClick={() => {
                                setModalDecision(dieta);
                                setDecisionForm({ accion: 'rechazada', comentario: '' });
                              }}
                            >
                              Rechazar
                            </button>
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
      </section>

      {/* Card de generación IA: solo admin/entrenador */}
      {esAdminOEntrenador && (
        <section className="dd-seccion">
          <div className="dd-card">
            <div className="dd-card-cabecera">
              <h3>
                <Icon name="restaurant" size={20} />
                Generar dieta IA
              </h3>
            </div>
            <div className="dd-card-cuerpo">
              <p className="dd-descripcion-card">
                Selecciona un cliente para generar automáticamente un plan de alimentación
                basado en su perfil metabólico y datos médicos.
              </p>
              <div className="dd-fila-proposito">
                <label className="dd-etiqueta" htmlFor="proposito-dieta">Propósito:</label>
                <div className="dd-select">
                  <select
                    id="proposito-dieta"
                    value={propositoSeleccionado}
                    onChange={(e) => setPropositoSeleccionado(e.target.value)}
                  >
                    {PROPUESTOS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <Icon name="next" size={14} className="dd-select-flecha" />
                </div>
              </div>
              <div className="dd-chips-cliente">
                {instruidos.map((i) => {
                  const cargandoEste = generando && generandoClienteId === i.id;
                  return (
                    <button
                      key={i.id}
                      type="button"
                      className="dd-chip-cliente"
                      disabled={generando}
                      onClick={() => handleGenerar(i.id)}
                    >
                      {cargandoEste && <span className="dd-spinner" aria-hidden="true" />}
                      {i.nombre}
                    </button>
                  );
                })}
                {instruidos.length === 0 && (
                  <p className="dd-previa-cliente">No hay clientes registrados.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal de decisión sobre la dieta */}
      <Modal
        isOpen={!!modalDecision}
        onClose={() => { setModalDecision(null); setDecisionForm({ accion: '', comentario: '' }); }}
        title={`Decisión: Dieta #${modalDecision?.id || ''}`}
        className="modal-dietas"
      >
        <div className="dd-form-decision">
          <div className="dd-campo">
            <span className="dd-etiqueta">Acción</span>
            <div className="dd-chips-accion">
              {[{ valor: 'aceptada' }, { valor: 'modificada' }, { valor: 'rechazada' }].map(({ valor }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setDecisionForm((prev) => ({ ...prev, accion: valor }))}
                  className={`dd-chip-accion dd-chip-accion--${valor}${decisionForm.accion === valor ? ' active' : ''}`}
                  aria-pressed={decisionForm.accion === valor}
                >
                  {valor.charAt(0).toUpperCase() + valor.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="dd-campo">
            <label className="dd-etiqueta" htmlFor="comentario-decision">
              Comentario (opcional)
            </label>
            <textarea
              id="comentario-decision"
              value={decisionForm.comentario}
              onChange={(e) => setDecisionForm((prev) => ({ ...prev, comentario: e.target.value }))}
              rows={3}
              className="dd-textarea"
              placeholder="Motivo de la decisión..."
            />
          </div>

          <div className="dd-acciones-modal">
            <button
              type="button"
              className="dd-boton-modal dd-boton-modal-cancelar"
              onClick={() => { setModalDecision(null); setDecisionForm({ accion: '', comentario: '' }); }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="dd-boton-modal dd-boton-modal-confirmar"
              disabled={!decisionForm.accion || guardandoDecision}
              onClick={handleDecision}
            >
              {guardandoDecision && <span className="dd-spinner" aria-hidden="true" />}
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
