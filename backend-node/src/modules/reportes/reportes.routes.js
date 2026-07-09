const { Router } = require('express');
const ctrl = require('./reportes.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');

const router = Router();

router.use(autenticar);

router.get('/rendimiento/:instruidoId', autorizar('administrador', 'entrenador'), ctrl.rendimientoMensual);
router.get('/rendimiento/yo', autorizar('instruido'), ctrl.rendimientoMensual);

module.exports = router;
