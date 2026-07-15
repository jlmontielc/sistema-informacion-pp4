import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { DiaSelector, obtenerNombreDia } from './DiaSelector';
import { EjercicioCard } from './EjercicioCard';
import { EjercicioCatalogoModal } from './EjercicioCatalogoModal';
import { plantillasApi } from '../../services/rutinasApi';

const EXERCISE_NAME_MAP = {
  'barbell': 'Barra', 'dumbbell': 'Mancuerna', 'cable': 'Polea',
  'band': 'Banda', 'kettlebell': 'Pesa rusa', 'bench': 'Banco',
  'press': 'Press', 'curl': 'Curl', 'row': 'Remo', 'squat': 'Sentadilla',
  'deadlift': 'Peso muerto', 'pull': 'Jalón', 'push': 'Empuje',
  'raise': 'Elevación', 'extension': 'Extensión', 'dip': 'Fondos',
  'plank': 'Plancha', 'sit-up': 'Abdominal', 'push up': 'Flexión',
  'pull up': 'Dominada', 'leg press': 'Prensa de piernas',
  'chest': 'Pecho', 'back': 'Espalda', 'shoulder': 'Hombro',
  'biceps': 'Bíceps', 'triceps': 'Tríceps', 'abs': 'Abdomen',
  'glutes': 'Glúteos', 'hamstrings': 'Isquiotibiales',
  'calves': 'Pantorrillas', 'forearms': 'Antebrazos', 'neck': 'Cuello',
  'seated': 'Sentado', 'standing': 'De pie', 'lying': 'Acostado',
  'incline': 'Inclinado', 'wide': 'Ancho', 'close': 'Cerrado',
  'alternating': 'Alternado', 'single': 'Unilateral', 'arm': 'Brazo',
  'leg': 'Pierna', 'front': 'Frontal', 'lateral': 'Lateral',
  'overhead': 'Sobre cabeza', 'hammer': 'Martillo', 'romanian': 'Rumano',
  'bulgarian': 'Búlgaro', 'sumo': 'Sumo', 'body weight': 'Peso corporal',
  'weighted': 'Con peso', 'assisted': 'Asistido', 'ez bar': 'Barra Z',
  'bar': 'Barra', 'upright': 'Vertical', 'bent': 'Inclinado',
  'close grip': 'Agarre cerrado', 'wide grip': 'Agarre ancho',
  'neutral grip': 'Agarre neutro', 'preacher': 'Predicador',
  'concentration': 'Concentración', 'reverse': 'Inverso', 'wrist': 'Muñeca',
  'skull crusher': 'Rompecráneos', 'french press': 'Press francés',
  'face pull': 'Jalón a la cara', 'shrug': 'Encogimiento',
  'pullover': 'Pullover', 'fly': 'Apertura', 'crunch': 'Abdominal',
  'lunge': 'Zancada', 'jump': 'Salto', 'burpee': 'Burpee',
  'mountain climber': 'Escalador', 'high knees': 'Rodillas altas',
  'butt kicks': 'Talones al glúteo', 'jumping jack': 'Polichino',
  'squat jump': 'Sentadilla con salto', 'tuck jump': 'Salto recogido',
  'box jump': 'Salto a caja', 'depth jump': 'Salto desde altura',
  'broad jump': 'Salto largo', 'vertical jump': 'Salto vertical',
  'broad jump': 'Salto largo', 'depth jump': 'Salto desde altura',
  'vertical jump': 'Salto vertical', 'broad jump': 'Salto largo',
};

function traducirNombre(nombre) {
  if (!nombre) return '';
  let result = nombre;
  const entries = Object.entries(EXERCISE_NAME_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [en, es] of entries) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, es);
  }
  return result;
}

const TIPOS = [
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'resistencia', label: 'Resistencia' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'funcional', label: 'Funcional' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
];

const OBJETIVOS = [
  { value: 'perdida_peso', label: 'Perdida de peso' },
  { value: 'ganancia_muscular', label: 'Ganancia muscular' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'rendimiento', label: 'Rendimiento' },
  { value: 'rehabilitacion', label: 'Rehabilitacion' },
];

const NIVELES = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

const defaultForm = {
  nombre: '',
  descripcion: '',
  tipo: 'hipertrofia',
  objetivo: '',
  nivelDificultad: '',
  diasSemana: [],
  frecuenciaSemanal: 3,
  duracionSemanas: 8,
};

