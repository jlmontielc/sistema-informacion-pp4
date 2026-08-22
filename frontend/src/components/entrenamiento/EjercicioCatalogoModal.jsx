import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { ejerciciosApi } from '../../services/rutinasApi';

const EXERCISES_BASE_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';
const PAGE_SIZE = 50;

const GRUPOS_MUSCULARES = [
  'Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas',
  'Cintura', 'Gemelos', 'Antebrazos', 'Cardio', 'Cuello',
];

const TARGET_MAP = {
  'biceps': 'Bíceps', 'triceps': 'Tríceps', 'quads': 'Cuádriceps',
  'lats': 'Dorsales', 'upper back': 'Espalda alta', 'spine': 'Columna',
  'pectorals': 'Pecho', 'delts': 'Hombros', 'calves': 'Pantorrillas',
  'abs': 'Abdomen', 'glutes': 'Glúteos', 'hamstrings': 'Isquiotibiales',
  'forearms': 'Antebrazos', 'traps': 'Trapecios',
  'levator scapulae': 'Trapecio superior', 'serratus anterior': 'Serrato anterior',
  'adductors': 'Aductores', 'abductors': 'Abductores',
  'cardiovascular system': 'Cardio',
};

const NAME_MAP_ENTRIES = [
  ['barbell', 'Barra'], ['dumbbell', 'Mancuerna'], ['cable', 'Polea'],
  ['band', 'Banda'], ['kettlebell', 'Pesa rusa'], ['bench', 'Banco'],
  ['press', 'Press'], ['curl', 'Curl'], ['row', 'Remo'],
  ['squat', 'Sentadilla'], ['deadlift', 'Peso muerto'], ['pull', 'Jalón'],
  ['push', 'Empuje'], ['lunge', 'Zancada'], ['raise', 'Elevación'],
  ['extension', 'Extensión'], ['fly', 'Apertura'], ['dip', 'Fondos'],
  ['plank', 'Plancha'], ['crunch', 'Abdominal'], ['sit-up', 'Abdominal'],
  ['push up', 'Flexión'], ['pull up', 'Dominada'], ['chin up', 'Dominada supina'],
  ['leg press', 'Prensa de piernas'], ['chest', 'Pecho'], ['back', 'Espalda'],
  ['shoulder', 'Hombro'], ['biceps', 'Bíceps'], ['triceps', 'Tríceps'],
  ['abs', 'Abdomen'], ['glutes', 'Glúteos'], ['hamstrings', 'Isquiotibiales'],
  ['quadriceps', 'Cuádriceps'], ['calves', 'Pantorrillas'],
  ['forearms', 'Antebrazos'], ['neck', 'Cuello'], ['seated', 'Sentado'],
  ['standing', 'De pie'], ['lying', 'Acostado'], ['incline', 'Inclinado'],
  ['wide', 'Ancho'], ['close', 'Cerrado'], ['alternating', 'Alternado'],
  ['single', 'Unilateral'], ['arm', 'Brazo'], ['leg', 'Pierna'],
  ['front', 'Frontal'], ['lateral', 'Lateral'], ['overhead', 'Sobre cabeza'],
  ['hammer', 'Martillo'], ['romanian', 'Rumano'], ['bulgarian', 'Búlgaro'],
  ['sumo', 'Sumo'], ['body weight', 'Peso corporal'], ['weighted', 'Con peso'],
  ['assisted', 'Asistido'], ['ez bar', 'Barra Z'], ['bar', 'Barra'],
  ['upright', 'Vertical'], ['bent', 'Inclinado'], ['close grip', 'Agarre cerrado'],
  ['wide grip', 'Agarre ancho'], ['neutral grip', 'Agarre neutro'],
  ['preacher', 'Predicador'], ['concentration', 'Concentración'],
  ['reverse', 'Inverso'], ['wrist', 'Muñeca'], ['skull crusher', 'Rompecráneos'],
  ['french press', 'Press francés'], ['kickback', 'Patada'],
  ['lateral raise', 'Elevación lateral'], ['front raise', 'Elevación frontal'],
  ['face pull', 'Jalón a la cara'], ['shrug', 'Encogimiento'],
  ['lat pulldown', 'Jalón al pecho'], ['seated row', 'Remo sentado'],
  ['pullover', 'Pullover'], ['sit up', 'Abdominal'], ['leg raise', 'Elevación de piernas'],
  ['toe touch', 'Toque de puntas'], ['heel touch', 'Toque de talones'],
  ['jumping jack', 'Polichino'], ['burpee', 'Burpee'], ['mountain climber', 'Escalador'],
  ['high knees', 'Rodillas altas'], ['butt kicks', 'Talones al glúteo'],
  ['box jump', 'Salto a caja'], ['squat jump', 'Sentadilla con salto'],
  ['lunge walk', 'Zancada caminando'], ['step up', 'Subida al cajón'],
  ['good morning', 'Buenos días'], ['stiff', 'Peso muerto rumano'],
  ['conventional', 'Convencional'], ['trap bar', 'Barra trapezoidal'],
  ['t bar', 'Barra T'], ['smith', 'Smith'], ['machine', 'Máquina'],
  ['lever', 'Palanca'], ['sled', 'Trineo'], ['rope', 'Cuerda'],
  ['plate', 'Disco'], ['ball', 'Balón'], ['roller', 'Rodillo'],
  ['foam', 'Espuma'], ['mat', 'Colchoneta'], ['stick', 'Palo'],
  ['bodyweight', 'Peso corporal'], ['free weight', 'Peso libre'],
  ['resistance band', 'Banda elástica'], ['medicine ball', 'Balón medicinal'],
];

