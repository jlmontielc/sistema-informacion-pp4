const rutinasAsignadasService = require('./rutinas-asignadas.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const filtros = { ...req.query };
    if (req.usuario.rol === 'instruido') {
      filtros.instruidoIdActual = req.usuario.id;
      filtros.propias = 'true';
    }
    const rutinas = await rutinasAsignadasService.obtenerTodos(req.usuario.id, filtros);
    res.json(rutinas);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    let rutina;
    if (req.usuario.rol === 'instruido') {
      rutina = await rutinasAsignadasService.obtenerPorIdPropio(req.params.id, req.usuario.id);
    } else {
      rutina = await rutinasAsignadasService.obtenerPorId(req.params.id, req.usuario.id);
    }
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.crear(req.body, req.usuario.id);
    res.status(201).json(rutina);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.actualizar(req.params.id, req.body, req.usuario.id);
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await rutinasAsignadasService.eliminar(req.params.id, req.usuario.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const clonarDesdePlantilla = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.clonarDesdePlantilla(
      req.params.plantillaId, req.body, req.usuario.id
    );
    res.status(201).json(rutina);
  } catch (err) {
    next(err);
  }
};

const obtenerPorDia = async (req, res, next) => {
  try {
    let resultado;
    if (req.usuario.rol === 'instruido') {
      resultado = await rutinasAsignadasService.obtenerPorDia(
        req.params.id, req.params.dia, null, req.usuario.id
      );
    } else {
      resultado = await rutinasAsignadasService.obtenerPorDia(
        req.params.id, req.params.dia, req.usuario.id
      );
    }
    if (!resultado) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const obtenerResumenSemanal = async (req, res, next) => {
  try {
    let resumen;
    if (req.usuario.rol === 'instruido') {
      resumen = await rutinasAsignadasService.obtenerResumenSemanal(
        req.params.id, null, req.usuario.id
      );
    } else {
      resumen = await rutinasAsignadasService.obtenerResumenSemanal(
        req.params.id, req.usuario.id
      );
    }
    if (!resumen) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(resumen);
  } catch (err) {
    next(err);
  }
};

const agregarEjercicioADia = async (req, res, next) => {
  try {
    const ejercicio = await rutinasAsignadasService.agregarEjercicioADia(
      req.params.id, req.params.dia, req.body, req.usuario.id
    );
    if (!ejercicio) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.status(201).json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const editarEjercicioEnDia = async (req, res, next) => {
  try {
    const ejercicio = await rutinasAsignadasService.editarEjercicioEnDia(
      req.params.id, req.params.dia, Number(req.params.idx), req.body, req.usuario.id
    );
    if (!ejercicio) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const eliminarEjercicioDeDia = async (req, res, next) => {
  try {
    const resultado = await rutinasAsignadasService.eliminarEjercicioDeDia(
      req.params.id, req.params.dia, Number(req.params.idx), req.usuario.id
    );
    if (!resultado) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const reordenarDia = async (req, res, next) => {
  try {
    const ejercicios = await rutinasAsignadasService.reordenarDia(
      req.params.id, req.params.dia, req.body.orden, req.usuario.id
    );
    if (!ejercicios) return res.status(404).json({ error: 'Rutina no encontrada' });
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
  clonarDesdePlantilla,
  obtenerPorDia,
  obtenerResumenSemanal,
  agregarEjercicioADia,
  editarEjercicioEnDia,
  eliminarEjercicioDeDia,
  reordenarDia,
};
