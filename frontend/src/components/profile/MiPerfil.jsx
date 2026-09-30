import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { DiaSelector } from '../entrenamiento/DiaSelector';
import { CertificacionCard } from './CertificacionCard';
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

const CAMPOS_CERTIFICACION = ['nombre', 'institucion', 'fechaObtencion', 'fechaExpiracion', 'descripcion'];

const CERTIFICACION_VACIA = {
  nombre: '',
  institucion: '',
  fechaObtencion: '',
  fechaExpiracion: '',
  descripcion: '',
};

const MIMES_VALIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAMANIO_MAX = 2 * 1024 * 1024;

const PROPOSITO_LABELS = {
  perdida_peso: 'Perder peso',
  ganancia_muscular: 'Ganar masa muscular',
  mantenimiento: 'Mantenimiento / Salud y bienestar',
  rendimiento: 'Rendimiento deportivo',
  rehabilitacion: 'Rehabilitación',
};

const leerArchivoBase64 = (archivo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(archivo);
  });

/* Devuelve 2 iniciales en mayúsculas (nombre y apellido);
   si solo hay una palabra, una sola letra */
function iniciales(nombre) {
  if (typeof nombre !== 'string') return '—';
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '—';
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
}

/* Etiqueta y clase del chip de rol */
function rolEtiqueta(perfil) {
  if (perfil.rol === 'administrador') return 'Administrador';
  if (perfil.rol === 'entrenador') return 'Entrenador';
  return 'Instruido';
}

function rolClase(perfil) {
  if (perfil.rol === 'administrador') return 'pf-chip-rol--administrador';
  if (perfil.rol === 'entrenador') return 'pf-chip-rol--entrenador';
  return 'pf-chip-rol--instruido';
}

/* Valor seguro para texto: null/undefined → guion largo */
function textoSeguro(valor) {
  return valor || '—';
}

