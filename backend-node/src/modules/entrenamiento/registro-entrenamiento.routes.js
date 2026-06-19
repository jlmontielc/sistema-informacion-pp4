const { Router } = require('express');
const ctrl = require('./registro-entrenamiento.controller');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
