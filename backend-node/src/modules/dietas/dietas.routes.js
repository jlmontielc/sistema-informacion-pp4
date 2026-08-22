const { Router } = require('express');
const ctrl = require('./dietas.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const { esquemaCrearDieta } = require('./dietas.validation');

const router = Router();

router.use(autenticar);

router.get('/', ctrl.getAll);
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrearDieta), ctrl.create);

module.exports = router;
