const { Router } = require('express');
const ctrl = require('./metabolismo.controller');

const router = Router();

router.post('/calcular', ctrl.calcular);

module.exports = router;
