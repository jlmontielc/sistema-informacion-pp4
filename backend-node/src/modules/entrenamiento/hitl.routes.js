const { Router } = require('express');
const ctrl = require('./hitl.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');

const router = Router();

router.post(
  '/ia/rutina/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  ctrl.sugerirRutina,
);

router.get(
  '/ia/validate/:ejercicioId/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  ctrl.validarEjercicio,
);

module.exports = router;
