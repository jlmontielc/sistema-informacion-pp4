const { Router } = require('express');
const ctrl = require('./metabolismo.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { validar } = require('../../shared/middleware/validate');
const { esquemaCalculoMetabolico } = require('./metabolismo.validation');

const router = Router();

/**
 * @openapi
 * /api/metabolismo/calcular:
 *   post:
 *     tags: [Metabolismo]
 *     summary: Calcular tasa metabólica (TMB y GCT)
 *     description: >
 *       Calcula la Tasa Metabólica Basal (TMB) y el Gasto Calórico Total (GCT)
 *       usando la fórmula de Mifflin-St Jeor. Guarda el histórico para el cliente.
 *       Si el usuario es instruido, se usa su propio ID automáticamente.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetabolismoCalculoRequest'
 *     responses:
 *       200:
 *         description: Cálculo metabólico realizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetabolismoResultadoResponse'
 *       400:
 *         description: clienteId es requerido para entrenadores/administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'clienteId es requerido para calcular y guardar el histórico metabólico' }
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.post('/calcular', autenticar, validar(esquemaCalculoMetabolico), ctrl.calcular);

module.exports = router;
