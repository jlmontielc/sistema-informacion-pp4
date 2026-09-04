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
 *         description: Lista de dietas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DietaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
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
 *       409:
 *         description: Guardian dietético bloqueó la generación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Guardian dietético bloqueó la generación' }
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
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   put:
 *     tags: [Dietas]
 *     summary: Actualizar dieta
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
 *             $ref: '#/components/schemas/DietaCreateRequest'
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
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
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
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
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
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Dieta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Dieta no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.post(
  '/:id/decision',
  autorizar('administrador', 'entrenador'),
  validar(esquemaIdParam, 'params'),
  validar(esquemaDecisionDieta),
  ctrl.decidir,
);

module.exports = router;
