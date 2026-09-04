const { Router } = require('express');
const ctrl = require('./reportes.controller');
const reportesValidation = require('./reportes.validation');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');

const router = Router();

router.use(autenticar);

/**
 * @openapi
 * /api/reportes/grupos-musculares/yo:
 *   get:
 *     tags: [Reportes]
 *     summary: Mis métricas por grupo muscular
 *     description: Devuelve volumen, peso máximo, series y sesiones por grupo muscular del instruido autenticado.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema: { type: string, enum: ['7d', '30d', '3m'], default: '30d' }
 *     responses:
 *       200:
 *         description: Métricas agrupadas por grupo muscular
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteGruposResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/grupos-musculares/yo',
  autorizar('instruido'),
  validar(reportesValidation.consultaPeriodo, 'query'),
  ctrl.obtenerMetricasPorGrupo,
);

/**
 * @openapi
 * /api/reportes/grupos-musculares/{instruidoId}:
 *   get:
 *     tags: [Reportes]
 *     summary: Métricas por grupo muscular de un instruido
 *     description: Devuelve métricas por grupo muscular de un instruido específico. Solo entrenadores y administradores.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: periodo
 *         schema: { type: string, enum: ['7d', '30d', '3m'], default: '30d' }
 *     responses:
 *       200:
 *         description: Métricas agrupadas por grupo muscular
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteGruposResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/grupos-musculares/:instruidoId',
  autorizar('administrador', 'entrenador'),
  validar(reportesValidation.paramsInstruido, 'params'),
  validar(reportesValidation.consultaPeriodo, 'query'),
  ctrl.obtenerMetricasPorGrupo,
);

/**
 * @openapi
 * /api/reportes/evolucion/yo/{grupoMuscular}:
 *   get:
 *     tags: [Reportes]
 *     summary: Mi evolución semanal por grupo muscular
 *     description: Devuelve la evolución semanal de un grupo muscular específico para el instruido autenticado.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: grupoMuscular
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: periodo
 *         schema: { type: string, enum: ['7d', '30d', '3m'], default: '30d' }
 *     responses:
 *       200:
 *         description: Evolución semanal del grupo muscular
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteEvolucionResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/evolucion/yo/:grupoMuscular',
  autorizar('instruido'),
  validar(reportesValidation.paramsEvolucionInstruido, 'params'),
  validar(reportesValidation.consultaPeriodo, 'query'),
  ctrl.obtenerEvolucion,
);

/**
 * @openapi
 * /api/reportes/grupos-musculares/{instruidoId}/{grupoMuscular}/evolucion:
 *   get:
 *     tags: [Reportes]
 *     summary: Evolución semanal por grupo muscular de un instruido
 *     description: Devuelve la evolución semanal de un grupo muscular específico. Solo entrenadores y administradores.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: grupoMuscular
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: periodo
 *         schema: { type: string, enum: ['7d', '30d', '3m'], default: '30d' }
 *     responses:
 *       200:
 *         description: Evolución semanal del grupo muscular
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteEvolucionResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/grupos-musculares/:instruidoId/:grupoMuscular/evolucion',
  autorizar('administrador', 'entrenador'),
  validar(reportesValidation.paramsEvolucion, 'params'),
  validar(reportesValidation.consultaPeriodo, 'query'),
  ctrl.obtenerEvolucion,
);

/**
 * @openapi
 * /api/reportes/comparativa/yo:
 *   get:
 *     tags: [Reportes]
 *     summary: Mi comparativa de rendimiento
 *     description: Compara el rendimiento del período contra el promedio histórico global del instruido autenticado.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema: { type: string, enum: ['7d', '30d', '3m'], default: '30d' }
 *     responses:
 *       200:
 *         description: Comparativa de rendimiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteComparativaResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/comparativa/yo',
  autorizar('instruido'),
  validar(reportesValidation.consultaPeriodo, 'query'),
  ctrl.obtenerComparativa,
);

/**
 * @openapi
 * /api/reportes/comparativa/{instruidoId}:
 *   get:
 *     tags: [Reportes]
 *     summary: Comparativa de rendimiento de un instruido
 *     description: Compara el rendimiento del período contra su histórico y contra el promedio de otros instruidos. Solo entrenadores y administradores.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: periodo
 *         schema: { type: string, enum: ['7d', '30d', '3m'], default: '30d' }
 *     responses:
 *       200:
 *         description: Comparativa de rendimiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteComparativaResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/comparativa/:instruidoId',
  autorizar('administrador', 'entrenador'),
  validar(reportesValidation.paramsInstruido, 'params'),
  validar(reportesValidation.consultaPeriodo, 'query'),
  ctrl.obtenerComparativa,
);

/**
 * @openapi
 * /api/reportes/instruidos:
 *   get:
 *     tags: [Reportes]
 *     summary: Listar instruidos para reportes
 *     description: Devuelve el listado de instruidos accesibles. Un entrenador solo ve los suyos; un administrador ve todos.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de instruidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 instruidos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InstruidoResumenReporte'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get(
  '/instruidos',
  autorizar('administrador', 'entrenador'),
  ctrl.listarInstruidos,
);

module.exports = router;
