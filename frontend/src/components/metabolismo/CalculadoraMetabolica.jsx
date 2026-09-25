import { useState, useEffect, useCallback } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { metabolismoApi } from '../../services/metabolismoApi';
import { instruidosApi } from '../../services/rutinasApi';
import { ResultadoMetabolico } from './ResultadoMetabolico';

const NIVELES_ACTIVIDAD = [
  { value: 'sedentario', label: 'Sedentario (poco o nada de ejercicio)' },
  { value: 'ligero', label: 'Ligero (ejercicio 1-3 dias/semana)' },
  { value: 'moderado', label: 'Moderado (ejercicio 3-5 dias/semana)' },
  { value: 'activo', label: 'Activo (ejercicio 6-7 dias/semana)' },
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

  // Cargar lista de instruidos (solo admin/entrenador)
  useEffect(() => {
    if (!esAdminOEntrenador) return;
    instruidosApi.listar()
      .then((res) => setInstruidos(res.data || []))
      .catch(() => {});
  }, [esAdminOEntrenador]);

  // Rellenar datos del cliente al seleccionarlo
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

    // Validaciones basicas
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
    <div className="stack-lg">
      {/* Formulario de calculo */}
      <Card header={<h3 className="card-titulo card-titulo-md">Datos para el calculo</h3>}>
        <div className="stack">
          {/* Selector de instruido (solo admin/entrenador) */}
          {esAdminOEntrenador && (
            <div className="field">
              <label className="field-label" htmlFor="cliente-metabolismo">Cliente</label>
              <select
                id="cliente-metabolismo"
                value={instruidoSeleccionado}
                onChange={(e) => setInstruidoSeleccionado(e.target.value)}
                className="field-input w-full"
              >
                <option value="">Seleccionar cliente...</option>
                {instruidos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>
              {instruidos.length === 0 && (
                <span className="text-xs text-muted">
                  No hay clientes registrados.
                </span>
              )}
            </div>
          )}

          {/* Campos numericos */}
          <div className="grid grid-cols-3">
            <Input
              label="Peso (kg)"
              name="peso"
              type="number"
              min="1"
              max="500"
              step="0.1"
              placeholder="Ej: 75.5"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
            <Input
              label="Altura (m)"
              name="altura"
              type="number"
              min="0.5"
              max="2.5"
              step="0.01"
              placeholder="Ej: 1.75"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
            />
            <Input
              label="Edad (anos)"
              name="edad"
              type="number"
              min="1"
              max="120"
              placeholder="Ej: 30"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
            />
          </div>

          {/* Sexo */}
          <div className="field">
            <span className="field-label">Sexo</span>
            <div className="chip-group">
              {SEXOS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSexo(s.value)}
                  className={`chip${sexo === s.value ? ' active' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de actividad */}
          <div className="field">
            <label className="field-label" htmlFor="nivel-actividad-metabolismo">
              Nivel de actividad fisica
            </label>
            <select
              id="nivel-actividad-metabolismo"
              value={nivelActividad}
              onChange={(e) => setNivelActividad(e.target.value)}
              className="field-input w-full"
            >
              {NIVELES_ACTIVIDAD.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="alerta alerta-error">
              {error}
            </div>
          )}

          {/* Botones de accion */}
          <div className="form-acciones">
            <Button variant="secondary" onClick={limpiar}>
              Limpiar
            </Button>
            <Button
              variant="primary"
              loading={cargando}
              onClick={calcular}
            >
              Calcular metabolismo
            </Button>
          </div>
        </div>
      </Card>

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
