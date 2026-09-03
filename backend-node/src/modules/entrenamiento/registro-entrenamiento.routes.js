const { Router } = require('express');
const ctrl = require('./registro-entrenamiento.controller');
const { validar } = require('../../shared/middleware/validate');
const {
  esquemaCrearRegistro,
  esquemaIniciar,
  esquemaSerie,
  esquemaEditarSerie,
  esquemaFinalizar,
  esquemaCancelar,
  esquemaIdParams,
  esquemaSerieIdParams,
} = require('./registro-entrenamiento.validation');

const router = Router();

router.get('/', ctrl.obtenerTodos);
router.get('/:id', validar(esquemaIdParams, 'params'), ctrl.obtenerPorId);
router.post('/', validar(esquemaCrearRegistro), ctrl.crear);
router.post('/iniciar', validar(esquemaIniciar), ctrl.iniciar);
router.post('/:id/series', validar(esquemaIdParams, 'params'), validar(esquemaSerie), ctrl.crearSerie);
router.get('/:id/series', validar(esquemaIdParams, 'params'), ctrl.listarSeries);
router.put('/:id/series/:serieId', validar(esquemaSerieIdParams, 'params'), validar(esquemaEditarSerie), ctrl.editarSerie);
router.delete('/:id/series/:serieId', validar(esquemaSerieIdParams, 'params'), ctrl.eliminarSerie);
router.patch('/:id/finalizar', validar(esquemaIdParams, 'params'), validar(esquemaFinalizar), ctrl.finalizar);
router.patch('/:id/cancelar', validar(esquemaIdParams, 'params'), validar(esquemaCancelar), ctrl.cancelar);
router.delete('/:id', validar(esquemaIdParams, 'params'), ctrl.eliminar);

module.exports = router;
