const { Router } = require('express');
const ctrl = require('./clientes.controller');
const { validate } = require('../../shared/middleware/validate');
const { authenticate } = require('../../shared/middleware/authenticate');
const { createSchema, updateSchema } = require('./clientes.validation');
const perfilMedicoRoutes = require('./perfil-medico.routes');

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', validate(createSchema), ctrl.create);
router.put('/:id', validate(updateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

router.use('/:clienteId/perfil-medico', perfilMedicoRoutes);

module.exports = router;
