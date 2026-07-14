const { Router } = require('express');
const ctrl = require('./rutinas-asignadas.controller');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const {
  esquemaCrear,
  esquemaActualizar,
  esquemaAgregarEjercicio,
  esquemaEditarEjercicio,
  esquemaReordenar,
  esquemaClonar,
} = require('./rutinas-asignadas.validation');

const router = Router();

router.get('/', ctrl.obtenerTodos);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrear), ctrl.crear);
router.put('/:id', autorizar('administrador', 'entrenador'), validar(esquemaActualizar), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

router.post(
  '/clonar/:plantillaId',
  autorizar('administrador', 'entrenador'),
  validar(esquemaClonar),
  ctrl.clonarDesdePlantilla
);

router.get('/:id/dia/:dia', ctrl.obtenerPorDia);
router.get('/:id/resumen', ctrl.obtenerResumenSemanal);

router.post(
  '/:id/dia/:dia/ejercicios',
  autorizar('administrador', 'entrenador'),
  validar(esquemaAgregarEjercicio),
  ctrl.agregarEjercicioADia
);
router.put(
  '/:id/dia/:dia/ejercicios/:idx',
  autorizar('administrador', 'entrenador'),
  validar(esquemaEditarEjercicio),
  ctrl.editarEjercicioEnDia
);
router.delete(
  '/:id/dia/:dia/ejercicios/:idx',
  autorizar('administrador', 'entrenador'),
  ctrl.eliminarEjercicioDeDia
);
router.put(
  '/:id/dia/:dia/reordenar',
  autorizar('administrador', 'entrenador'),
  validar(esquemaReordenar),
  ctrl.reordenarDia
);

module.exports = router;
