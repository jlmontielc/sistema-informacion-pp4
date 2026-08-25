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

  const selectEstilo = {
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
    background: 'var(--color-bg-alt)',
    color: 'var(--color-text)',
    width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Formulario de calculo */}
      <Card
        header={
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Datos para el calculo</h3>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Selector de instruido (solo admin/entrenador) */}
          {esAdminOEntrenador && (
            <div className="field">
              <label className="field-label">Cliente</label>
              <select
                value={instruidoSeleccionado}
                onChange={(e) => setInstruidoSeleccionado(e.target.value)}
                style={selectEstilo}
              >
                <option value="">Seleccionar cliente...</option>
                {instruidos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>
              {instruidos.length === 0 && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  No hay clientes registrados.
                </span>
              )}
            </div>
          )}

          {/* Campos numericos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
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
            <label className="field-label">Sexo</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {SEXOS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSexo(s.value)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: sexo === s.value ? 'var(--color-primary-500)' : 'transparent',
                    color: sexo === s.value ? '#fff' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: sexo === s.value ? 600 : 400,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de actividad */}
          <div className="field">
            <label className="field-label">Nivel de actividad fisica</label>
            <select
              value={nivelActividad}
              onChange={(e) => setNivelActividad(e.target.value)}
              style={selectEstilo}
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
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--color-error-bg, #f8d7da)',
              color: 'var(--color-error, #721c24)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
            }}>
              {error}
            </div>
          )}

          {/* Botones de accion */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
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
