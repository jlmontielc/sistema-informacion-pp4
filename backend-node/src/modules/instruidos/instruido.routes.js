const { Router } = require('express');
const ctrl = require('./instruido.controller');
const { validar } = require('../../shared/middleware/validate');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { esquemaCrear, esquemaActualizar } = require('./instruido.validation');
const { esquemaPerfilMedico } = require('./perfil-medico.validation');
const rutasPerfilMedico = require('./perfil-medico.routes');

const router = Router();

router.use(autenticar);

router.get('/yo', autorizar('instruido'), ctrl.obtenerMiPerfil);
router.put('/yo', autorizar('instruido'), ctrl.actualizarMiPerfil);

router.get('/yo/perfil-medico', autorizar('instruido'), ctrl.obtenerMiPerfilMedico);
router.put('/yo/perfil-medico', autorizar('instruido'), validar(esquemaPerfilMedico), ctrl.actualizarMiPerfilMedico);

router.get('/', autorizar('administrador', 'entrenador'), ctrl.obtenerTodos);
router.get('/:id', autorizar('administrador', 'entrenador'), ctrl.obtenerPorId);
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrear), ctrl.crear);
router.put('/:id', autorizar('administrador', 'entrenador'), validar(esquemaActualizar), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

router.use('/:instruidoId/perfil-medico', (req, res, next) => {
  if (req.usuario.rol === 'instruido' && Number(req.usuario.id) !== Number(req.params.instruidoId)) {
    return res.status(403).json({ error: 'No puedes acceder al perfil médico de otro usuario' });
  }
  if (!['administrador', 'entrenador', 'instruido'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}, rutasPerfilMedico);

module.exports = router;
