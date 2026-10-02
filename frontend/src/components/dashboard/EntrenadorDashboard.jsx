import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import api from '../../services/api';

/* Etiquetas legibles del nivel de actividad (mapa ya existente, se conserva) */
const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

/* Clase de chip asociada a cada nivel de actividad */
const nivelClases = {
  sedentario: 'de-chip-nivel--sedentario',
  ligero: 'de-chip-nivel--ligero',
  moderado: 'de-chip-nivel--moderado',
  activo: 'de-chip-nivel--activo',
  muy_activo: 'de-chip-nivel--muy_activo',
};

/* Normaliza texto: minúsculas y sin acentos (búsqueda case-insensitive) */
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

/* Etiqueta legible del nivel; valor desconocido o ausente → '—' */
function etiquetaNivel(nivel) {
  if (!nivel) return '—';
  return nivelLabels[nivel] || nivel;
}

/* Formatea fecha con es-ES cuando se puede parsear; si no, la muestra tal cual */
function formatearFecha(fecha) {
  if (!fecha) return '—';
  const parseada = new Date(fecha);
  if (Number.isNaN(parseada.getTime())) return fecha;
  return parseada.toLocaleDateString('es-ES');
}

/* Color de avatar rotando por índice de fila (3 variantes) */
function colorAvatar(indice) {
  return `de-avatar--${indice % 3}`;
}

/* Chip de nivel según su key */
function colorNivel(nivel) {
  return nivelClases[nivel] || 'de-chip-nivel--sedentario';
}

/* Texto defensivo: si el valor no llega del backend, muestra '—' */
function textoSeguro(valor) {
  return valor === undefined || valor === null || valor === '' ? '—' : valor;
}

/* Chip de estado del cliente: activo, pausa o indefinido */
function ChipEstado({ estado }) {
  if (estado !== 'activo' && estado !== 'pausa') {
    return <span className="de-sin-valor">—</span>;
  }
  return (
    <span className={`de-chip-estado de-chip-estado--${estado}`}>
      <span className="de-punto" />
      {estado === 'activo' ? 'Activo' : 'Pausa'}
    </span>
  );
}

