import { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import api from '../../services/api';

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

export function MiPerfil({ perfil, onActualizar }) {
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      diasDisponibles: perfil.diasDisponibles || '',
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
      if (!payload.diasDisponibles) delete payload.diasDisponibles;
      if (payload.edad) payload.edad = Number(payload.edad);
      if (payload.peso) payload.peso = Number(payload.peso);
      if (payload.altura) payload.altura = Number(payload.altura);
      if (payload.diasDisponibles) payload.diasDisponibles = Number(payload.diasDisponibles);
      const res = await api.put('/auth/profile', payload);
      onActualizar(res.data);
      setSuccess('Cambios guardados correctamente');
      setEditando(false);
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (editando) {
    return (
      <Card header="Editar Mi Perfil">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <Field label="Nombre" name="nombre" value={datos.nombre} onChange={handleChange} />
            <Field label="Email" name="email" type="email" value={datos.email} onChange={handleChange} />
            {perfil.rol === 'entrenador' && (
              <Field label="Especialidad" name="especialidad" value={datos.especialidad} onChange={handleChange} />
            )}
          </div>
          {perfil.tipo === 'instruido' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              <Field label="Edad" name="edad" type="number" value={datos.edad} onChange={handleChange} />
              <Field label="Peso (kg)" name="peso" type="number" step="0.01" value={datos.peso} onChange={handleChange} />
              <Field label="Altura (m)" name="altura" type="number" step="0.01" value={datos.altura} onChange={handleChange} />
              <SelectField label="Sexo" name="sexo" value={datos.sexo} onChange={handleChange} options={sexoLabels} />
              <SelectField label="Nivel de actividad" name="nivelActividad" value={datos.nivelActividad} onChange={handleChange} options={nivelLabels} />
              <Field label="Días disponibles" name="diasDisponibles" type="number" min="1" max="7" value={datos.diasDisponibles} onChange={handleChange} />
            </div>
          )}
          {(perfil.tipo === 'instruido' || perfil.rol === 'entrenador') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Field label="Nueva contraseña (opcional)" name="contrasena" type="password" value={datos.contrasena} onChange={handleChange} minLength="8" />
              {datos.contrasena && datos.contrasena.length < 8 && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: -8 }}>Mínimo 8 caracteres</p>
              )}
              {datos.contrasena && (
                <Field label="Contraseña actual (requerida)" name="contrasenaActual" type="password" value={datos.contrasenaActual} onChange={handleChange} />
              )}
            </div>
          )}
          {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
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
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--color-success, #4caf50)',
          color: 'var(--color-text-inverse, #fff)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}
    <Card header="Mi Perfil">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <InfoField label="Nombre" value={perfil.nombre} />
          <InfoField label="Email" value={perfil.email} />
          {perfil.rol && perfil.tipo !== 'instruido' && <InfoField label="Rol" value={perfil.rol} />}
          {perfil.especialidad && <InfoField label="Especialidad" value={perfil.especialidad} />}
        </div>
        {perfil.tipo === 'instruido' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <InfoField label="Edad" value={perfil.edad ? `${perfil.edad} años` : '—'} />
            <InfoField label="Peso" value={perfil.peso ? `${perfil.peso} kg` : '—'} />
            <InfoField label="Altura" value={perfil.altura ? `${perfil.altura} m` : '—'} />
            <InfoField label="Sexo" value={sexoLabels[perfil.sexo] || '—'} />
            <InfoField label="Nivel de actividad" value={nivelLabels[perfil.nivelActividad] || '—'} />
            <InfoField label="Días disponibles" value={perfil.diasDisponibles ? `${perfil.diasDisponibles} días/semana` : '—'} />
            <InfoField label="Propósito" value={perfil.propositoEntrenamiento || '—'} />
            <InfoField label="Fecha de registro" value={perfil.fechaRegistro || '—'} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={iniciarEdicion}>Editar perfil</Button>
        </div>
      </div>
    </Card>
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
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 'var(--font-medium)' }}>{value}</p>
    </div>
  );
}
