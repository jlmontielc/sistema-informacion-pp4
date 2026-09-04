const { Router } = require('express');
const ctrl = require('./hitl.controller');
const feedbackCtrl = require('./hitl-feedback.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const { esquemaClienteIdParam } = require('./hitl.validation');
const { esquemaFeedbackHitl } = require('./hitl-feedback.validation');

const router = Router();

/**
 * @openapi
 * /api/entrenamiento/ia/rutina/{clienteId}:
 *   post:
 *     tags: [HITL]
 *     summary: Sugerir rutina de entrenamiento con IA
 *     description: >
 *       Llama a Flask para generar una recomendación de rutina basada en perfil del cliente,
 *       historial de entrenamiento, lesiones y preferencias. Valida con Guardian antes de persistir.
 *       Devuelve la rutina como borrador pendiente de decisión del entrenador.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID del instruido (cliente)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HITLSugerenciaRutinaRequest'
 *     responses:
 *       200:
 *         description: Rutina sugerida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HITLSugerenciaRutinaResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Instruido no encontrado o no pertenece al entrenador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado o no pertenece al entrenador' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *       503:
 *         description: Servicio de IA (Flask) no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Flask API error: 503' }
 */
router.post(
  '/ia/rutina/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  validar(esquemaClienteIdParam, 'params'),
  ctrl.sugerirRutina,
);

/**
 * @openapi
 * /api/entrenamiento/ia/validate/{ejercicioId}/{clienteId}:
 *   get:
 *     tags: [HITL]
 *     summary: Validar ejercicio con IA (Guardian de seguridad)
 *     description: Valida si un ejercicio es seguro para el perfil del cliente según lesiones y condiciones.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ejercicioId
 *         required: true
 *         schema: { type: integer }
 *         description: ID del ejercicio a validar
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID del instruido (cliente)
       *       - in: query
       *         name: cargaKg
       *         required: false
       *         schema: { type: number }
       *         description: Carga en kg (opcional)
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HITLValidacionEjercicioResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *       503:
 *         description: Servicio de IA (Flask) no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Flask API error: 503' }
 */
router.get(
  '/ia/validate/:ejercicioId/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  ctrl.validarEjercicio,
);

/**
 * @openapi
 * /api/entrenamiento/ia/feedback:
 *   post:
 *     tags: [HITL]
 *     summary: Registrar feedback del entrenador sobre una sugerencia de IA
 *     description: El entrenador aprueba, rechaza o modifica una rutina/dieta sugerida por IA.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HITLFeedbackRequest'
 *     responses:
 *       201:
 *         description: Feedback registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HITLFeedbackResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   get:
 *     tags: [HITL]
 *     summary: Listar feedback del entrenador (rutinas)
 *     description: Devuelve el historial de feedback del entrenador autenticado sobre rutinas.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         required: false
 *         schema: { type: integer }
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: accion
 *         required: false
 *         schema: { type: string, enum: [aprobada, rechazada, modificada] }
 *         description: Filtrar por acción
 *       - in: query
 *         name: limite
 *         required: false
 *         schema: { type: integer }
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HITLFeedbackResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.post(
  '/ia/feedback',
  autenticar,
  autorizar('administrador', 'entrenador'),
  validar(esquemaFeedbackHitl),
  feedbackCtrl.registrarFeedback,
);

router.get(
  '/ia/feedback',
  autenticar,
  autorizar('administrador', 'entrenador'),
  feedbackCtrl.listarFeedback,
);

/**
 * @openapi
 * /api/entrenamiento/ia/dieta/{clienteId}:
 *   post:
 *     tags: [HITL]
 *     summary: Sugerir dieta con IA para un instruido
 *     description: >
 *       Llama a Flask para calcular macros según TMB, propósito y datos médicos.
 *       Devuelve la dieta como borrador pendiente de decisión del entrenador.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID del instruido (cliente)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HITLSugerenciaDietaRequest'
 *     responses:
 *       200:
 *         description: Dieta sugerida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HITLSugerenciaDietaResponse'
 *       400:
 *         description: No existe cálculo metabólico para el cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No existe cálculo metabólico para este cliente. Genere uno primero desde metabolismo.' }
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Instruido no encontrado o no pertenece al entrenador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado o no pertenece al entrenador' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *       503:
 *         description: Servicio de IA (Flask) no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Flask API error: 503' }
 */
router.post(
  '/ia/dieta/:clienteId',
  autenticar,
  autorizar('administrador', 'entrenador'),
  validar(esquemaClienteIdParam, 'params'),
  ctrl.sugerirDieta,
);

/**
 * @openapi
 * /api/entrenamiento/ia/feedback/dietas:
 *   get:
 *     tags: [HITL]
 *     summary: Listar feedback del entrenador (dietas)
 *     description: Devuelve el historial de feedback del entrenador autenticado sobre dietas.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         required: false
 *         schema: { type: integer }
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: limite
 *         required: false
 *         schema: { type: integer }
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de feedback de dietas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HITLFeedbackResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/ia/feedback/dietas',
  autenticar,
  autorizar('administrador', 'entrenador'),
  feedbackCtrl.listarFeedbackDietas,
);

module.exports = router;
