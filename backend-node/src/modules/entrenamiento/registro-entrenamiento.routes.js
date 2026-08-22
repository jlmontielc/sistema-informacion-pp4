const { Router } = require('express');
const ctrl = require('./registro-entrenamiento.controller');
const { validar } = require('../../shared/middleware/validate');
const { esquemaCrearRegistro } = require('./registro-entrenamiento.validation');

const router = Router();

router.get('/', ctrl.obtenerTodos);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', validar(esquemaCrearRegistro), ctrl.crear);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
