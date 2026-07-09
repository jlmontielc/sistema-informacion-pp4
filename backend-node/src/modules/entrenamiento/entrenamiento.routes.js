const { Router } = require('express');
const { autenticar } = require('../../shared/middleware/authenticate');

const router = Router();

router.use(autenticar);

router.use('/ejercicios', require('./ejercicios.routes'));
router.use('/plantillas', require('./plantillas.routes'));
router.use('/asignadas', require('./rutinas-asignadas.routes'));
router.use('/registro', require('./registro-entrenamiento.routes'));

module.exports = router;
