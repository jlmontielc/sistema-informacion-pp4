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
 *     description: Entrenador ve dietas de sus instruidos; instruido ve las suyas; administrador ve todas.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de dietas }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /api/dietas:
 *   post:
 *     tags: [Dietas]
 *     summary: Crear dieta manualmente
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [instruidoId, objetivoCalorico]
 *             properties:
 *               instruidoId: { type: integer }
 *               objetivoCalorico: { type: integer, minimum: 800, maximum: 8000 }
 *               proteinas: { type: number, minimum: 0 }
 *               carbohidratos: { type: number, minimum: 0 }
 *               grasas: { type: number, minimum: 0 }
 *               observaciones: { type: string }
 *               fechaInicio: { type: string, format: date }
 *               fechaFin: { type: string, format: date }
 *     responses:
 *       201: { description: Dieta creada }
 *       400: { $ref: '#/components/responses/Error' }
 *       404: { $ref: '#/components/responses/Error' }
 */
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrearDieta), ctrl.create);

/**
 * @openapi
 * /api/dietas/generar/{instruidoId}:
 *   post:
 *     tags: [Dietas]
 *     summary: Generar dieta con IA para un instruido
 *     description: Llama a Flask para calcular macros según TMB, propósito y datos médicos. Devuelve la dieta como borrador pendiente de decisión del entrenador.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proposito:
 *                 type: string
 *                 enum: [perder_peso, ganar_musculo, mantener]
 *                 default: mantener
 *     responses:
 *       201: { description: Dieta generada como borrador }
 *       404: { $ref: '#/components/responses/Error' }
 *       409: { description: Guardian dietético bloqueó la generación }
 *       503: { description: Servicio de IA no disponible }
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
 *       200: { description: Dieta encontrada }
 *       404: { $ref: '#/components/responses/Error' }
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
 *             type: object
 *             properties:
 *               objetivoCalorico: { type: integer }
 *               proteinas: { type: number }
 *               carbohidratos: { type: number }
 *               grasas: { type: number }
 *               observaciones: { type: string }
 *               fechaInicio: { type: string, format: date }
 *               fechaFin: { type: string, format: date }
 *               activo: { type: boolean }
 *     responses:
 *       200: { description: Dieta actualizada }
 *       400: { $ref: '#/components/responses/Error' }
 *       404: { $ref: '#/components/responses/Error' }
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
 *       200: { description: Dieta desactivada }
 *       404: { $ref: '#/components/responses/Error' }
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
 *     description: El entrenador acepta, modifica o rechaza una dieta. Aceptada activa la dieta; modificada aplica cambios y activa; rechazada desactiva.
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
 *             type: object
 *             required: [accion]
 *             properties:
 *               accion:
 *                 type: string
 *                 enum: [aceptada, modificada, rechazada]
 *               comentario: { type: string }
 *               objetivoCalorico: { type: integer }
 *               proteinas: { type: number }
 *               carbohidratos: { type: number }
 *               grasas: { type: number }
 *               observaciones: { type: string }
 *               fechaInicio: { type: string, format: date }
 *               fechaFin: { type: string, format: date }
 *     responses:
 *       200: { description: Decisión registrada }
 *       400: { $ref: '#/components/responses/Error' }
 *       404: { $ref: '#/components/responses/Error' }
 */
router.post(
  '/:id/decision',
  autorizar('administrador', 'entrenador'),
  validar(esquemaIdParam, 'params'),
  validar(esquemaDecisionDieta),
  ctrl.decidir,
);

module.exports = router;
