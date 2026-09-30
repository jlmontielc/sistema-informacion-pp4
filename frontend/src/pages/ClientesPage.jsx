import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PerfilEntrenador } from '../components/profile/PerfilEntrenador';
import { EmptyState } from '../components/common/EmptyState';
import { Loading } from '../components/common/Loading';
import { Icon } from '../components/common/Icon';
import api from '../services/api';

/* ---------------------------------------------------------------------------
   Mapas de etiquetas y clases (conservados del diseño original)
   --------------------------------------------------------------------------- */

/* Etiquetas legibles del nivel de actividad */
const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

/* Etiquetas legibles del nivel de experiencia */
const experienciaLabels = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

/* ---------------------------------------------------------------------------
   Utilidades puras (defensivas ante valores nulos del backend)
   --------------------------------------------------------------------------- */

/* Texto defensivo: si el valor no llega del backend, muestra '—' */
function textoSeguro(valor) {
  return valor === undefined || valor === null || valor === '' ? '—' : valor;
}

/* Normaliza texto: sin acentos y en minúsculas (búsqueda case-insensitive) */
function normalizar(texto) {
  if (typeof texto !== 'string') return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* Devuelve 2 iniciales en mayúsculas (nombre y apellido);
   si solo hay una palabra, una sola letra */
function iniciales(nombre) {
  if (typeof nombre !== 'string') return '—';
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '—';
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
}

/* Etiqueta legible del nivel de actividad; valor desconocido o ausente → '—' */
function etiquetasNivel(nivel) {
  if (!nivel) return null;
  return nivelLabels[nivel] || nivel;
}

/* Etiqueta legible de la experiencia; ausente → null (chip "Sin definir") */
function etiquetasExperiencia(experiencia) {
  if (!experiencia) return null;
  return experienciaLabels[experiencia] || null;
}

/* Clase de chip asociada a cada nivel de actividad; desconocido → sedentario */
function claseColorNivel(nivel) {
  if (!nivel) return 'dc-chip-nivel--sedentario';
  return `dc-chip-nivel--${nivel}`;
}

/* Clase de chip de experiencia; nula/vacía/desconocida → "Sin definir" */
function claseColorExperiencia(experiencia) {
  if (!experiencia || !experienciaLabels[experiencia]) {
    return 'dc-chip-exp--sin-definir';
  }
  return `dc-chip-exp--${experiencia}`;
}

export default function ClientesPage() {
  const { user } = useAuth();
  const [instruidos, setInstruidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroExperiencia, setFiltroExperiencia] = useState('');

  /* Solo entrenadores/administradores cargan el listado; el instruido ve
     el perfil de su entrenador (PerfilEntrenador). */
  useEffect(() => {
    if (user?.tipo === 'instruido') return;

    api.get('/instruidos')
      .then((res) => setInstruidos(res.data || []))
      .catch(() => setError('No se pudieron cargar los clientes'))
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.tipo === 'instruido') {
    return <PerfilEntrenador />;
  }

  if (loading) return <Loading text="Cargando clientes..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;

  /* Filtro local: búsqueda por nombre/email (sin acentos, case-insensitive)
     y por nivel de experiencia. */
  const instruidosFiltrados = instruidos.filter((inst) => {
    const texto = normalizar(`${inst?.nombre || ''} ${inst?.email || ''}`);
    const cumpleBusqueda = texto.includes(normalizar(busqueda.trim()));
    const cumpleExperiencia = !filtroExperiencia || inst?.nivelExperiencia === filtroExperiencia;
    return cumpleBusqueda && cumpleExperiencia;
  });

  /* El filtro está activo si hay texto de búsqueda o experiencia elegida */
  const hayFiltros = busqueda.trim() !== '' || filtroExperiencia !== '';

  /* Restablece búsqueda y filtro de experiencia */
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroExperiencia('');
  };

  /* Subtítulo y textos del estado vacío según el rol del usuario */
  const esAdministrador = user?.rol === 'administrador';
  const subtitulo = esAdministrador
    ? 'Listado de todos los clientes registrados'
    : 'Clientes asignados a tu supervisión';

  return (
    <div className="dc-pagina">
      {/* Cabecera de la página (sin botón "Nuevo cliente": no existe ese flujo) */}
      <div className="dc-seccion dc-cabecera">
        <h1 className="dc-cabecera-titulo">Clientes</h1>
        <p className="dc-cabecera-subtitulo">{subtitulo}</p>
      </div>

      {instruidos.length === 0 ? (
        /* Sin clientes: mensaje según rol */
        <div className="dc-seccion dc-card">
          <EmptyState
            icon="👥"
            title="Sin clientes"
            description={
              esAdministrador
                ? 'No hay clientes registrados en el sistema.'
                : 'Aún no tienes clientes asignados.'
            }
          />
        </div>
      ) : (
        <div className="dc-seccion dc-card">
          {/* Cabecera de la card: título + contador y controles de filtro */}
          <div className="dc-card-cabecera">
            <div className="dc-card-titulo">
              <Icon name="users" size={20} className="dc-icono" />
              <span>Clientes</span>
              <span className="dc-badge-contador">
                {instruidosFiltrados.length}
              </span>
            </div>

            <div className="dc-controles">
              <div className="dc-buscador">
                <Icon name="search" size={16} className="dc-buscador-icono" />
                <input
                  type="text"
                  className="dc-buscador-input"
                  placeholder="Buscar por nombre o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  aria-label="Buscar cliente"
                />
              </div>

              <div className="dc-select">
                <select
                  value={filtroExperiencia}
                  onChange={(e) => setFiltroExperiencia(e.target.value)}
                  aria-label="Filtrar por experiencia"
                >
                  <option value="">Toda experiencia</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
                <Icon name="next" size={14} className="dc-select-flecha" />
              </div>
            </div>
          </div>

          {instruidosFiltrados.length === 0 ? (
            /* Sin resultados para la búsqueda/filtro actual */
            <EmptyState
              icon="🔍"
              title="Sin resultados"
              description="Ningún cliente coincide con la búsqueda o el filtro aplicado."
            />
          ) : (
            <>
              {/* Tabla (scroll horizontal en móvil vía .table-wrapper) */}
              <div className="table-wrapper dc-tabla-envoltura">
                <table className="dc-tabla">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Edad</th>
                      <th>Peso</th>
                      <th>Nivel actividad</th>
                      <th>Experiencia</th>
                      <th className="dc-col-derecha">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instruidosFiltrados.map((inst) => (
                      <tr key={inst?.id}>
                        <td>
                          <div className="dc-cliente">
                            <span className="dc-avatar" aria-hidden="true">
                              {iniciales(inst?.nombre)}
                            </span>
                            <span className="dc-nombre">{textoSeguro(inst?.nombre)}</span>
                          </div>
                        </td>
                        <td>
                          <span className="dc-email">{textoSeguro(inst?.email)}</span>
                        </td>
                        <td>
                          <span className="dc-valor">
                            {inst?.edad ? inst.edad : <span className="dc-sin-valor">—</span>}
                          </span>
                        </td>
                        <td>
                          {inst?.peso ? (
                            <span className="dc-valor">
                              {inst.peso}
                              <span className="dc-unidad">kg</span>
                            </span>
                          ) : (
                            <span className="dc-sin-valor">—</span>
                          )}
                        </td>
                        <td>
                          {etiquetasNivel(inst?.nivelActividad) ? (
                            <span
                              className={`dc-chip-nivel ${claseColorNivel(inst.nivelActividad)}`}
                            >
                              <span className="dc-punto" />
                              {etiquetasNivel(inst.nivelActividad)}
                            </span>
                          ) : (
                            <span className="dc-sin-valor">—</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`dc-chip-exp ${claseColorExperiencia(inst?.nivelExperiencia)}`}
                          >
                            {etiquetasExperiencia(inst?.nivelExperiencia) || 'Sin definir'}
                          </span>
                        </td>
                        <td className="dc-col-derecha">
                          <Link
                            to={`/clientes/${inst?.id}`}
                            className="dc-boton-perfil"
                            aria-label={`Ver perfil completo de ${textoSeguro(inst?.nombre)}`}
                          >
                            Ver perfil completo
                            <Icon name="next" size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pie de la tabla: conteo y limpieza de filtros */}
              <div className="dc-tabla-pie">
                <span>
                  Mostrando {instruidosFiltrados.length} de {instruidos.length} clientes
                </span>
                {hayFiltros && (
                  <button
                    type="button"
                    className="dc-limpiar"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
