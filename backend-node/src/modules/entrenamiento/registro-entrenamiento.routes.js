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

/**
 * @openapi
 * /api/entrenamiento/registro:
 *   get:
 *     tags: [Registro Entrenamiento]
 *     summary: Listar registros de entrenamiento
 *     description: >
 *       Instruido ve sus registros; entrenador ve registros de sus instruidos;
 *       administrador ve todos.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de registros de entrenamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroEntrenamientoResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   post:
 *     tags: [Registro Entrenamiento]
 *     summary: Crear registro de entrenamiento completo
 *     description: Crea un registro con ejercicios realizados de una sola vez.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroCrearRequest'
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroEntrenamientoResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/', ctrl.obtenerTodos);
router.post('/', validar(esquemaCrearRegistro), ctrl.crear);

/**
 * @openapi
 * /api/entrenamiento/registro/{id}:
 *   get:
 *     tags: [Registro Entrenamiento]
 *     summary: Obtener registro por ID (con series)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Registro encontrado con sus series
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RegistroEntrenamientoResponse'
 *                 - type: object
 *                   properties:
 *                     series:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SerieResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Registro Entrenamiento]
 *     summary: Eliminar registro de entrenamiento
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Registro eliminado exitosamente
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:id', validar(esquemaIdParams, 'params'), ctrl.obtenerPorId);
router.delete('/:id', validar(esquemaIdParams, 'params'), ctrl.eliminar);

/**
 * @openapi
 * /api/entrenamiento/registro/iniciar:
 *   post:
 *     tags: [Registro Entrenamiento]
 *     summary: Iniciar una sesión de entrenamiento
 *     description: Crea un registro en estado "en_progreso" para una rutina asignada.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroIniciarRequest'
 *     responses:
 *       201:
 *         description: Sesión iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroEntrenamientoResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.post('/iniciar', validar(esquemaIniciar), ctrl.iniciar);

/**
 * @openapi
 * /api/entrenamiento/registro/{id}/series:
 *   post:
 *     tags: [Registro Entrenamiento]
 *     summary: Agregar serie a un registro
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SerieCreateRequest'
 *     responses:
 *       201:
 *         description: Serie creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SerieResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   get:
 *     tags: [Registro Entrenamiento]
 *     summary: Listar series de un registro
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de series
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SerieResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.post('/:id/series', validar(esquemaIdParams, 'params'), validar(esquemaSerie), ctrl.crearSerie);
router.get('/:id/series', validar(esquemaIdParams, 'params'), ctrl.listarSeries);

/**
 * @openapi
 * /api/entrenamiento/registro/{id}/series/{serieId}:
 *   put:
 *     tags: [Registro Entrenamiento]
 *     summary: Editar una serie
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: serieId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SerieUpdateRequest'
 *     responses:
 *       200:
 *         description: Serie actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SerieResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Registro Entrenamiento]
 *     summary: Eliminar una serie
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: serieId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Serie eliminada, devuelve mensaje de confirmación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *             example: { message: 'Serie eliminada correctamente' }
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.put('/:id/series/:serieId', validar(esquemaSerieIdParams, 'params'), validar(esquemaEditarSerie), ctrl.editarSerie);
router.delete('/:id/series/:serieId', validar(esquemaSerieIdParams, 'params'), ctrl.eliminarSerie);

/**
 * @openapi
 * /api/entrenamiento/registro/{id}/finalizar:
 *   patch:
 *     tags: [Registro Entrenamiento]
 *     summary: Finalizar una sesión de entrenamiento
 *     description: Cambia el estado del registro a "completado" con duración y observaciones.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duracionMinutos: { type: integer, minimum: 0, maximum: 600 }
 *               observaciones: { type: string, maxLength: 2000 }
 *             example: { duracionMinutos: 55, observaciones: 'Buena sesión' }
 *     responses:
 *       200:
 *         description: Sesión finalizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroEntrenamientoResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.patch('/:id/finalizar', validar(esquemaIdParams, 'params'), validar(esquemaFinalizar), ctrl.finalizar);

/**
 * @openapi
 * /api/entrenamiento/registro/{id}/cancelar:
 *   patch:
 *     tags: [Registro Entrenamiento]
 *     summary: Cancelar una sesión de entrenamiento
 *     description: Cambia el estado del registro a "cancelado".
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones: { type: string, maxLength: 2000 }
 *             example: { observaciones: 'Cancelada por molestia en la rodilla' }
 *     responses:
 *       200:
 *         description: Sesión cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroEntrenamientoResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.patch('/:id/cancelar', validar(esquemaIdParams, 'params'), validar(esquemaCancelar), ctrl.cancelar);

module.exports = router;