export function PlantillaForm({ isOpen, onClose, plantilla, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState({});
  const [diaActivo, setDiaActivo] = useState(null);
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    if (plantilla) {
      setForm({
        nombre: plantilla.nombre || '',
        descripcion: plantilla.descripcion || '',
        tipo: plantilla.tipo || 'hipertrofia',
        objetivo: plantilla.objetivo || '',
        nivelDificultad: plantilla.nivelDificultad || '',
        diasSemana: plantilla.diasSemana
          ? Object.keys(plantilla.diasSemana).map(Number)
          : [],
        frecuenciaSemanal: plantilla.frecuenciaSemanal || 3,
        duracionSemanas: plantilla.duracionSemanas || 8,
      });
      const agrupados = {};
      if (plantilla.ejercicios) {
        plantilla.ejercicios.forEach((ej) => {
          if (!agrupados[ej.dia]) agrupados[ej.dia] = [];
          agrupados[ej.dia].push({ ...ej });
        });
      }
      setEjerciciosPorDia(agrupados);
    } else {
      setForm(defaultForm);
      setEjerciciosPorDia({});
    }
    setDiaActivo(null);
    setPaso(1);
    setError(null);
  }, [isOpen, plantilla]);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleDia = (num) => {
    setForm((prev) => {
      const nuevos = prev.diasSemana.includes(num)
        ? prev.diasSemana.filter((d) => d !== num)
        : [...prev.diasSemana, num].sort();
      return { ...prev, diasSemana: nuevos, frecuenciaSemanal: nuevos.length };
    });
  };

  const handleEjerciciosSeleccionados = (seleccionados) => {
    if (diaActivo == null) return;
    setEjerciciosPorDia((prev) => {
      const existentes = prev[diaActivo] || [];
      const nuevos = seleccionados.map((s, idx) => {
        const existente = existentes.find((e) => e.ejercicio_id === s.ejercicio_id);
        return {
          ...s,
          orden: existente?.orden || idx + 1,
          series: existente?.series || s.series,
          repeticiones: existente?.repeticiones || s.repeticiones,
          carga_kg: existente?.carga_kg || s.carga_kg,
          descanso_segundos: existente?.descanso_segundos || s.descanso_segundos,
          notas: existente?.notas || s.notas,
        };
      });
      return { ...prev, [diaActivo]: nuevos };
    });
  };

  const eliminarEjercicioDelDia = (dia, idx) => {
    setEjerciciosPorDia((prev) => {
      const copia = [...(prev[dia] || [])];
      copia.splice(idx, 1);
      return { ...prev, [dia]: copia };
    });
  };

  const handleCambioEjercicio = (dia, idx, nuevoEjercicio) => {
    setEjerciciosPorDia((prev) => {
      const copia = [...(prev[dia] || [])];
      copia[idx] = nuevoEjercicio;
      return { ...prev, [dia]: copia };
    });
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (form.diasSemana.length === 0) {
      setError('Selecciona al menos un dia de la semana');
      return;
    }

    setSaving(true);
    setError(null);

    const ejerciciosFlat = [];
    form.diasSemana.forEach((dia) => {
      (ejerciciosPorDia[dia] || []).forEach((ej, idx) => {
        ejerciciosFlat.push({
          ejercicio_id: ej.ejercicio_id,
          dia,
          orden: idx + 1,
          series: ej.series,
          repeticiones: ej.repeticiones,
          carga_kg: ej.carga_kg || 0,
          descanso_segundos: ej.descanso_segundos || 60,
          notas: ej.notas || '',
        });
      });
    });

    const diasSemanaMap = {};
    form.diasSemana.forEach((d) => {
      diasSemanaMap[String(d)] = { dia_semana: d, nombre: obtenerNombreDia(d) };
    });

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      tipo: form.tipo,
      ejercicios: ejerciciosFlat,
      dias_semana: diasSemanaMap,
      frecuencia_semanal: form.frecuenciaSemanal,
      duracion_semanas: form.duracionSemanas || undefined,
      objetivo: form.objetivo || undefined,
      nivel_dificultad: form.nivelDificultad || undefined,
    };

    try {
      if (plantilla?.id) {
        await plantillasApi.actualizar(plantilla.id, payload);
      } else {
        await plantillasApi.crear(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  const totalEjercicios = Object.values(ejerciciosPorDia).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plantilla ? 'Editar Plantilla' : 'Crear Plantilla'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}>
            {error}
          </div>
        )}

        <div className="tabs-container">
          <button
            type="button"
            className={`tab-button ${paso === 1 ? 'active' : ''}`}
            onClick={() => setPaso(1)}
          >
            1. Datos basicos
          </button>
          <button
            type="button"
            className={`tab-button ${paso === 2 ? 'active' : ''}`}
            onClick={() => setPaso(2)}
            disabled={form.diasSemana.length === 0}
          >
            2. Ejercicios
          </button>
        </div>

        {paso === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Nombre de la plantilla"
              name="nombre"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Hipertrofia Full Body"
            />

            <div className="field">
              <label className="field-label">Descripcion</label>
              <textarea
                className="field-input"
                rows={2}
                value={form.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Descripcion breve de la plantilla..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="field">
                <label className="field-label">Tipo</label>
                <select
                  className="field-input"
                  value={form.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label">Objetivo</label>
                <select
                  className="field-input"
                  value={form.objetivo}
                  onChange={(e) => handleChange('objetivo', e.target.value)}
                >
                  <option value="">Sin objetivo</option>
                  {OBJETIVOS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="field">
                <label className="field-label">Nivel</label>
                <select
                  className="field-input"
                  value={form.nivelDificultad}
                  onChange={(e) => handleChange('nivelDificultad', e.target.value)}
                >
                  <option value="">Sin nivel</option>
                  {NIVELES.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Duracion (semanas)"
                name="duracionSemanas"
                type="number"
                min={1}
                value={form.duracionSemanas}
                onChange={(e) => handleChange('duracionSemanas', parseInt(e.target.value) || 1)}
              />

              <Input
                label="Frecuencia"
                name="frecuenciaSemanal"
                type="number"
                min={1}
                max={7}
                value={form.frecuenciaSemanal}
                onChange={(e) => handleChange('frecuenciaSemanal', parseInt(e.target.value) || 1)}
                disabled
              />
            </div>

            <div className="field">
              <label className="field-label">Dias de la semana</label>
              <DiaSelector
                seleccionados={form.diasSemana}
                onToggle={toggleDia}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={() => setPaso(2)}
                disabled={form.diasSemana.length === 0}
              >
                Siguiente: Ejercicios
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {totalEjercicios} ejercicio{totalEjercicios !== 1 ? 's' : ''} configurado{totalEjercicios !== 1 ? 's' : ''}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPaso(1)}
              >
                Volver a datos basicos
              </button>
            </div>

            <DiaSelector
              seleccionados={form.diasSemana}
              onToggle={(dia) => setDiaActivo(diaActivo === dia ? null : dia)}
            />

            {diaActivo != null && (
              <div style={{
                padding: 'var(--space-4)',
                background: 'var(--color-neutral-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>
                    Ejercicios del {obtenerNombreDia(diaActivo)}
                  </h4>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setCatalogoOpen(true)}
                  >
                    + Agregar Ejercicio
                  </button>
                </div>

                {(ejerciciosPorDia[diaActivo] || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', padding: 'var(--space-4)' }}>
                    No hay ejercicios para este dia. Haz clic en "Agregar Ejercicio" para comenzar.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {ejerciciosPorDia[diaActivo].map((ej, idx) => (
                      <EjercicioCard
                        key={`${ej.ejercicio_id}-${idx}`}
                        ejercicio={ej}
                        nombreEjercicio={traducirNombre(ej.nombre)}
                        editable
                        onCambio={(nuevo) => handleCambioEjercicio(diaActivo, idx, nuevo)}
                        onEliminar={() => eliminarEjercicioDelDia(diaActivo, idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {diaActivo == null && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', padding: 'var(--space-6)' }}>
                Selecciona un dia para configurar sus ejercicios
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <Button onClick={handleGuardar} loading={saving}>
                {plantilla ? 'Guardar Cambios' : 'Crear Plantilla'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <EjercicioCatalogoModal
        isOpen={catalogoOpen}
        onClose={() => setCatalogoOpen(false)}
        onSelect={handleEjerciciosSeleccionados}
        seleccionados={ejerciciosPorDia[diaActivo] || []}
      />
    </Modal>
  );
}
