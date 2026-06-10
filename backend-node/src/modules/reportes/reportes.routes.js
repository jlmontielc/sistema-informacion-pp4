const { Router } = require('express');
const ctrl = require('./reportes.controller');

const router = Router();

router.get('/rendimiento/:clienteId', ctrl.rendimientoMensual);

module.exports = router;
