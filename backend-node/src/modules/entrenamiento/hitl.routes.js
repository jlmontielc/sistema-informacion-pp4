const { Router } = require('express');
const ctrl = require('./hitl.controller');
const feedbackCtrl = require('./hitl-feedback.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const { esquemaClienteIdParam } = require('./hitl.validation');
const { esquemaFeedbackHitl } = require('./hitl-feedback.validation');

const router = Router();

router.post(
  '/ia/rutina/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  validar(esquemaClienteIdParam, 'params'),
  ctrl.sugerirRutina,
);

router.get(
  '/ia/validate/:ejercicioId/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  ctrl.validarEjercicio,
);

router.post(
  '/ia/feedback',
  autenticar,
  autorizar('administrador', 'entrenador'),
  validar(esquemaFeedbackHitl),
  feedbackCtrl.registrarFeedback,
);

router.get(
  '/ia/feedback',
  autenticar,
  autorizar('administrador', 'entrenador'),
  feedbackCtrl.listarFeedback,
);

router.post(
  '/ia/dieta/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  validar(esquemaClienteIdParam, 'params'),
  ctrl.sugerirDieta,
);

router.get(
  '/ia/feedback/dietas',
  autenticar,
  autorizar('administrador', 'entrenador'),
  feedbackCtrl.listarFeedbackDietas,
);

module.exports = router;
