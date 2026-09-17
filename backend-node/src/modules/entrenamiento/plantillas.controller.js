const plantillasService = require('./plantillas.service');
const cache = require('../../shared/cache/cache');
const cacheKeys = require('../../shared/cache/cacheKeys');

const entrenadorIdParaCache = (usuario, recurso) => {
  if (usuario.rol === 'administrador' && recurso && recurso.entrenadorId) {
    return recurso.entrenadorId;
  }
  return usuario.id;
};

const obtenerTodos = async (req, res, next) => {
  try {
    const admin = req.usuario.rol === 'administrador';
    const filtros = { admin };
    if (req.query.tipo) filtros.tipo = req.query.tipo;
    if (req.query.objetivo) filtros.objetivo = req.query.objetivo;
    if (req.query.activa !== undefined) filtros.activa = req.query.activa;
    if (req.query.busqueda) filtros.busqueda = req.query.busqueda;
    const plantillas = await plantillasService.obtenerTodos(req.usuario.id, filtros);
    res.json(plantillas);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.obtenerPorId(req.params.id, req.usuario);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const invalidarPorPlantilla = async (usuario, plantilla) => {
  if (plantilla) {
    await cache.eliminarPorPatron(
      cacheKeys.plantillas.patronListadoPorEntrenador(entrenadorIdParaCache(usuario, plantilla)),
    );
  }
  await cache.eliminarPorPatron(cacheKeys.plantillas.patronListadoPorEntrenador('*'));
};

const invalidarClavesDePlantilla = async (id) => {
  await cache.eliminarPorPatron(cacheKeys.plantillas.patronPorId(id));
  await cache.eliminarPorPatron(cacheKeys.plantillas.patronPorDia(id));
};

const crear = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.crear(req.body, req.usuario.id);
    await invalidarPorPlantilla(req.usuario, plantilla);
    await invalidarClavesDePlantilla(plantilla.id);
    res.status(201).json(plantilla);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.actualizar(req.params.id, req.body, req.usuario);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    await invalidarPorPlantilla(req.usuario, plantilla);
    await invalidarClavesDePlantilla(plantilla.id);
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.eliminar(req.params.id, req.usuario);
    await invalidarPorPlantilla(req.usuario, plantilla);
    await invalidarClavesDePlantilla(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const obtenerPorDia = async (req, res, next) => {
  try {
    const resultado = await plantillasService.obtenerPorDia(
      req.params.id, req.params.dia, req.usuario
    );
    if (!resultado) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const invalidarPlantilla = async (usuario, id) => {
  const plantilla = await plantillasService.obtenerPorId(id, usuario);
  await invalidarPorPlantilla(usuario, plantilla);
  await invalidarClavesDePlantilla(id);
};

const agregarEjercicioADia = async (req, res, next) => {
  try {
    const ejercicio = await plantillasService.agregarEjercicioADia(
      req.params.id, req.params.dia, req.body, req.usuario
    );
    if (!ejercicio) return res.status(404).json({ error: 'Plantilla no encontrada' });
    await invalidarPlantilla(req.usuario, req.params.id);
    res.status(201).json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const editarEjercicioEnDia = async (req, res, next) => {
  try {
    const ejercicio = await plantillasService.editarEjercicioEnDia(
      req.params.id, req.params.dia, Number(req.params.idx), req.body, req.usuario
    );
    if (!ejercicio) return res.status(404).json({ error: 'Plantilla no encontrada' });
    await invalidarPlantilla(req.usuario, req.params.id);
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const eliminarEjercicioDeDia = async (req, res, next) => {
  try {
    const resultado = await plantillasService.eliminarEjercicioDeDia(
      req.params.id, req.params.dia, Number(req.params.idx), req.usuario
    );
    if (!resultado) return res.status(404).json({ error: 'Plantilla no encontrada' });
    await invalidarPlantilla(req.usuario, req.params.id);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const reordenarDia = async (req, res, next) => {
  try {
    const ejercicios = await plantillasService.reordenarDia(
      req.params.id, req.params.dia, req.body.orden, req.usuario
    );
    if (!ejercicios) return res.status(404).json({ error: 'Plantilla no encontrada' });
    await invalidarPlantilla(req.usuario, req.params.id);
    res.json(ejercicios);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorDia,
  agregarEjercicioADia,
  editarEjercicioEnDia,
  eliminarEjercicioDeDia,
  reordenarDia,
};
