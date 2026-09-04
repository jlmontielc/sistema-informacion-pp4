const { Router } = require('express');
const ctrl = require('./instruido.controller');
const { validar } = require('../../shared/middleware/validate');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { esquemaCrear, esquemaActualizar, esquemaActualizarPropio } = require('./instruido.validation');
const { esquemaPerfilMedico } = require('./perfil-medico.validation');
const rutasPerfilMedico = require('./perfil-medico.routes');

const router = Router();

router.use(autenticar);

/**
 * @openapi
 * /api/instruidos/yo:
 *   get:
 *     tags: [Instruidos]
 *     summary: Obtener mi perfil de instruido
 *     description: Devuelve el perfil completo del instruido autenticado.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Perfil del instruido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       401:
 *         $ref: '#/components/responses/Error'
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
 *     summary: Actualizar mi perfil de instruido
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, maxLength: 100 }
 *               peso: { type: number }
 *               altura: { type: number }
 *               nivelActividad: { type: string, enum: [sedentario, ligero, moderado, activo, muy_activo] }
 *               propositoEntrenamiento: { type: string }
 *               diasDisponibles: { type: integer, minimum: 1, maximum: 7 }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
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
router.get('/yo', autorizar('instruido'), ctrl.obtenerMiPerfil);
router.put('/yo', autorizar('instruido'), validar(esquemaActualizarPropio), ctrl.actualizarMiPerfil);

/**
 * @openapi
 * /api/instruidos/yo/perfil-medico:
 *   get:
 *     tags: [Instruidos]
 *     summary: Obtener mi perfil médico
 *     description: Devuelve el perfil médico del instruido autenticado (campos cifrados).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Perfil médico (campos sensibles cifrados con AES-256-CBC)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilMedicoResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   put:
 *     tags: [Instruidos]
 *     summary: Actualizar mi perfil médico
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilMedicoRequest'
 *     responses:
 *       200:
 *         description: Perfil médico actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilMedicoResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/yo/perfil-medico', autorizar('instruido'), ctrl.obtenerMiPerfilMedico);
router.put('/yo/perfil-medico', autorizar('instruido'), validar(esquemaPerfilMedico), ctrl.actualizarMiPerfilMedico);

/**
 * @openapi
 * /api/instruidos:
 *   get:
 *     tags: [Instruidos]
 *     summary: Listar todos los instruidos
 *     description: >
 *       Entrenador ve solo sus instruidos; administrador ve todos.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de instruidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserInstruido'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   post:
 *     tags: [Instruidos]
 *     summary: Crear un instruido (entrenador/administrador)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInstruidoRequest'
 *     responses:
 *       201:
 *         description: Instruido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'El email ya está registrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/', autorizar('administrador', 'entrenador'), ctrl.obtenerTodos);
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrear), ctrl.crear);

/**
 * @openapi
 * /api/instruidos/{id}:
 *   get:
 *     tags: [Instruidos]
 *     summary: Obtener instruido por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Instruido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
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
 *     summary: Actualizar instruido
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
 *             $ref: '#/components/schemas/RegisterInstruidoRequest'
 *     responses:
 *       200:
 *         description: Instruido actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'El email ya está registrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Instruidos]
 *     summary: Eliminar instruido (borrado lógico)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Instruido eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
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
router.get('/:id', autorizar('administrador', 'entrenador'), ctrl.obtenerPorId);
router.put('/:id', autorizar('administrador', 'entrenador'), validar(esquemaActualizar), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

/**
 * @openapi
 * /api/instruidos/{instruidoId}/perfil-medico:
 *   get:
 *     tags: [Instruidos]
 *     summary: Obtener perfil médico de un instruido
 *     description: >
 *       Entrenador/administrador puede ver el perfil médico de cualquier instruido.
 *       Instruido solo puede ver el suyo propio.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: instruidoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Perfil médico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilMedicoResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
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
 *     summary: Actualizar perfil médico de un instruido
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
 *         description: Perfil médico actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilMedicoResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
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
router.use('/:instruidoId/perfil-medico', (req, res, next) => {
  if (req.usuario.rol === 'instruido' && Number(req.usuario.id) !== Number(req.params.instruidoId)) {
    return res.status(403).json({ error: 'No puedes acceder al perfil médico de otro usuario' });
  }
  if (!['administrador', 'entrenador', 'instruido'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}, rutasPerfilMedico);

module.exports = router;
