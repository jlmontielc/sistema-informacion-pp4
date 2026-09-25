import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { DiaSelector } from '../entrenamiento/DiaSelector';
import api from '../../services/api';
import { labelObjetivo, labelNivelExperiencia } from '../../utils/constants';

const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

const sexoLabels = {
  masculino: 'Masculino',
  femenino: 'Femenino',
};

const CAMPOS_MEDICOS = [
  { name: 'alergias', label: 'Alergias' },
  { name: 'intolerancias', label: 'Intolerancias' },
  { name: 'lesiones', label: 'Lesiones' },
  { name: 'condicionesPreexistentes', label: 'Condiciones preexistentes' },
  { name: 'medicacionActual', label: 'Medicación actual' },
  { name: 'observaciones', label: 'Observaciones' },
];

export function MiPerfil({ perfil, onActualizar }) {
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [perfilMedico, setPerfilMedico] = useState(null);
  const [editandoMedico, setEditandoMedico] = useState(false);
  const [datosMedicos, setDatosMedicos] = useState({});
  const [guardandoMedico, setGuardandoMedico] = useState(false);
  const [errorMedico, setErrorMedico] = useState(null);
  const [mostrarMedicos, setMostrarMedicos] = useState(false);

  useEffect(() => {
    if (perfil.tipo === 'instruido') {
      api.get('/instruidos/yo/perfil-medico')
        .then(res => setPerfilMedico(res.data))
        .catch(() => {});
    }
  }, [perfil.tipo]);

  const iniciarEdicion = () => {
    setDatos({
      nombre: perfil.nombre || '',
      email: perfil.email || '',
      especialidad: perfil.especialidad || '',
      edad: perfil.edad || '',
      peso: perfil.peso || '',
      altura: perfil.altura || '',
      sexo: perfil.sexo || '',
      nivelActividad: perfil.nivelActividad || '',
      propositoEntrenamiento: perfil.propositoEntrenamiento || '',
      nivelExperiencia: perfil.nivelExperiencia || '',
      diasSemana: Array.isArray(perfil.diasSemana) ? perfil.diasSemana : [],
      contrasena: '',
      contrasenaActual: '',
    });
    setEditando(true);
    setError(null);
    setSuccess(null);
  };

  const cancelar = () => {
    setEditando(false);
    setError(null);
  };

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleToggleDia = (dia) => {
    const actuales = datos.diasSemana || [];
    const nuevos = actuales.includes(dia)
      ? actuales.filter((d) => d !== dia)
      : [...actuales, dia].sort((a, b) => a - b);
    setDatos({ ...datos, diasSemana: nuevos });
  };

  const guardar = async () => {
    if (datos.contrasena && datos.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const payload = { ...datos };
      if (!payload.contrasena) delete payload.contrasena;
      if (!payload.contrasenaActual) delete payload.contrasenaActual;
      if (!payload.nombre) delete payload.nombre;
      if (!payload.email) delete payload.email;
      if (!payload.especialidad) delete payload.especialidad;
      if (!payload.edad) delete payload.edad;
      if (!payload.peso) delete payload.peso;
      if (!payload.altura) delete payload.altura;
      if (!payload.sexo) delete payload.sexo;
      if (!payload.nivelActividad) delete payload.nivelActividad;
      if (!payload.propositoEntrenamiento) delete payload.propositoEntrenamiento;
      if (!payload.nivelExperiencia) delete payload.nivelExperiencia;
      if (perfil.tipo === 'instruido') {
        const diasSeleccionados = Array.isArray(payload.diasSemana) ? payload.diasSemana : [];
        if (diasSeleccionados.length === 0) {
          setError('Selecciona al menos un día disponible');
          setGuardando(false);
          return;
        }
        payload.diasDisponibles = diasSeleccionados.length;
        payload.diasSemana = diasSeleccionados;
      } else {
        delete payload.diasSemana;
      }
      if (payload.edad) payload.edad = Number(payload.edad);
      if (payload.peso) payload.peso = Number(payload.peso);
      if (payload.altura) payload.altura = Number(payload.altura);
      const res = await api.put('/auth/profile', payload);
      onActualizar(res.data);
      setSuccess('Cambios guardados correctamente');
      setEditando(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicionMedico = () => {
    const inicial = {};
    CAMPOS_MEDICOS.forEach(({ name }) => {
      inicial[name] = (perfilMedico && perfilMedico[name]) || '';
    });
    setDatosMedicos(inicial);
    setEditandoMedico(true);
    setErrorMedico(null);
  };

  const cancelarEdicionMedico = () => {
    setEditandoMedico(false);
    setErrorMedico(null);
  };

  const handleChangeMedico = (e) => {
    setDatosMedicos({ ...datosMedicos, [e.target.name]: e.target.value });
  };

  const guardarMedico = async () => {
    setGuardandoMedico(true);
    setErrorMedico(null);
    try {
      const payload = {};
      CAMPOS_MEDICOS.forEach(({ name }) => {
        payload[name] = datosMedicos[name] || '';
      });
      const res = await api.put('/instruidos/yo/perfil-medico', payload);
      setPerfilMedico(res.data);
      setEditandoMedico(false);
      setSuccess('Datos médicos guardados correctamente');
    } catch (err) {
      setErrorMedico(err.response?.data?.error || 'Error al guardar datos médicos');
    } finally {
      setGuardandoMedico(false);
    }
  };

  if (editando) {
    return (
      <Card header="Editar Mi Perfil">
        <div className="stack">
          <div className="datos-grid">
            <Field label="Nombre" name="nombre" value={datos.nombre} onChange={handleChange} />
            <Field label="Email" name="email" type="email" value={datos.email} onChange={handleChange} />
            {perfil.rol === 'entrenador' && (
              <Field label="Especialidad" name="especialidad" value={datos.especialidad} onChange={handleChange} />
            )}
          </div>
          {perfil.tipo === 'instruido' && (
            <div className="datos-grid">
              <Field label="Edad" name="edad" type="number" value={datos.edad} onChange={handleChange} />
              <Field label="Peso (kg)" name="peso" type="number" step="0.01" value={datos.peso} onChange={handleChange} />
              <Field label="Altura (m)" name="altura" type="number" step="0.01" value={datos.altura} onChange={handleChange} />
              <SelectField label="Sexo" name="sexo" value={datos.sexo} onChange={handleChange} options={sexoLabels} />
              <SelectField label="Nivel de actividad" name="nivelActividad" value={datos.nivelActividad} onChange={handleChange} options={nivelLabels} />
              <SelectField label="Propósito de entrenamiento" name="propositoEntrenamiento" value={datos.propositoEntrenamiento} onChange={handleChange} options={{ perdida_peso: 'Perder peso', ganancia_muscular: 'Ganar masa muscular', mantenimiento: 'Mantenimiento / Salud y bienestar', rendimiento: 'Rendimiento deportivo', rehabilitacion: 'Rehabilitación' }} />
              <SelectField label="Nivel de experiencia" name="nivelExperiencia" value={datos.nivelExperiencia} onChange={handleChange} options={{ principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }} />
              <div className="field grid-full">
                <span className="field-label">Días disponibles para entrenar</span>
                <DiaSelector seleccionados={datos.diasSemana || []} onToggle={handleToggleDia} />
                <p className="text-xs text-muted">
                  Has seleccionado {(datos.diasSemana || []).length} {(datos.diasSemana || []).length === 1 ? 'día' : 'días'}
                </p>
              </div>
            </div>
          )}
          {(perfil.tipo === 'instruido' || perfil.rol === 'entrenador') && (
            <div className="datos-grid seccion-dividida">
              <Field label="Nueva contraseña (opcional)" name="contrasena" type="password" value={datos.contrasena} onChange={handleChange} minLength="8" />
              {datos.contrasena && datos.contrasena.length < 8 && (
                <p className="field-error">Mínimo 8 caracteres</p>
              )}
              {datos.contrasena && (
                <Field label="Contraseña actual (requerida)" name="contrasenaActual" type="password" value={datos.contrasenaActual} onChange={handleChange} />
              )}
            </div>
          )}
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="form-acciones">
            <Button variant="secondary" onClick={cancelar}>Cancelar</Button>
            <Button variant="primary" loading={guardando} onClick={guardar}>Guardar</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      {success && (
        <div className="alerta alerta-success">
          <span aria-hidden="true">✅</span>
          <span>{success}</span>
        </div>
      )}
    <Card header="Mi Perfil">
      <div className="stack">
        <div className="datos-grid">
          <InfoField label="Nombre" value={perfil.nombre} />
          <InfoField label="Email" value={perfil.email} />
          {perfil.rol && perfil.tipo !== 'instruido' && <InfoField label="Rol" value={perfil.rol} />}
          {perfil.especialidad && <InfoField label="Especialidad" value={perfil.especialidad} />}
        </div>
        {perfil.tipo === 'instruido' && (
          <div className="datos-grid seccion-dividida">
            <InfoField label="Edad" value={perfil.edad ? `${perfil.edad} años` : '—'} />
            <InfoField label="Peso" value={perfil.peso ? `${perfil.peso} kg` : '—'} />
            <InfoField label="Altura" value={perfil.altura ? `${perfil.altura} m` : '—'} />
            <InfoField label="Sexo" value={sexoLabels[perfil.sexo] || '—'} />
            <InfoField label="Nivel de actividad" value={nivelLabels[perfil.nivelActividad] || '—'} />
            <div className="dato">
              <p className="dato-label">Días disponibles</p>
              {Array.isArray(perfil.diasSemana) && perfil.diasSemana.length > 0 ? (
                <DiaSelector modo="vista" seleccionados={perfil.diasSemana} />
              ) : (
                <p className="dato-valor">{perfil.diasDisponibles ? `${perfil.diasDisponibles} días/semana` : '—'}</p>
              )}
            </div>
            <InfoField label="Propósito" value={perfil.propositoEntrenamiento ? labelObjetivo(perfil.propositoEntrenamiento) : '—'} />
            <InfoField label="Nivel de experiencia" value={perfil.nivelExperiencia ? labelNivelExperiencia(perfil.nivelExperiencia) : '—'} />
            <InfoField label="Fecha de registro" value={perfil.fechaRegistro || '—'} />
          </div>
        )}
        <div className="form-acciones">
          <Button variant="primary" onClick={iniciarEdicion}>Editar perfil</Button>
        </div>
      </div>
    </Card>

      {perfil.tipo === 'instruido' && !editandoMedico && (
        <Card header="Datos Médicos">
          <div className="stack">
            <span className={`badge ${perfilMedico?.perfilMedicoCompleto ? 'badge-success' : 'badge-warning'}`}>
              <span aria-hidden="true">{perfilMedico?.perfilMedicoCompleto ? '✅' : '⏳'}</span>
              <span>{perfilMedico?.perfilMedicoCompleto ? 'Perfil médico completo' : 'Perfil médico pendiente'}</span>
            </span>

            {perfilMedico?.datosMedicosCorruptos && (
              <div className="alerta alerta-error">
                <div className="stack stack-sm">
                  <p>
                    ⚠️ No se pudieron descifrar algunos datos médicos. Es probable que se hayan guardado con una clave anterior.
                  </p>
                  <p>Regístralos nuevamente para restaurar la información.</p>
                </div>
              </div>
            )}

            <div className="datos-grid">
              {CAMPOS_MEDICOS.map(({ name, label }) => (
                <InfoField
                  key={name}
                  label={label}
                  value={mostrarMedicos ? (perfilMedico?.[name] || '—') : (perfilMedico?.[name] ? '••••••' : '—')}
                />
              ))}
            </div>
            <div className="form-acciones">
              <Button variant="secondary" onClick={() => setMostrarMedicos((prev) => !prev)}>
                {mostrarMedicos ? 'Ocultar datos médicos' : 'Ver datos médicos'}
              </Button>
              <Button variant="primary" onClick={iniciarEdicionMedico}>
                {perfilMedico?.perfilMedicoCompleto ? 'Editar datos médicos' : 'Completar datos médicos'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {perfil.tipo === 'instruido' && editandoMedico && (
        <Card header="Editar Datos Médicos">
          <div className="stack">
            {CAMPOS_MEDICOS.map(({ name, label }) => (
              <div className="field" key={name}>
                <label className="field-label" htmlFor={name}>{label}</label>
                <textarea
                  id={name}
                  name={name}
                  className="field-input field-textarea"
                  value={datosMedicos[name] || ''}
                  onChange={handleChangeMedico}
                  rows={2}
                />
              </div>
            ))}
            {errorMedico && <p className="text-sm text-error">{errorMedico}</p>}
            <div className="form-acciones">
              <Button variant="secondary" onClick={cancelarEdicionMedico}>Cancelar</Button>
              <Button variant="primary" loading={guardandoMedico} onClick={guardarMedico}>Guardar</Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

function Field({ label, name, type = 'text', value, onChange, ...props }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input className="field-input" type={type} name={name} value={value} onChange={onChange} {...props} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <select className="field-input" name={name} value={value} onChange={onChange}>
        <option value="">Seleccionar...</option>
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>{text}</option>
        ))}
      </select>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="dato">
      <p className="dato-label">{label}</p>
      <p className="dato-valor">{value}</p>
    </div>
  );
}
