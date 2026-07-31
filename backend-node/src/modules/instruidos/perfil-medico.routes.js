const { Router } = require('express');
const ctrl = require('./perfil-medico.controller');
const { validar } = require('../../shared/middleware/validate');
const { esquemaPerfilMedico } = require('./perfil-medico.validation');

const router = Router({ mergeParams: true });

router.get('/', ctrl.obtenerPorInstruido);
router.put('/', validar(esquemaPerfilMedico), ctrl.crearOActualizar);

module.exports = router;
