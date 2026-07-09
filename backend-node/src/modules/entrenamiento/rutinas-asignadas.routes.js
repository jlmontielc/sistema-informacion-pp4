const { Router } = require('express');
const ctrl = require('./rutinas-asignadas.controller');
const { autorizar } = require('../../shared/middleware/autorizar');

const router = Router();

router.get('/', ctrl.obtenerTodos);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', autorizar('administrador', 'entrenador'), ctrl.crear);
router.put('/:id', autorizar('administrador', 'entrenador'), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

module.exports = router;
