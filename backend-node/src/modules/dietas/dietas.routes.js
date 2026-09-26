const { Router } = require('express');
const ctrl = require('./dietas.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const {
  esquemaCrearDieta,
  esquemaActualizarDieta,
  esquemaIdParam,
  esquemaGenerarDieta,
  esquemaDecisionDieta,
} = require('./dietas.validation');

const router = Router();

router.use(autenticar);

/**
 * @openapi
 * /api/dietas:
 *   get:
 *     tags: [Dietas]
 *     summary: Listar dietas del usuario autenticado
 *     description: >
 *       Entrenador ve dietas de sus instruidos; instruido ve las suyas;
 *       administrador ve todas.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de dietas (caché 120s)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DietaResponse'
 *             example:
 *               - id: 1
 *                 instruidoId: 2
 *                 entrenadorId: 1
 *                 objetivoCalorico: 2200
 *                 proteinas: 140
 *                 carbohidratos: 250
 *                 grasas: 75
 *                 observaciones: Plan de mantenimiento
 *                 fechaInicio: 2025-07-01
 *                 fechaFin: 2025-07-31
 *                 activo: true
 *                 decision: aprobada
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   post:
 *     tags: [Dietas]
 *     summary: Crear dieta manualmente
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DietaCreateRequest'
 *     responses:
 *       201:
 *         description: Dieta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DietaResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
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
router.get('/', ctrl.getAll);
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrearDieta), ctrl.create);

/**
 * @openapi
 * /api/dietas/generar/{instruidoId}:
 *   post:
 *     tags: [Dietas]
 *     summary: Generar dieta con IA para un instruido
 *     description: >
 *       Llama a Flask para calcular macros según TMB, propósito y datos médicos.
 *       Devuelve la dieta como borrador pendiente de decisión del entrenador.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DietaGenerarRequest'
 *     responses:
 *       201:
 *         description: Dieta generada como borrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DietaGenerarResponse'
 *       400:
 *         description: No existe cálculo metabólico o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No existe cálculo metabólico para este cliente. Genere uno primero desde metabolismo.' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Instruido no encontrado o no pertenece al entrenador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado o no pertenece al entrenador' }
 *       409:
 *         description: Guardian dietético bloqueó la generación (respuesta completa de Flask en data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: 'string' }
 *                 data: { type: 'object', nullable: true }
 *             example:
 *               error: 'Guardian dietético bloqueó la generación'
 *               data: { success: false, guardian: { aprobado: false, alertas: [{ tipo: 'alergia', nivelRiesgo: 'alto', mensaje: 'Alergia a mariscos' }] } }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *       502:
 *         description: El servicio de IA respondió con un formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: 'string' }
 *                 data: { type: 'object', nullable: true }
 *             example: { error: 'Respuesta inválida del servicio de IA', data: { success: true } }
 *       503:
 *         description: Servicio de IA (Flask) no disponible o conexión rechazada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Servicio de IA no disponible' }
 *       504:
 *         description: Tiempo de espera agotado al contactar el servicio de IA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Timeout al conectar con servicio de IA' }
 */
router.post('/generar/:instruidoId', autorizar('administrador', 'entrenador'), validar(esquemaGenerarDieta), ctrl.generar);

/**
 * @openapi
 * /api/dietas/{id}:
 *   get:
 *     tags: [Dietas]
 *     summary: Obtener dieta por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dieta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DietaResponse'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   put:
 *     tags: [Dietas]
 *     summary: Actualizar dieta
 *     description: Debe enviarse al menos un campo de los editables (objetivoCalorico, proteinas, carbohidratos, grasas, observaciones, fechas, activo).
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
 *             $ref: '#/components/schemas/DietaUpdateRequest'
 *     responses:
 *       200:
 *         description: Dieta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DietaResponse'
 *       400:
 *         description: No se proporcionaron campos para actualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No se proporcionaron campos para actualizar' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   delete:
 *     tags: [Dietas]
 *     summary: Desactivar dieta (borrado lógico)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dieta desactivada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DietaResponse'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.route('/:id')
  .get(validar(esquemaIdParam, 'params'), ctrl.getById)
  .put(
    autorizar('administrador', 'entrenador'),
    validar(esquemaIdParam, 'params'),
    validar(esquemaActualizarDieta),
    ctrl.update,
  )
  .delete(
    autorizar('administrador', 'entrenador'),
    validar(esquemaIdParam, 'params'),
    ctrl.remove,
  );

/**
 * @openapi
 * /api/dietas/{id}/decision:
 *   post:
 *     tags: [Dietas]
 *     summary: Tomar decisión sobre una dieta generada por IA
 *     description: >
 *       El entrenador acepta, modifica o rechaza una dieta.
 *       - Aceptada: activa la dieta con los campos actuales.
 *       - Modificada: aplica cambios y activa.
 *       - Rechazada: desactiva la dieta.
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
 *             $ref: '#/components/schemas/DietaDecisionRequest'
 *     responses:
 *       200:
 *         description: Decisión registrada y dieta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DietaResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post(
  '/:id/decision',
  autorizar('administrador', 'entrenador'),
  validar(esquemaIdParam, 'params'),
  validar(esquemaDecisionDieta),
  ctrl.decidir,
);

module.exports = router;
