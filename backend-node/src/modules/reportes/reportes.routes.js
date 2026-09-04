const { Router } = require('express');
const ctrl = require('./reportes.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');

const router = Router();

router.use(autenticar);

/**
 * @openapi
 * /api/reportes/rendimiento/{instruidoId}:
 *   get:
 *     tags: [Reportes]
 *     summary: Rendimiento mensual de un instruido
 *     description: >
 *       Devuelve el historial de rendimiento mensual de un instruido específico.
 *       Solo accesible por entrenadores y administradores.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de registros de rendimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RendimientoMensualResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/rendimiento/:instruidoId', autorizar('administrador', 'entrenador'), ctrl.rendimientoMensual);

/**
 * @openapi
 * /api/reportes/rendimiento/yo:
 *   get:
 *     tags: [Reportes]
 *     summary: Mi rendimiento mensual
 *     description: Devuelve el historial de rendimiento mensual del instruido autenticado.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de registros de rendimiento del instruido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RendimientoMensualResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/rendimiento/yo', autorizar('instruido'), ctrl.rendimientoMensual);

module.exports = router;