const compiledRegexes = NAME_MAP_ENTRIES.map(([en, es]) => ({
  regex: new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
  es,
}));

function traducirTarget(target) {
  if (!target) return '';
  return TARGET_MAP[target.toLowerCase().trim()] || target;
}

function traducirNombre(nombre) {
  if (!nombre) return '';
  let result = nombre;
  for (const { regex, es } of compiledRegexes) {
    regex.lastIndex = 0;
    result = result.replace(regex, es);
  }
  return result;
}

function preComputeTranslations(ejercicios) {
  return ejercicios.map((ej) => ({
    ...ej,
    nombreTraducido: traducirNombre(ej.nombre),
    targetTraducido: traducirTarget(ej.target),
  }));
}

const GRUPO_EMOJI = {
  'Pecho': '💪', 'Espalda': '🔙', 'Hombros': '🏋️', 'Brazos': '💪',
  'Piernas': '🦵', 'Cintura': '🔥', 'Gemelos': '🦵', 'Antebrazos': '💪',
  'Cardio': '🏃', 'Cuello': '🏋️',
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function EjercicioCatalogoModal({ isOpen, onClose, onSelect, seleccionados = [] }) {
  const [itemsRaw, setItemsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [seleccionLocal, setSeleccionLocal] = useState([]);
  const [preview, setPreview] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalServer, setTotalServer] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);
  const busquedaDebounced = useDebounce(busqueda, 200);

  const peticionIdRef = useRef(0);
  const cargandoRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const idPeticion = ++peticionIdRef.current;
    setLoading(true);
    setCargandoMas(false);
    cargandoRef.current = false;
    setItemsRaw([]);
    setPaginaActual(1);
    setTotalPaginas(1);
    setTotalServer(0);
    ejerciciosApi.listar({
      pagina: 1,
      limite: PAGE_SIZE,
      busqueda: busquedaDebounced,
      grupoMuscular: filtroGrupo || undefined,
    })
      .then((res) => {
        if (peticionIdRef.current !== idPeticion) return;
        const raw = res.data?.ejercicios || [];
        setTotalPaginas(res.data?.totalPaginas || 1);
        setTotalServer(res.data?.total ?? raw.length);
        setItemsRaw(preComputeTranslations(raw));
      })
      .catch(() => {
        if (peticionIdRef.current !== idPeticion) return;
        setItemsRaw([]);
        setTotalPaginas(1);
        setTotalServer(0);
      })
      .finally(() => {
        if (peticionIdRef.current === idPeticion) setLoading(false);
      });
  }, [isOpen, busquedaDebounced, filtroGrupo]);

  const cargarMas = useCallback(async () => {
    if (loading || cargandoRef.current || paginaActual >= totalPaginas) return;
    const idPeticion = ++peticionIdRef.current;
    const siguiente = paginaActual + 1;
    cargandoRef.current = true;
    setCargandoMas(true);
    try {
      const res = await ejerciciosApi.listar({
        pagina: siguiente,
        limite: PAGE_SIZE,
        busqueda: busquedaDebounced,
        grupoMuscular: filtroGrupo || undefined,
      });
      if (peticionIdRef.current !== idPeticion) return;
      const nuevos = preComputeTranslations(res.data?.ejercicios || []);
      setTotalPaginas(res.data?.totalPaginas || totalPaginas);
      setTotalServer(res.data?.total ?? totalServer);
      setPaginaActual(siguiente);
      setItemsRaw((prev) => {
        const idsExistentes = new Set(prev.map((e) => e.id));
        return [...prev, ...nuevos.filter((e) => !idsExistentes.has(e.id))];
      });
    } catch {
      // error silencioso: se puede reintentar con el botón o el scroll
    } finally {
      cargandoRef.current = false;
      if (peticionIdRef.current === idPeticion) setCargandoMas(false);
    }
  }, [loading, paginaActual, totalPaginas, totalServer, busquedaDebounced, filtroGrupo]);

  const cargarMasRef = useRef(cargarMas);
  useEffect(() => {
    cargarMasRef.current = cargarMas;
  });

  useEffect(() => {
    setSeleccionLocal([...seleccionados]);
  }, [seleccionados, isOpen]);

  useEffect(() => {
    if (!isOpen) setPreview(null);
  }, [isOpen]);

  const seleccionIds = useMemo(() => {
    const set = new Set();
    seleccionLocal.forEach((e) => set.add(e.ejercicio_id));
    return set;
  }, [seleccionLocal]);

  const filtrados = useMemo(() => {
    const term = busquedaDebounced.toLowerCase();
    return itemsRaw.filter((ej) => {
      const matchBusqueda = !term ||
        ej.nombre?.toLowerCase().includes(term) ||
        ej.nombreTraducido?.toLowerCase().includes(term) ||
        ej.targetTraducido?.toLowerCase().includes(term) ||
        ej.instruccionesEs?.toLowerCase().includes(term) ||
        ej.grupoMuscular?.toLowerCase().includes(term);
      const matchGrupo = !filtroGrupo || ej.grupoMuscular === filtroGrupo;
      return matchBusqueda && matchGrupo;
    });
  }, [itemsRaw, busquedaDebounced, filtroGrupo]);

  const hayMasPaginas = paginaActual < totalPaginas;

  useEffect(() => {
    if (!isOpen || loading || cargandoMas || !hayMasPaginas) return undefined;
    const nodo = sentinelRef.current;
    if (!nodo) return undefined;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) cargarMasRef.current();
      },
      { root: null, rootMargin: '200px' }
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [isOpen, loading, cargandoMas, hayMasPaginas, cargarMas]);

  const toggleSeleccion = useCallback((ejercicio) => {
    setSeleccionLocal((prev) => {
      const idx = prev.findIndex((e) => e.ejercicio_id === ejercicio.id);
      if (idx >= 0) {
        return prev.filter((_, i) => i !== idx);
      }
      return [...prev, {
        ejercicio_id: ejercicio.id,
        nombre: ejercicio.nombre,
        series: 3,
        repeticiones: 12,
        carga_kg: 0,
        descanso_segundos: 60,
        notas: '',
      }];
    });
  }, []);

  const handlePreview = useCallback((ejercicio) => {
    setPreview((prev) => prev?.id === ejercicio.id ? null : ejercicio);
  }, []);

  const handleEditarSeleccion = useCallback((idx, campo, valor) => {
    setSeleccionLocal((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
  }, []);

  const handleConfirmar = useCallback(() => {
    onSelect?.(seleccionLocal);
    onClose();
  }, [seleccionLocal, onSelect, onClose]);

  const getPreviewUrl = useCallback((ej) => {
    const raw = ej.gifUrl || ej.imagenUrl || null;
    if (!raw) return null;
    if (raw.startsWith('http')) return raw;
    return EXERCISES_BASE_URL + raw;
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catálogo de Ejercicios" size="xl">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="filtros-bar">
          <input
            type="text"
            className="field-input"
            placeholder="Buscar ejercicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: 1, maxWidth: 300 }}
          />
          <select
            className="field-input"
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
          >
            <option value="">Todos los grupos</option>
            {GRUPOS_MUSCULARES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', minHeight: 0 }}>
          {loading ? (
            <div style={{ flex: 1 }}><Loading text="Cargando ejercicios..." /></div>
          ) : filtrados.length === 0 ? (
            <div style={{ flex: 1 }}>
              <EmptyState
                icon="🔍"
                title="Sin resultados"
                description="No se encontraron ejercicios con los filtros aplicados."
              />
            </div>
          ) : (
            <div className="catalogo-grid" style={{ flex: 1, maxHeight: 450 }}>
              {filtrados.map((ej) => {
                const seleccionado = seleccionIds.has(ej.id);
                const estaEnPreview = preview?.id === ej.id;
                return (
                  <div
                    key={ej.id}
                    className={`catalogo-item ${seleccionado ? 'seleccionado' : ''} ${estaEnPreview ? 'catalogo-item-preview' : ''}`}
                    onClick={() => toggleSeleccion(ej)}
                    onMouseEnter={() => handlePreview(ej)}
                  >
                    <div className="catalogo-item-name">
                      {seleccionado && '✓ '}{ej.nombreTraducido}
                    </div>
                    <div className="catalogo-item-info">
                      {ej.grupoMuscular && <span>{ej.grupoMuscular}</span>}
                      {ej.targetTraducido && <span>{ej.targetTraducido}</span>}
                      {ej.equipoNecesario && <span>{ej.equipoNecesario}</span>}
                    </div>
                  </div>
                );
              })}
              {cargandoMas && (
                <div style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                }}>
                  Cargando más ejercicios...
                </div>
              )}
              {!cargandoMas && hayMasPaginas && (
                <button
                  className="btn btn-secondary"
                  onClick={cargarMas}
                  style={{ gridColumn: '1 / -1', marginTop: 'var(--space-2)' }}
                >
                  Cargar mas ({Math.max(totalServer - filtrados.length, 0)} restantes)
                </button>
              )}
              {!cargandoMas && hayMasPaginas && (
                <div ref={sentinelRef} aria-hidden="true" style={{ gridColumn: '1 / -1', height: 1 }} />
              )}
            </div>
          )}

          <div className="catalogo-sidebar">
            {preview ? (
              <>
                {getPreviewUrl(preview) ? (
                  <img
                    src={getPreviewUrl(preview)}
                    alt={preview.nombreTraducido}
                    loading="lazy"
                    className="catalogo-sidebar-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="catalogo-sidebar-no-img">
                    <span style={{ fontSize: 48 }}>{GRUPO_EMOJI[preview.grupoMuscular] || '🏋️'}</span>
                    <span style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>Sin imagen</span>
                  </div>
                )}
                <div className="catalogo-sidebar-info">
                  <p className="catalogo-sidebar-name">{preview.nombreTraducido}</p>
                  {preview.targetTraducido && (
                    <p className="catalogo-sidebar-target">{preview.targetTraducido}</p>
                  )}
                  {preview.instruccionesEs && (
                    <p className="catalogo-sidebar-instr">{preview.instruccionesEs}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="catalogo-sidebar-empty">
                <span style={{ fontSize: 48, opacity: 0.3 }}>🏋️</span>
                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                  Pasa el mouse sobre un ejercicio para ver su GIF
                </p>
              </div>
            )}
          </div>
        </div>

        {seleccionLocal.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-4)',
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-3)',
              color: 'var(--color-text)',
            }}>
              Ejercicios seleccionados ({seleccionLocal.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: 200, overflowY: 'auto' }}>
              {seleccionLocal.map((ej, idx) => (
                <div key={ej.ejercicio_id} className="ejercicio-edit-row">
                  <span className="ejercicio-edit-nombre">{traducirNombre(ej.nombre)}</span>
                  <div className="ejercicio-edit-fields">
                    <label>
                      <span>Ser</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={ej.series}
                        onChange={(e) => handleEditarSeleccion(idx, 'series', parseInt(e.target.value) || 1)}
                      />
                    </label>
                    <label>
                      <span>Reps</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={ej.repeticiones}
                        onChange={(e) => handleEditarSeleccion(idx, 'repeticiones', parseInt(e.target.value) || 1)}
                      />
                    </label>
                    <label>
                      <span>Desc</span>
                      <input
                        type="number"
                        min={0}
                        max={600}
                        step={5}
                        value={ej.descanso_segundos}
                        onChange={(e) => handleEditarSeleccion(idx, 'descanso_segundos', parseInt(e.target.value) || 0)}
                      />
                      <span className="ejercicio-edit-unit">s</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmar}
            disabled={seleccionLocal.length === 0}
          >
            Seleccionar ({seleccionLocal.length})
          </button>
        </div>
      </div>
    </Modal>
  );
}
