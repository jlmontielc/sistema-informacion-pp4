const ENTORNO = process.env.NODE_ENV || 'dev';

const prefijo = (clave) => `${ENTORNO}:${clave}`;

const ejercicios = {
  lista: (filtros) => prefijo(`ejercicios:lista:${JSON.stringify(filtros)}`),
  porId: (id) => prefijo(`ejercicios:id:${id}`),
  patronLista: () => prefijo('ejercicios:lista:*'),
  patronTodos: () => prefijo('ejercicios:*'),
};

const dashboard = {
  stats: (rol, id) => prefijo(`dashboard:stats:${rol}:${id}`),
  patronStats: () => prefijo('dashboard:stats:*'),
};

const instruidos = {
  listado: (usuarioId, rol) => prefijo(`instruidos:listado:${rol}:${usuarioId}`),
  patronListado: () => prefijo('instruidos:listado:*'),
};

const reportes = {
  metricasPorGrupo: (instruidoId, periodo, rol) =>
    prefijo(`reportes:grupos:${rol}:${instruidoId}:${periodo}`),
  evolucionPorGrupo: (instruidoId, grupoMuscular, periodo, rol) =>
    prefijo(`reportes:evolucion:${rol}:${instruidoId}:${grupoMuscular}:${periodo}`),
  comparativa: (instruidoId, periodo, rol) =>
    prefijo(`reportes:comparativa:${rol}:${instruidoId}:${periodo}`),
  patronPorInstruido: (instruidoId) => prefijo(`reportes:*:${instruidoId}:*`),
  patronTodos: () => prefijo('reportes:*'),
};

const rutinas = {
  listado: (usuarioId, rol, filtros) =>
    prefijo(`rutinas:listado:${rol}:${usuarioId}:${JSON.stringify(filtros)}`),
  porId: (id, rol, viewerId) => prefijo(`rutinas:id:${rol}:${viewerId}:${id}`),
  porDia: (id, dia, rol, viewerId) => prefijo(`rutinas:dia:${rol}:${viewerId}:${id}:${dia}`),
  resumen: (id, rol, viewerId) => prefijo(`rutinas:resumen:${rol}:${viewerId}:${id}`),
  patronListado: () => prefijo('rutinas:listado:*'),
  patronPorId: (id) => prefijo(`rutinas:id:*:${id}`),
  patronPorInstruido: (instruidoId) => prefijo(`rutinas:*:instruido:${instruidoId}:*`),
  patronTodos: () => prefijo('rutinas:*'),
};

const dietas = {
  listado: (usuarioId, rol) => prefijo(`dietas:listado:${rol}:${usuarioId}`),
  porId: (id, rol, viewerId) => prefijo(`dietas:id:${rol}:${viewerId}:${id}`),
  patronListado: () => prefijo('dietas:listado:*'),
  patronPorId: (id) => prefijo(`dietas:id:*:${id}`),
  patronPorInstruido: (instruidoId) => prefijo(`dietas:*:instruido:${instruidoId}:*`),
  patronTodos: () => prefijo('dietas:*'),
};

const pagos = {
  planes: (rol, usuarioId) => prefijo(`pagos:planes:${rol}:${usuarioId}`),
  metodos: (rol, usuarioId) => prefijo(`pagos:metodos:${rol}:${usuarioId}`),
  configuracion: (entrenadorId) => prefijo(`pagos:config:${entrenadorId}`),
  catalogo: (entrenadorId) => prefijo(`pagos:catalogo:${entrenadorId}`),
  misPagos: (instruidoId) => prefijo(`pagos:mis-pagos:${instruidoId}`),
  miSuscripcion: (instruidoId) => prefijo(`pagos:suscripcion:${instruidoId}`),
  historial: (rol, usuarioId, filtros) => {
    const ordenados = Object.keys(filtros || {})
      .sort()
      .reduce((acc, key) => {
        acc[key] = filtros[key];
        return acc;
      }, {});
    return prefijo(`pagos:historial:${rol}:${usuarioId}:${JSON.stringify(ordenados)}`);
  },
  patronHistorial: (rol, usuarioId) => prefijo(`pagos:historial:${rol}:${usuarioId}:*`),
};

const auth = {
  perfil: (rol, id) => prefijo(`auth:perfil:${rol}:${id}`),
  trainer: (instruidoId) => prefijo(`auth:trainer:${instruidoId}`),
  profiles: (adminId) => prefijo(`auth:profiles:${adminId}`),
};

const plantillas = {
  listado: (entrenadorId, filtros) => prefijo(`plantillas:listado:${entrenadorId}:${JSON.stringify(filtros)}`),
  porId: (id, rol, viewerId) => prefijo(`plantillas:id:${rol}:${viewerId}:${id}`),
  porDia: (id, dia, rol, viewerId) => prefijo(`plantillas:dia:${rol}:${viewerId}:${id}:${dia}`),
  patronListadoPorEntrenador: (entrenadorId) => prefijo(`plantillas:listado:${entrenadorId}:*`),
  patronPorId: (id) => prefijo(`plantillas:id:*:${id}`),
  patronPorDia: (id) => prefijo(`plantillas:dia:*:${id}:*`),
};

const blacklist = (tokenHash) => prefijo(`blacklist:${tokenHash}`);

module.exports = {
  ejercicios,
  dashboard,
  instruidos,
  reportes,
  rutinas,
  dietas,
  pagos,
  auth,
  plantillas,
  blacklist,
};
