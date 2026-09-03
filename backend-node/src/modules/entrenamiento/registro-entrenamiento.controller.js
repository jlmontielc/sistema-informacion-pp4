const registroEntrenamientoService = require('./registro-entrenamiento.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const registros = await registroEntrenamientoService.obtenerTodos(req.usuario, req.query);
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.obtenerPorId(req.params.id, req.usuario, { incluirSeries: true });
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(registro);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.crear(req.usuario, req.body);
    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
};

const iniciar = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.iniciar(req.usuario, req.body);
    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
};

const crearSerie = async (req, res, next) => {
  try {
    const serie = await registroEntrenamientoService.crearSerie(req.params.id, req.usuario, req.body);
    res.status(201).json(serie);
  } catch (err) {
    next(err);
  }
};

const listarSeries = async (req, res, next) => {
  try {
    const series = await registroEntrenamientoService.listarSeries(req.params.id, req.usuario);
    res.json(series);
  } catch (err) {
    next(err);
  }
};

const editarSerie = async (req, res, next) => {
  try {
    const serie = await registroEntrenamientoService.editarSerie(req.params.id, req.params.serieId, req.usuario, req.body);
    res.json(serie);
  } catch (err) {
    next(err);
  }
};

const eliminarSerie = async (req, res, next) => {
  try {
    const resultado = await registroEntrenamientoService.eliminarSerie(req.params.id, req.params.serieId, req.usuario);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const finalizar = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.finalizar(req.params.id, req.usuario, req.body);
    res.json(registro);
  } catch (err) {
    next(err);
  }
};

const cancelar = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.cancelar(req.params.id, req.usuario, req.body);
    res.json(registro);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const eliminado = await registroEntrenamientoService.eliminar(req.params.id, req.usuario);
    if (!eliminado) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  iniciar,
  crearSerie,
  listarSeries,
  editarSerie,
  eliminarSerie,
  finalizar,
  cancelar,
  eliminar,
};