/* Tarjeta KPI del dashboard del entrenador */
function KpiTarjeta({ icono, etiqueta, valor, sub, variante }) {
  return (
    <div className={`de-kpi de-kpi--${variante}`}>
      <div className="de-kpi-icono">
        <Icon name={icono} size={26} />
      </div>
      <div className="de-kpi-contenido">
        <p className="de-kpi-label">{etiqueta}</p>
        <p className="de-kpi-valor">{textoSeguro(valor)}</p>
        {typeof sub === 'string' ? (
          <p className="de-kpi-sub de-kpi-sub--apagado">{sub}</p>
        ) : (
          <p className="de-kpi-sub">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function EntrenadorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data))
      .catch(() => setError('No se pudieron cargar los datos. Verifica tu conexión.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando dashboard..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;
  if (!data) return <EmptyState icon="📊" title="Sin datos" description="Aún no hay información disponible." />;

  const { totalClientes, rutinasActivas, dietasActivas, clientesNuevosMes, clientesRecientes } = data;
  const clientes = Array.isArray(clientesRecientes) ? clientesRecientes : [];

  /* Filtrado por nombre, sin acentos y sin Importar mayúsculas/minúsculas */
  const termino = normalizar(busqueda.trim());
  const filtrados = termino
    ? clientes.filter(c => normalizar(c?.nombre).includes(termino))
    : clientes;

  /* Distribución por nivel: cuenta niveles presentes y ordena de mayor a menor */
  const conteoNiveles = clientes.reduce((acum, c) => {
    const nivel = c?.nivelActividad || 'desconocido';
    acum[nivel] = (acum[nivel] || 0) + 1;
    return acum;
  }, {});
  const nivelesOrdenados = Object.entries(conteoNiveles)
    .sort(([, a], [, b]) => b - a)
    .map(([nivel, contador]) => ({ nivel, contador }));
  const maxConteo = nivelesOrdenados.length > 0 ? nivelesOrdenados[0].contador : 1;

  /* Sub del KPI "Mis Clientes": destaca las nuevas incorporaciones del mes */
  const subClientes = clientesNuevosMes > 0
    ? (
      <>
        <Icon name="trending-up" size={14} />
        <span><strong>+{clientesNuevosMes}</strong> nuevos este mes</span>
      </>
    )
    : 'Sin novedades en el mes';

  return (
    <div className="de-pagina">
      {/* Cabecera */}
      <div className="de-seccion de-cabecera">
        <h1 className="de-cabecera-titulo">Dashboard</h1>
        <p className="de-cabecera-subtitulo">Resumen de tu actividad como entrenador</p>
      </div>

      {/* KPIs principales */}
      <div className="de-kpis de-seccion">
        <KpiTarjeta
          icono="groups"
          etiqueta="Mis Clientes"
          valor={totalClientes}
          sub={subClientes}
          variante="primario"
        />
        <KpiTarjeta
          icono="dumbbell"
          etiqueta="Rutinas Activas"
          valor={rutinasActivas}
          sub="Programas en curso"
          variante="secundario"
        />
        <KpiTarjeta
          icono="restaurant"
          etiqueta="Dietas Activas"
          valor={dietasActivas}
          sub="Planes nutricionales en curso"
          variante="terciario"
        />
        <KpiTarjeta
          icono="plus"
          etiqueta="Nuevos este mes"
          valor={clientesNuevosMes}
          sub="Incorporaciones del mes"
          variante="contenedor"
        />
      </div>

      {/* Tabla de clientes recientes */}
      <div className="de-seccion de-card">
        <div className="de-card-cabecera">
          <h2 className="de-card-titulo">
            <Icon name="users" size={20} className="de-icono" />
            Mis Clientes Recientes
          </h2>
          <span className="de-badge de-badge--principal">{clientes.length} registrados</span>
          <div className="de-buscador">
            <Icon name="search" size={16} className="de-buscador-icono" />
            <input
              type="text"
              className="de-buscador-input"
              placeholder="Buscar atleta..."
              aria-label="Buscar atleta por nombre"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {clientes.length === 0 ? (
          <div className="de-card-cuerpo">
            <EmptyState
              icon="👥"
              title="Sin clientes"
              description="Aún no tienes clientes asignados. Registra tu primer instruido para comenzar."
            />
          </div>
        ) : (
          <>
            {/* Tabla; en ≤640px se apila en tarjetas vía .rw-tabla */}
            <div className="table-wrapper rw-tabla de-tabla-envoltura">
              <table className="de-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Peso</th>
                    <th>Nivel</th>
                    <th>Registro</th>
                    <th>Estado</th>
                    <th className="de-col-derecha">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((c, indice) => (
                    <tr key={c?.id ?? indice}>
                      <td data-label="Nombre">
                        <div className="de-celda-nombre">
                          <span className={`de-avatar ${colorAvatar(indice)}`}>
                            {iniciales(c?.nombre)}
                          </span>
                          <div>
                            <p className="de-nombre">{textoSeguro(c?.nombre)}</p>
                            <p className="de-email">{textoSeguro(c?.email)}</p>
                          </div>
                        </div>
                      </td>
                      <td data-label="Peso">
                        <span className="de-peso">
                          {c?.peso != null ? c.peso : '—'}
                          {c?.peso != null && <span className="de-peso-unidad">kg</span>}
                        </span>
                      </td>
                      <td data-label="Nivel">
                        {c?.nivelActividad
                          ? <span className={`de-chip-nivel ${colorNivel(c.nivelActividad)}`}>{etiquetaNivel(c.nivelActividad)}</span>
                          : <span className="de-sin-valor">—</span>}
                      </td>
                      <td data-label="Registro">
                        <span className="de-registro">{formatearFecha(c?.fechaRegistro)}</span>
                      </td>
                      <td data-label="Estado">
                        <ChipEstado estado={c?.estado} />
                      </td>
                      <td className="de-col-derecha" data-label="Acciones">
                        <Link
                          to={`/clientes/${c?.id}`}
                          className="de-boton-perfil"
                          aria-label={`Ver perfil de ${textoSeguro(c?.nombre)}`}
                        >
                          Ver Perfil
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <span className="de-sin-valor">Sin resultados para «{busqueda.trim()}».</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="de-tabla-pie">
              <span>Mostrando {filtrados.length} de {clientes.length} atletas</span>
              <Link to="/clientes" className="de-ver-todos">Ver todos</Link>
            </div>
          </>
        )}
      </div>

      {/* Widgets inferiores */}
      <div className="de-widgets de-seccion">
        {/* Widget: nuevos clientes del mes */}
        <div className="de-card">
          <div className="de-widget-cabecera">
            <h2 className="de-card-titulo">
              <Icon name="calendar" size={20} className="de-icono" />
              Nuevos este mes
            </h2>
            <span className="de-badge de-badge--cian">{clientesNuevosMes} nuevos</span>
          </div>
          <div className="de-card-cuerpo">
            {clientes.length === 0 ? (
              <EmptyState
                icon="👥"
                title="Sin clientes"
                description="Aún no tienes clientes asignados. Registra tu primer instruido para comenzar."
              />
            ) : (
              <div className="de-actividad-lista">
                {clientes.slice(0, 5).map((c, indice) => (
                  <div key={c?.id ?? indice} className="de-actividad">
                    <span className={`de-avatar ${colorAvatar(indice)}`}>
                      {iniciales(c?.nombre)}
                    </span>
                    <div className="de-actividad-info">
                      <p className="de-actividad-nombre">{textoSeguro(c?.nombre)}</p>
                      <p className="de-actividad-detalle">
                        {c?.nivelActividad ? `${etiquetaNivel(c.nivelActividad)} · ` : ''}
                        Registrado el {formatearFecha(c?.fechaRegistro)}
                      </p>
                    </div>
                    <span className="de-actividad-estado">
                      <ChipEstado estado={c?.estado} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Widget: distribución por nivel de actividad */}
        <div className="de-card">
          <div className="de-widget-cabecera">
            <h2 className="de-card-titulo">
              <Icon name="chartline" size={20} className="de-icono" />
              Distribución por nivel
            </h2>
            <span className="de-badge de-badge--principal">{clientes.length} atletas</span>
          </div>
          <div className="de-card-cuerpo">
            {clientes.length === 0 ? (
              <EmptyState
                icon="👥"
                title="Sin clientes"
                description="Aún no tienes clientes asignados. Registra tu primer instruido para comenzar."
              />
            ) : (
              <div className="de-niveles-lista">
                {nivelesOrdenados.map(({ nivel, contador }, indice) => (
                  <div key={nivel} className="de-nivel-fila">
                    <span className="de-nivel-etiqueta">{etiquetaNivel(nivel)}</span>
                    <div className="de-barra">
                      <div
                        className={`de-barra-relleno de-barra-relleno--${indice % 5}`}
                        style={{ width: `${Math.max(6, (contador / maxConteo) * 100)}%` }}
                      />
                    </div>
                    <span className="de-nivel-contador">{contador}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