export function MiPerfil({ perfil, onActualizar }) {
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
  const [certificaciones, setCertificaciones] = useState([]);
  const [cargandoCerts, setCargandoCerts] = useState(false);
  const [editandoCert, setEditandoCert] = useState(null);
  const [formCert, setFormCert] = useState({ ...CERTIFICACION_VACIA });
  const [guardandoCert, setGuardandoCert] = useState(false);
  const [errorCert, setErrorCert] = useState(null);
  const [successCert, setSuccessCert] = useState(null);
  const [archivoNuevo, setArchivoNuevo] = useState(null);
  const [inputArchivoKey, setInputArchivoKey] = useState(0);

  useEffect(() => {
    if (perfil.tipo === 'instruido') {
      api.get('/instruidos/yo/perfil-medico')
        .then(res => setPerfilMedico(res.data))
        .catch(() => {});
    }
  }, [perfil.tipo]);

  useEffect(() => {
    if (perfil.rol !== 'entrenador') return;
    setCargandoCerts(true);
    api.get('/auth/me')
      .then((res) => {
        setCertificaciones(res.data.certificaciones || []);
        onActualizar(res.data);
      })
      .catch(() => setErrorCert('No se pudieron cargar las certificaciones'))
      .finally(() => setCargandoCerts(false));
  }, [perfil.rol]);

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

  const abrirNuevaCert = () => {
    setFormCert({ ...CERTIFICACION_VACIA });
    setEditandoCert({});
    setArchivoNuevo(null);
    setInputArchivoKey((k) => k + 1);
    setErrorCert(null);
    setSuccessCert(null);
  };

  const iniciarEdicionCert = (cert) => {
    setFormCert({
      nombre: cert.nombre || '',
      institucion: cert.institucion || '',
      fechaObtencion: cert.fechaObtencion || '',
      fechaExpiracion: cert.fechaExpiracion || '',
      descripcion: cert.descripcion || '',
    });
    setEditandoCert(cert);
    setArchivoNuevo(null);
    setInputArchivoKey((k) => k + 1);
    setErrorCert(null);
    setSuccessCert(null);
  };

  const cancelarCert = () => {
    setEditandoCert(null);
    setFormCert({ ...CERTIFICACION_VACIA });
    setArchivoNuevo(null);
    setErrorCert(null);
  };

  const handleChangeCert = (e) => {
    setFormCert({ ...formCert, [e.target.name]: e.target.value });
  };

  const handleArchivoCertChange = (e) => {
    setErrorCert(null);
    const file = e.target.files?.[0] || null;
    if (!file) {
      setArchivoNuevo(null);
      return;
    }
    if (!MIMES_VALIDOS.includes(file.type)) {
      setArchivoNuevo(null);
      e.target.value = '';
      setErrorCert('Formato no permitido. Usa JPG, PNG o PDF.');
      return;
    }
    if (file.size > TAMANIO_MAX) {
      setArchivoNuevo(null);
      e.target.value = '';
      setErrorCert('El archivo supera el máximo de 2 MB.');
      return;
    }
    setArchivoNuevo(file);
  };

  const recargarCertificaciones = async () => {
    const res = await api.get('/auth/me');
    setCertificaciones(res.data.certificaciones || []);
  };

  const guardarCert = async () => {
    if (!(formCert.nombre || '').trim()) {
      setErrorCert('El nombre es requerido');
      return;
    }
    setGuardandoCert(true);
    setErrorCert(null);
    try {
      const payload = {};
      CAMPOS_CERTIFICACION.forEach((campo) => {
        const valor = (formCert[campo] || '').trim();
        if (valor) payload[campo] = valor;
      });
      if (archivoNuevo) {
        payload.archivo = await leerArchivoBase64(archivoNuevo);
        payload.archivoMime = archivoNuevo.type;
      }
      if (editandoCert && editandoCert.id) {
        await api.put(`/auth/certifications/${editandoCert.id}`, payload);
      } else {
        await api.post('/auth/certifications', payload);
      }
      await recargarCertificaciones();
      setEditandoCert(null);
      setFormCert({ ...CERTIFICACION_VACIA });
      setArchivoNuevo(null);
      setInputArchivoKey((k) => k + 1);
      setSuccessCert('Certificación guardada correctamente');
    } catch (err) {
      setErrorCert(err.response?.data?.error || 'Error al guardar la certificación');
    } finally {
      setGuardandoCert(false);
    }
  };

  const eliminarCert = async (id) => {
    if (!window.confirm('¿Eliminar esta certificación?')) return;
    setErrorCert(null);
    try {
      await api.delete(`/auth/certifications/${id}`);
      await recargarCertificaciones();
      setSuccessCert('Certificación eliminada correctamente');
    } catch (err) {
      setErrorCert(err.response?.data?.error || 'Error al eliminar la certificación');
    }
  };

  /* ---------- Modo edición (inline: reemplaza la vista) ---------- */

  if (editando) {
    return (
      <div className="pf-seccion pf-card">
        <div className="pf-card-cabecera">
          <h2 className="pf-card-titulo">
            <Icon name="settings" size={20} className="pf-icono" />
            Editar Mi Perfil
          </h2>
        </div>
        <div className="pf-card-cuerpo">
          <div className="pf-campos-grid">
            <Field label="Nombre" name="nombre" value={datos.nombre} onChange={handleChange} />
            <Field label="Email" name="email" type="email" value={datos.email} onChange={handleChange} />
            {perfil.rol === 'entrenador' && (
              <Field label="Especialidad" name="especialidad" value={datos.especialidad} onChange={handleChange} />
            )}
          </div>

          {perfil.tipo === 'instruido' && (
            <div className="pf-campos-grid">
              <p className="pf-grupo-titulo">Datos físicos y actividad</p>
              <Field label="Edad" name="edad" type="number" value={datos.edad} onChange={handleChange} />
              <Field label="Peso (kg)" name="peso" type="number" step="0.01" value={datos.peso} onChange={handleChange} />
              <Field label="Altura (m)" name="altura" type="number" step="0.01" value={datos.altura} onChange={handleChange} />
              <SelectField label="Sexo" name="sexo" value={datos.sexo} onChange={handleChange} options={sexoLabels} />
              <SelectField label="Nivel de actividad" name="nivelActividad" value={datos.nivelActividad} onChange={handleChange} options={nivelLabels} />
              <SelectField label="Propósito de entrenamiento" name="propositoEntrenamiento" value={datos.propositoEntrenamiento} onChange={handleChange} options={PROPOSITO_LABELS} />
              <SelectField label="Nivel de experiencia" name="nivelExperiencia" value={datos.nivelExperiencia} onChange={handleChange} options={{ principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }} />
              <div className="pf-campo pf-campo--ancho">
                <span className="pf-campo-label">Días disponibles para entrenar</span>
                <DiaSelector seleccionados={datos.diasSemana || []} onToggle={handleToggleDia} />
                <p className="pf-campo-ayuda">
                  Has seleccionado {(datos.diasSemana || []).length} {(datos.diasSemana || []).length === 1 ? 'día' : 'días'}
                </p>
              </div>
            </div>
          )}

          {(perfil.tipo === 'instruido' || perfil.rol === 'entrenador') && (
            <div className="pf-campos-grid">
              <p className="pf-grupo-titulo">Seguridad</p>
              <Field label="Nueva contraseña (opcional)" name="contrasena" type="password" value={datos.contrasena} onChange={handleChange} minLength="8" />
              {datos.contrasena && datos.contrasena.length < 8 && (
                <p className="pf-campo-error">Mínimo 8 caracteres</p>
              )}
              {datos.contrasena && (
                <Field label="Contraseña actual (requerida)" name="contrasenaActual" type="password" value={datos.contrasenaActual} onChange={handleChange} />
              )}
            </div>
          )}

          {error && (
            <div className="pf-aviso pf-aviso--error">
              <Icon name="close" size={16} className="pf-icono" />
              <p>{error}</p>
            </div>
          )}

          <div className="pf-acciones">
            <Button variant="secondary" onClick={cancelar}>Cancelar</Button>
            <Button variant="primary" loading={guardando} onClick={guardar}>Guardar</Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Modo vista ---------- */

  return (
    <>
      {success && (
        <div className="pf-seccion pf-aviso pf-aviso--ok">
          <Icon name="check" size={16} className="pf-icono" />
          <p>{success}</p>
        </div>
      )}

      {/* Hero de identidad */}
      <div className="pf-seccion pf-card pf-hero">
        <div className="pf-avatar" aria-hidden="true">{iniciales(perfil.nombre)}</div>
        <div className="pf-hero-info">
          <p className="pf-hero-nombre">{textoSeguro(perfil.nombre)}</p>
          <p className="pf-hero-email">{textoSeguro(perfil.email)}</p>
          <div className="pf-hero-chips">
            <span className={`pf-chip-rol ${rolClase(perfil)}`}>{rolEtiqueta(perfil)}</span>
            {perfil.especialidad && (
              <span className="pf-chip-especialidad">
                <Icon name="dumbbell" size={12} />
                {perfil.especialidad}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div className="pf-seccion pf-card">
        <div className="pf-card-cabecera">
          <h2 className="pf-card-titulo">
            <Icon name="user" size={20} className="pf-icono" />
            Datos personales
          </h2>
          <Button variant="primary" size="sm" onClick={iniciarEdicion}>Editar perfil</Button>
        </div>
        <div className="pf-card-cuerpo">
          <div className="pf-datos-grid">
            <Dato label="Nombre" valor={perfil.nombre} />
            <Dato label="Email" valor={perfil.email} mono />
            {perfil.rol && perfil.tipo !== 'instruido' && <Dato label="Rol" valor={rolEtiqueta(perfil)} />}
            {perfil.especialidad && <Dato label="Especialidad" valor={perfil.especialidad} />}
          </div>
          {perfil.tipo === 'instruido' && (
            <div className="pf-datos-grid">
              <Dato label="Edad" valor={perfil.edad ? `${perfil.edad} años` : null} />
              <Dato label="Peso" valor={perfil.peso ? `${perfil.peso} kg` : null} />
              <Dato label="Altura" valor={perfil.altura ? `${perfil.altura} m` : null} />
              <Dato label="Sexo" valor={sexoLabels[perfil.sexo] || null} />
              <Dato label="Nivel de actividad" valor={nivelLabels[perfil.nivelActividad] || null} />
              <div className="pf-dato pf-datos-grid--ancho">
                <p className="pf-dato-label">Días disponibles</p>
                {Array.isArray(perfil.diasSemana) && perfil.diasSemana.length > 0 ? (
                  <DiaSelector modo="vista" seleccionados={perfil.diasSemana} />
                ) : (
                  <p className="pf-dato-valor">{perfil.diasDisponibles ? `${perfil.diasDisponibles} días/semana` : '—'}</p>
                )}
              </div>
              <Dato label="Propósito" valor={perfil.propositoEntrenamiento ? labelObjetivo(perfil.propositoEntrenamiento) : null} />
              <Dato label="Nivel de experiencia" valor={perfil.nivelExperiencia ? labelNivelExperiencia(perfil.nivelExperiencia) : null} />
              <Dato label="Fecha de registro" valor={perfil.fechaRegistro || null} />
            </div>
          )}
        </div>
      </div>

      {/* Certificaciones (solo entrenador) */}
      {perfil.rol === 'entrenador' && successCert && (
        <div className="pf-seccion pf-aviso pf-aviso--ok">
          <Icon name="check" size={16} className="pf-icono" />
          <p>{successCert}</p>
        </div>
      )}

      {perfil.rol === 'entrenador' && (
        <div className="pf-seccion pf-card">
          <div className="pf-card-cabecera">
            <h2 className="pf-card-titulo">
              <Icon name="receipt" size={20} className="pf-icono" />
              Certificaciones
            </h2>
            <span className="pf-badge-contador">{certificaciones.length}</span>
          </div>
          <div className="pf-card-cuerpo">
            {cargandoCerts && <p className="pf-campo-ayuda">Cargando certificaciones...</p>}
            {!cargandoCerts && certificaciones.length === 0 && (
              <p className="pf-campo-ayuda">Aún no tienes certificaciones registradas.</p>
            )}
            {!cargandoCerts && certificaciones.length > 0 && (
              <div className="pf-cert-grid">
                {certificaciones.map((c) => (
                  <div className="pf-cert-item" key={c.id}>
                    <CertificacionCard cert={c} />
                    <div className="pf-cert-acciones">
                      <Button variant="secondary" size="sm" onClick={() => iniciarEdicionCert(c)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => eliminarCert(c.id)}>Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!editandoCert && errorCert && (
              <div className="pf-aviso pf-aviso--error">
                <Icon name="close" size={16} className="pf-icono" />
                <p>{errorCert}</p>
              </div>
            )}
            {!editandoCert && (
              <div className="pf-acciones">
                <Button variant="primary" onClick={abrirNuevaCert}>Añadir certificación</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {perfil.rol === 'entrenador' && editandoCert && (
        <div className="pf-seccion pf-card">
          <div className="pf-card-cabecera">
            <h2 className="pf-card-titulo">
              <Icon name="receipt" size={20} className="pf-icono" />
              {editandoCert.id ? 'Editar certificación' : 'Nueva certificación'}
            </h2>
          </div>
          <div className="pf-card-cuerpo">
            <div className="pf-campos-grid">
              <Field label="Nombre" name="nombre" value={formCert.nombre} onChange={handleChangeCert} />
              <Field label="Institución" name="institucion" value={formCert.institucion} onChange={handleChangeCert} />
              <Field label="Fecha de obtención" name="fechaObtencion" type="date" value={formCert.fechaObtencion} onChange={handleChangeCert} />
              <Field label="Fecha de expiración" name="fechaExpiracion" type="date" value={formCert.fechaExpiracion} onChange={handleChangeCert} />
              <div className="pf-campo pf-campo--ancho">
                <label className="pf-campo-label" htmlFor="cert-descripcion">Descripción</label>
                <textarea
                  id="cert-descripcion"
                  name="descripcion"
                  rows={2}
                  className="pf-campo-input"
                  value={formCert.descripcion}
                  onChange={handleChangeCert}
                />
              </div>
              <div className="pf-campo pf-campo--ancho">
                <label className="pf-campo-label" htmlFor="cert-archivo">Archivo (imagen o PDF, máx. 2 MB)</label>
                <input
                  id="cert-archivo"
                  key={inputArchivoKey}
                  name="archivo"
                  type="file"
                  className="pf-campo-input"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleArchivoCertChange}
                />
                {archivoNuevo && (
                  <p className="pf-campo-ayuda">Seleccionado: {archivoNuevo.name}</p>
                )}
                {editandoCert && editandoCert.id && !archivoNuevo && editandoCert.tieneArchivo && (
                  <p className="pf-campo-ayuda">
                    La certificación ya tiene un archivo adjunto; se conservará si no eliges otro.
                  </p>
                )}
              </div>
            </div>
            {errorCert && (
              <div className="pf-aviso pf-aviso--error">
                <Icon name="close" size={16} className="pf-icono" />
                <p>{errorCert}</p>
              </div>
            )}
            <div className="pf-acciones">
              <Button variant="secondary" onClick={cancelarCert}>Cancelar</Button>
              <Button variant="primary" loading={guardandoCert} onClick={guardarCert}>Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Datos médicos (solo instruido) */}
      {perfil.tipo === 'instruido' && !editandoMedico && (
        <div className="pf-seccion pf-card">
          <div className="pf-card-cabecera">
            <h2 className="pf-card-titulo">
              <Icon name="heart" size={20} className="pf-icono" />
              Datos Médicos
            </h2>
            <span className={`pf-pill-estado ${perfilMedico?.perfilMedicoCompleto ? 'pf-pill-estado--completo' : 'pf-pill-estado--pendiente'}`}>
              {perfilMedico?.perfilMedicoCompleto ? 'Perfil médico completo' : 'Perfil médico pendiente'}
            </span>
          </div>
          <div className="pf-card-cuerpo">
            {perfilMedico?.datosMedicosCorruptos && (
              <div className="pf-aviso pf-aviso--error">
                <Icon name="wifi-off" size={16} className="pf-icono" />
                <div className="pf-aviso-cuerpo">
                  <p>No se pudieron descifrar algunos datos médicos. Es probable que se hayan guardado con una clave anterior.</p>
                  <p>Regístralos nuevamente para restaurar la información.</p>
                </div>
              </div>
            )}

            <div className="pf-datos-grid">
              {CAMPOS_MEDICOS.map(({ name, label }) => (
                <Dato
                  key={name}
                  label={label}
                  valor={mostrarMedicos ? (perfilMedico?.[name] || null) : (perfilMedico?.[name] ? '••••••' : null)}
                  mono={!mostrarMedicos && !!perfilMedico?.[name]}
                />
              ))}
            </div>

            <div className="pf-acciones">
              <Button variant="secondary" onClick={() => setMostrarMedicos((prev) => !prev)}>
                {mostrarMedicos ? 'Ocultar datos médicos' : 'Ver datos médicos'}
              </Button>
              <Button variant="primary" onClick={iniciarEdicionMedico}>
                {perfilMedico?.perfilMedicoCompleto ? 'Editar datos médicos' : 'Completar datos médicos'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {perfil.tipo === 'instruido' && editandoMedico && (
        <div className="pf-seccion pf-card">
          <div className="pf-card-cabecera">
            <h2 className="pf-card-titulo">
              <Icon name="heart" size={20} className="pf-icono" />
              Editar Datos Médicos
            </h2>
          </div>
          <div className="pf-card-cuerpo">
            <div className="pf-campos-grid">
              {CAMPOS_MEDICOS.map(({ name, label }) => (
                <div className="pf-campo pf-campo--ancho" key={name}>
                  <label className="pf-campo-label" htmlFor={name}>{label}</label>
                  <textarea
                    id={name}
                    name={name}
                    className="pf-campo-input"
                    value={datosMedicos[name] || ''}
                    onChange={handleChangeMedico}
                    rows={2}
                  />
                </div>
              ))}
            </div>
            {errorMedico && (
              <div className="pf-aviso pf-aviso--error">
                <Icon name="close" size={16} className="pf-icono" />
                <p>{errorMedico}</p>
              </div>
            )}
            <div className="pf-acciones">
              <Button variant="secondary" onClick={cancelarEdicionMedico}>Cancelar</Button>
              <Button variant="primary" loading={guardandoMedico} onClick={guardarMedico}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, name, type = 'text', value, onChange, ...props }) {
  return (
    <div className="pf-campo">
      <label className="pf-campo-label">{label}</label>
      <input className="pf-campo-input" type={type} name={name} value={value} onChange={onChange} {...props} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="pf-campo">
      <label className="pf-campo-label">{label}</label>
      <div className="pf-selecto">
        <select className="pf-campo-input" name={name} value={value} onChange={onChange}>
          <option value="">Seleccionar...</option>
          {Object.entries(options).map(([key, text]) => (
            <option key={key} value={key}>{text}</option>
          ))}
        </select>
        <Icon name="next" size={14} className="pf-selecto-flecha" />
      </div>
    </div>
  );
}

/* Dato de solo lectura; valor nulo → guion largo en gris */
function Dato({ label, valor, mono = false }) {
  return (
    <div className="pf-dato">
      <p className="pf-dato-label">{label}</p>
      {valor ? (
        <p className={`pf-dato-valor ${mono ? 'pf-dato-valor--mono' : ''}`}>{valor}</p>
      ) : (
        <p className="pf-dato-valor pf-dato-valor--vacio">—</p>
      )}
    </div>
  );
}
