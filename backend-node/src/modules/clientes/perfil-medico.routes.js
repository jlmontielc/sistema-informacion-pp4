const { Router } = require('express');
const ctrl = require('./perfil-medico.controller');

const router = Router({ mergeParams: true });

router.get('/', ctrl.getByCliente);
router.put('/', ctrl.upsert);

module.exports = router;
