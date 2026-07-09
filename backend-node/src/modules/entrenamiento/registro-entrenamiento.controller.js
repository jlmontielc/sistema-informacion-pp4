const registroEntrenamientoService = require('./registro-entrenamiento.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const filtros = { ...req.query };
    if (req.usuario.rol === 'instruido') {
      filtros.instruidoIdActual = req.usuario.id;
      filtros.propias = 'true';
    }
    const registros = await registroEntrenamientoService.obtenerTodos(req.usuario.id, filtros);
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.obtenerPorId(req.params.id, req.usuario.id);
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(registro);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const datos = { ...req.body };
    if (req.usuario.rol === 'instruido') {
      datos.instruidoId = req.usuario.id;
    }
    const registro = await registroEntrenamientoService.crear(datos);
    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await registroEntrenamientoService.eliminar(req.params.id, req.usuario.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, eliminar };
