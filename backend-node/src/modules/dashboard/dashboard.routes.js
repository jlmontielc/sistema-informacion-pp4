const { Router } = require('express');
const ctrl = require('./dashboard.controller');
const { autenticar } = require('../../shared/middleware/authenticate');

const router = Router();

router.use(autenticar);

router.get('/stats', ctrl.stats);

module.exports = router;
