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
 *       administrador ve todos. Filtros opcionales por query string.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: instruidoId
 *         required: false
 *         schema: { type: integer }
 *       - in: query
 *         name: rutinaId
 *         required: false
 *         schema: { type: integer }
 *       - in: query
 *         name: estado
 *         required: false
 *         schema: { type: string, enum: [en_progreso, completado, cancelado] }
 *       - in: query
 *         name: desde
 *         required: false
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: hasta
 *         required: false
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de registros de entrenamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroEntrenamientoResponse'
 *             example:
 *               - id: 1
 *                 rutinaAsignadaId: 1
 *                 instruidoId: 2
 *                 fecha: 2025-07-10
 *                 ejerciciosRealizados:
 *                   - ejercicioId: 1
 *                     seriesCompletadas: 4
 *                 duracionMinutos: 55
 *                 percepcionEsfuerzo: 7
 *                 observaciones: Buena sesión
 *                 estado: completado
 *                 fechaInicio: 2025-07-10T08:00:00.000Z
 *                 fechaFin: 2025-07-10T08:55:00.000Z
 *               - id: 2
 *                 rutinaAsignadaId: 1
 *                 instruidoId: 2
 *                 fecha: 2025-07-12
 *                 estado: en_progreso
 *                 fechaInicio: 2025-07-12T09:00:00.000Z
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   post:
 *     tags: [Registro Entrenamiento]
 *     summary: Crear registro de entrenamiento completo
 *     description: >
 *       Crea un registro con ejercicios realizados de una sola vez.
 *       Si quien registra es entrenador/administrador, se requiere instruidoId.
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
 *         description: Validación Joi fallida o falta instruidoId para entrenadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validacion:
 *                 summary: Validación Joi
 *                 value: { error: '"rutinaAsignadaId" is required' }
 *               faltaInstruido:
 *                 summary: Entrenador sin instruidoId
 *                 value: { error: 'instruidoId es requerido para registrar el entrenamiento' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Instruido no encontrado o no pertenece al entrenador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado o no pertenece al entrenador' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *             example:
 *               id: 1
 *               rutinaAsignadaId: 1
 *               instruidoId: 2
 *               fecha: 2025-07-10
 *               duracionMinutos: 55
 *               percepcionEsfuerzo: 7
 *               observaciones: Buena sesión
 *               estado: completado
 *               fechaInicio: 2025-07-10T08:00:00.000Z
 *               fechaFin: 2025-07-10T08:55:00.000Z
 *               series:
 *                 - id: 1
 *                   registroEntrenamientoId: 1
 *                   ejercicioId: 1
 *                   numeroSerie: 1
 *                   repeticionesRealizadas: 8
 *                   pesoKg: 60
 *                   descansoSegundos: 90
 *                   rpe: 7
 *                   ejercicio: { id: 1, nombre: Sentadilla con barra, grupoMuscular: Cuádriceps }
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/:id', validar(esquemaIdParams, 'params'), ctrl.obtenerPorId);
router.delete('/:id', validar(esquemaIdParams, 'params'), ctrl.eliminar);

/**
 * @openapi
 * /api/entrenamiento/registro/iniciar:
 *   post:
 *     tags: [Registro Entrenamiento]
 *     summary: Iniciar una sesión de entrenamiento
 *     description: >
 *       Crea un registro en estado "en_progreso" para una rutina asignada.
 *       Si quien inicia es entrenador/administrador, se requiere instruidoId.
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
 *         description: Validación Joi fallida o falta instruidoId para entrenadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validacion:
 *                 summary: Validación Joi
 *                 value: { error: '"rutinaAsignadaId" is required' }
 *               faltaInstruido:
 *                 summary: Entrenador sin instruidoId
 *                 value: { error: 'instruidoId es requerido para registrar el entrenamiento' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: La rutina indicada no pertenece al instruido autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No tienes permiso para iniciar esta rutina' }
 *       404:
 *         description: Rutina o instruido no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rutina:
 *                 summary: Rutina asignada no encontrada
 *                 value: { error: 'Rutina asignada no encontrada' }
 *               instruido:
 *                 summary: Instruido no disponible
 *                 value: { error: 'Instruido no encontrado o no pertenece al entrenador' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/iniciar', validar(esquemaIniciar), ctrl.iniciar);

/**
 * @openapi
 * /api/entrenamiento/registro/{id}/series:
 *   post:
 *     tags: [Registro Entrenamiento]
 *     summary: Agregar serie a un registro
 *     description: Solo se permiten series mientras la sesión está en estado "en_progreso".
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
 *         description: Validación Joi o sesión/ejercicio en estado no válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sesionFinalizada:
 *                 summary: Sesión no en progreso
 *                 value: { error: 'No se pueden modificar series de una sesión que no está en progreso' }
 *               ejercicioAjeno:
 *                 summary: Ejercicio fuera de la rutina
 *                 value: { error: 'El ejercicio no pertenece a la rutina asignada' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro no encontrado (o sin acceso)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         description: Lista de series con datos del ejercicio del catálogo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SerieResponse'
 *             example:
 *               - id: 1
 *                 registroEntrenamientoId: 1
 *                 ejercicioId: 1
 *                 numeroSerie: 1
 *                 repeticionesRealizadas: 8
 *                 pesoKg: 60
 *                 descansoSegundos: 90
 *                 rpe: 7
 *                 ejercicio: { id: 1, nombre: Sentadilla con barra, grupoMuscular: Cuádriceps }
 *               - id: 2
 *                 registroEntrenamientoId: 1
 *                 ejercicioId: 1
 *                 numeroSerie: 2
 *                 repeticionesRealizadas: 6
 *                 pesoKg: 62.5
 *                 descansoSegundos: 120
 *                 rpe: 8
 *                 ejercicio: { id: 1, nombre: Sentadilla con barra, grupoMuscular: Cuádriceps }
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro no encontrado (o sin acceso)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/:id/series', validar(esquemaIdParams, 'params'), validar(esquemaSerie), ctrl.crearSerie);
router.get('/:id/series', validar(esquemaIdParams, 'params'), ctrl.listarSeries);

/**
 * @openapi
 * /api/entrenamiento/registro/{id}/series/{serieId}:
 *   put:
 *     tags: [Registro Entrenamiento]
 *     summary: Editar una serie
 *     description: Solo se permiten ediciones mientras la sesión está en estado "en_progreso". Debe enviarse al menos un campo.
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
 *         description: Validación Joi o sesión/ejercicio en estado no válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sesionFinalizada:
 *                 summary: Sesión no en progreso
 *                 value: { error: 'No se pueden modificar series de una sesión que no está en progreso' }
 *               ejercicioAjeno:
 *                 summary: Ejercicio fuera de la rutina
 *                 value: { error: 'El ejercicio no pertenece a la rutina asignada' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro o serie no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serie:
 *                 summary: Serie no encontrada
 *                 value: { error: 'Serie no encontrada' }
 *               registro:
 *                 summary: Registro no encontrado
 *                 value: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   delete:
 *     tags: [Registro Entrenamiento]
 *     summary: Eliminar una serie
 *     description: Solo se permiten eliminaciones mientras la sesión está en estado "en_progreso".
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
 *         description: Sesión no en progreso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No se pueden modificar series de una sesión que no está en progreso' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro o serie no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serie:
 *                 summary: Serie no encontrada
 *                 value: { error: 'Serie no encontrada' }
 *               registro:
 *                 summary: Registro no encontrado
 *                 value: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         description: Sesión ya finalizada o cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'La sesión ya fue finalizada o cancelada' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         description: La sesión no está en progreso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Solo se pueden cancelar sesiones en progreso' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Registro no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.patch('/:id/cancelar', validar(esquemaIdParams, 'params'), validar(esquemaCancelar), ctrl.cancelar);

module.exports = router;
