const { Router } = require('express');
const ctrl = require('./metabolismo.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { validar } = require('../../shared/middleware/validate');
const { esquemaCalculoMetabolico } = require('./metabolismo.validation');

const router = Router();

router.post('/calcular', autenticar, validar(esquemaCalculoMetabolico), ctrl.calcular);

module.exports = router;
