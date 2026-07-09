const { Router } = require('express');
const ctrl = require('./instruido.controller');
const { validar } = require('../../shared/middleware/validate');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { esquemaCrear, esquemaActualizar } = require('./instruido.validation');
const rutasPerfilMedico = require('./perfil-medico.routes');

const router = Router();

router.use(autenticar);

router.get('/yo', autorizar('instruido'), ctrl.obtenerMiPerfil);
router.put('/yo', autorizar('instruido'), ctrl.actualizarMiPerfil);

router.get('/', autorizar('administrador', 'entrenador'), ctrl.obtenerTodos);
router.get('/:id', autorizar('administrador', 'entrenador'), ctrl.obtenerPorId);
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrear), ctrl.crear);
router.put('/:id', autorizar('administrador', 'entrenador'), validar(esquemaActualizar), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

router.use('/:instruidoId/perfil-medico', autorizar('administrador', 'entrenador'), rutasPerfilMedico);

module.exports = router;
