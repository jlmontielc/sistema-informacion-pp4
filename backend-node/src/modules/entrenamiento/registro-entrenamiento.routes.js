const { Router } = require('express');
const ctrl = require('./registro-entrenamiento.controller');

const router = Router();

router.get('/', ctrl.obtenerTodos);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', ctrl.crear);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
