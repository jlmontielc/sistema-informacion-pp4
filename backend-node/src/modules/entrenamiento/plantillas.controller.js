const plantillasService = require('./plantillas.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const plantillas = await plantillasService.obtenerTodos(req.usuario.id, req.query);
    res.json(plantillas);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.obtenerPorId(req.params.id, req.usuario.id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.crear(req.body, req.usuario.id);
    res.status(201).json(plantilla);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.actualizar(req.params.id, req.body, req.usuario.id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await plantillasService.eliminar(req.params.id, req.usuario.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const obtenerPorDia = async (req, res, next) => {
  try {
    const resultado = await plantillasService.obtenerPorDia(
      req.params.id, req.params.dia, req.usuario.id
    );
    if (!resultado) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const agregarEjercicioADia = async (req, res, next) => {
  try {
    const ejercicio = await plantillasService.agregarEjercicioADia(
      req.params.id, req.params.dia, req.body, req.usuario.id
    );
    if (!ejercicio) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.status(201).json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const editarEjercicioEnDia = async (req, res, next) => {
  try {
    const ejercicio = await plantillasService.editarEjercicioEnDia(
      req.params.id, req.params.dia, Number(req.params.idx), req.body, req.usuario.id
    );
    if (!ejercicio) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const eliminarEjercicioDeDia = async (req, res, next) => {
  try {
    const resultado = await plantillasService.eliminarEjercicioDeDia(
      req.params.id, req.params.dia, Number(req.params.idx), req.usuario.id
    );
    if (!resultado) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const reordenarDia = async (req, res, next) => {
  try {
    const ejercicios = await plantillasService.reordenarDia(
      req.params.id, req.params.dia, req.body.orden, req.usuario.id
    );
    if (!ejercicios) return res.status(404).json({ error: 'Plantilla no encontrada' });
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
