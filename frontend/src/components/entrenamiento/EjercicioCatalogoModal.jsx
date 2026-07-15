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
  const [ejerciciosRaw, setEjerciciosRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [seleccionLocal, setSeleccionLocal] = useState([]);
  const [preview, setPreview] = useState(null);
  const [pagina, setPagina] = useState(1);
  const busquedaDebounced = useDebounce(busqueda, 200);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setPagina(1);
    ejerciciosApi.listar()
      .then((res) => {
        const raw = res.data?.ejercicios || res.data || [];
        setEjerciciosRaw(preComputeTranslations(raw));
      })
      .catch(() => setEjerciciosRaw([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    setSeleccionLocal([...seleccionados]);
  }, [seleccionados, isOpen]);

  useEffect(() => {
    if (!isOpen) setPreview(null);
  }, [isOpen]);

  useEffect(() => {
    setPagina(1);
  }, [busquedaDebounced, filtroGrupo]);

  const seleccionIds = useMemo(() => {
    const set = new Set();
    seleccionLocal.forEach((e) => set.add(e.ejercicio_id));
    return set;
  }, [seleccionLocal]);

  const filtrados = useMemo(() => {
    const term = busquedaDebounced.toLowerCase();
    return ejerciciosRaw.filter((ej) => {
      const matchBusqueda = !term ||
        ej.nombre?.toLowerCase().includes(term) ||
        ej.nombreTraducido?.toLowerCase().includes(term) ||
        ej.targetTraducido?.toLowerCase().includes(term) ||
        ej.instruccionesEs?.toLowerCase().includes(term) ||
        ej.grupoMuscular?.toLowerCase().includes(term);
      const matchGrupo = !filtroGrupo || ej.grupoMuscular === filtroGrupo;
      return matchBusqueda && matchGrupo;
    });
  }, [ejerciciosRaw, busquedaDebounced, filtroGrupo]);

  const visibles = useMemo(() => {
    return filtrados.slice(0, pagina * PAGE_SIZE);
  }, [filtrados, pagina]);

  const hayMas = filtrados.length > visibles.length;

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
    <Modal isOpen={isOpen} onClose={onClose} title="Catálogo de Ejercicios" size="lg">
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
              {visibles.map((ej) => {
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
              {hayMas && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setPagina((p) => p + 1)}
                  style={{ gridColumn: '1 / -1', marginTop: 'var(--space-2)' }}
                >
                  Cargar mas ({filtrados.length - visibles.length} restantes)
                </button>
              )}
            </div>
          )}

          <div style={{
            width: 320,
            minHeight: 350,
            background: 'var(--color-neutral-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {preview ? (
              <>
                {getPreviewUrl(preview) ? (
                  <img
                    src={getPreviewUrl(preview)}
                    alt={preview.nombreTraducido}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 240,
                      objectFit: 'contain',
                      background: '#000',
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-neutral-100)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    <span style={{ fontSize: 48 }}>{GRUPO_EMOJI[preview.grupoMuscular] || '🏋️'}</span>
                    <span style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>Sin imagen</span>
                  </div>
                )}
                <div style={{ padding: 'var(--space-3)', width: '100%' }}>
                  <p style={{
                    fontWeight: 'var(--font-semibold)',
                    fontSize: 'var(--text-sm)',
                    margin: 0,
                    textAlign: 'center',
                  }}>
                    {preview.nombreTraducido}
                  </p>
                  {preview.targetTraducido && (
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      textAlign: 'center',
                      margin: 'var(--space-1) 0 0',
                    }}>
                      {preview.targetTraducido}
                    </p>
                  )}
                  {preview.instruccionesEs && (
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      marginTop: 'var(--space-2)',
                      lineHeight: 'var(--line-height-relaxed)',
                      maxHeight: 80,
                      overflowY: 'auto',
                    }}>
                      {preview.instruccionesEs}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                padding: 'var(--space-4)',
              }}>
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
