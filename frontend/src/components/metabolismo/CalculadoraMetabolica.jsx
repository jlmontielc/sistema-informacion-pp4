import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../common/Icon';
import { metabolismoApi } from '../../services/metabolismoApi';
import { instruidosApi } from '../../services/rutinasApi';
import { ResultadoMetabolico } from './ResultadoMetabolico';

/* ---------------------------------------------------------------------------
   Constantes de la vista (los VALUES se envían al backend intactos)
   --------------------------------------------------------------------------- */

const NIVELES_ACTIVIDAD = [
  { value: 'sedentario', label: 'Sedentario (poco o nada de ejercicio)' },
  { value: 'ligero', label: 'Ligero (ejercicio 1-3 días/semana)' },
  { value: 'moderado', label: 'Moderado (ejercicio 3-5 días/semana)' },
  { value: 'activo', label: 'Activo (ejercicio 6-7 días/semana)' },
  { value: 'muy_activo', label: 'Muy activo (ejercicio intenso diario)' },
];

const SEXOS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
];

export function CalculadoraMetabolica({ rol }) {
  const esAdminOEntrenador = rol === 'administrador' || rol === 'entrenador';

  const [instruidos, setInstruidos] = useState([]);
  const [instruidoSeleccionado, setInstruidoSeleccionado] = useState('');

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('masculino');
  const [nivelActividad, setNivelActividad] = useState('sedentario');

  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Cargar lista de instruidos (solo admin/entrenador, fallo silencioso)
  useEffect(() => {
    if (!esAdminOEntrenador) return;
    instruidosApi.listar()
      .then((res) => setInstruidos(res.data || []))
      .catch(() => {});
  }, [esAdminOEntrenador]);

  // Rellenar datos del cliente al seleccionarlo; limpiar si se vacía la selección
  useEffect(() => {
    if (instruidoSeleccionado) {
      const cliente = instruidos.find((i) => i.id === Number(instruidoSeleccionado));
      if (cliente) {
        setPeso(cliente.peso ?? '');
        setAltura(cliente.altura ?? '');
        setEdad(cliente.edad ?? '');
        setSexo(cliente.sexo ?? 'masculino');
        setNivelActividad(cliente.nivelActividad ?? 'sedentario');
      }
    } else {
      setPeso('');
      setAltura('');
      setEdad('');
      setSexo('masculino');
      setNivelActividad('sedentario');
    }
  }, [instruidoSeleccionado, instruidos]);

  const calcular = useCallback(async () => {
    setError('');
    setResultado(null);

    // Validaciones básicas
    if (!peso || !altura || !edad) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (esAdminOEntrenador && !instruidoSeleccionado) {
      setError('Selecciona un cliente para calcular.');
      return;
    }

    const data = {
      peso: Number(peso),
      altura: Number(altura),
      edad: Number(edad),
      sexo,
      nivelActividad,
    };

    // Para admin/entrenador: enviar clienteId
    if (esAdminOEntrenador) {
      data.clienteId = Number(instruidoSeleccionado);
    }

    try {
      setCargando(true);
      const res = await metabolismoApi.calcular(data);
      setResultado(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al calcular metabolismo');
    } finally {
      setCargando(false);
    }
  }, [peso, altura, edad, sexo, nivelActividad, esAdminOEntrenador, instruidoSeleccionado]);

  const limpiar = () => {
    setPeso('');
    setAltura('');
    setEdad('');
    setSexo('masculino');
    setNivelActividad('sedentario');
    setInstruidoSeleccionado('');
    setResultado(null);
    setError('');
  };

  return (
    <div className="dm-seccion dm-contenido">
      {/* Card del formulario de cálculo */}
      <div className="dm-card">
        <div className="dm-card-cabecera">
          <h3>
            <Icon name="monitoring" size={20} />
            Datos para el cálculo
          </h3>
        </div>
        <div className="dm-card-cuerpo">
          {/* Selector de instruido (solo admin/entrenador) */}
          {esAdminOEntrenador && (
            <div className="dm-campo">
              <label className="dm-etiqueta" htmlFor="cliente-metabolismo">Cliente</label>
              <div className="dm-select">
                <select
                  id="cliente-metabolismo"
                  value={instruidoSeleccionado}
                  onChange={(e) => setInstruidoSeleccionado(e.target.value)}
                >
                  <option value="">Seleccionar cliente...</option>
                  {instruidos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre}
                    </option>
                  ))}
                </select>
                <Icon name="next" size={14} className="dm-select-flecha" />
              </div>
              {instruidos.length === 0 && (
                <span className="dm-aviso">No hay clientes registrados.</span>
              )}
            </div>
          )}

          {/* Campos numéricos: estructura nativa (.field/.field-input heredadas
              del tema compartido, tema oscuro aplicado por cascada desde .dm-pagina) */}
          <div className="dm-grid-datos">
            <div className="field">
              <label className="field-label" htmlFor="peso">Peso (kg)</label>
              <input
                id="peso"
                name="peso"
                type="number"
                className="field-input"
                min="1"
                max="500"
                step="0.1"
                placeholder="Ej: 75.5"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="altura">Altura (m)</label>
              <input
                id="altura"
                name="altura"
                type="number"
                className="field-input"
                min="0.5"
                max="2.5"
                step="0.01"
                placeholder="Ej: 1.75"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="edad">Edad (años)</label>
              <input
                id="edad"
                name="edad"
                type="number"
                className="field-input"
                min="1"
                max="120"
                placeholder="Ej: 30"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              />
            </div>
          </div>

          {/* Sexo como segmented control */}
          <div className="dm-campo">
            <span className="dm-etiqueta" id="sexo-metabolismo">Sexo</span>
            <div className="dm-segmentos" role="group" aria-labelledby="sexo-metabolismo">
              {SEXOS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSexo(s.value)}
                  className={`dm-segmento${sexo === s.value ? ' active' : ''}`}
                  aria-pressed={sexo === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de actividad física */}
          <div className="dm-campo">
            <label className="dm-etiqueta" htmlFor="nivel-actividad-metabolismo">
              Nivel de actividad física
            </label>
            <div className="dm-select">
              <select
                id="nivel-actividad-metabolismo"
                value={nivelActividad}
                onChange={(e) => setNivelActividad(e.target.value)}
              >
                {NIVELES_ACTIVIDAD.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
              <Icon name="next" size={14} className="dm-select-flecha" />
            </div>
          </div>

          {/* Error de validación o de servidor */}
          {error && (
            <div className="dm-alerta" role="alert">{error}</div>
          )}

          {/* Botones de acción */}
          <div className="dm-form-acciones">
            <button
              type="button"
              className="dm-boton dm-boton-secundario"
              onClick={limpiar}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="dm-boton dm-boton-primario"
              onClick={calcular}
              disabled={cargando}
              aria-busy={cargando}
            >
              {cargando && <span className="dm-spinner" aria-hidden="true" />}
              {cargando ? 'Calculando...' : 'Calcular metabolismo'}
            </button>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <ResultadoMetabolico
          datos={resultado}
          datosEntrada={{ peso: Number(peso), altura: Number(altura), edad: Number(edad), sexo, nivelActividad }}
        />
      )}
    </div>
  );
}
