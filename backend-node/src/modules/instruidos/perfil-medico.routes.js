const { Router } = require('express');
const ctrl = require('./perfil-medico.controller');
const { validar } = require('../../shared/middleware/validate');
const { esquemaPerfilMedico } = require('./perfil-medico.validation');

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/instruidos/{instruidoId}/perfil-medico:
 *   get:
 *     tags: [Instruidos]
 *     summary: Obtener perfil médico de un instruido
 *     description: Devuelve el perfil médico del instruido especificado.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Perfil médico encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilMedicoResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         description: No puede acceder al perfil médico de otro usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No puedes acceder al perfil médico de otro usuario' }
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   put:
 *     tags: [Instruidos]
 *     summary: Crear o actualizar perfil médico
 *     description: Crea o actualiza el perfil médico del instruido. Los campos sensibles se cifran con AES-256-CBC.
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
 *             $ref: '#/components/schemas/PerfilMedicoRequest'
 *     responses:
 *       200:
 *         description: Perfil médico creado o actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilMedicoResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Acceso denegado' }
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/', ctrl.obtenerPorInstruido);
router.put('/', validar(esquemaPerfilMedico), ctrl.crearOActualizar);

module.exports = router;
