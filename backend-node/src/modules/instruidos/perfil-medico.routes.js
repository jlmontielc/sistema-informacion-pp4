const { Router } = require('express');
const ctrl = require('./perfil-medico.controller');

const router = Router({ mergeParams: true });

router.get('/', ctrl.obtenerPorInstruido);
router.put('/', ctrl.crearOActualizar);

module.exports = router;
