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
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   put:
 *     tags: [Instruidos]
 *     summary: Actualizar mi perfil de instruido
 *     description: Actualiza los datos del instruido autenticado. Debe enviarse al menos un campo.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstruidoUpdatePropioRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/yo', autorizar('instruido'), ctrl.obtenerMiPerfil);
router.put('/yo', autorizar('instruido'), validar(esquemaActualizarPropio), ctrl.actualizarMiPerfil);

/**
 * @openapi
 * /api/instruidos/yo/perfil-medico:
 *   get:
 *     tags: [Instruidos]
 *     summary: Obtener mi perfil médico
 *     description: Devuelve el perfil médico completo del instruido autenticado con los datos sensibles descifrados.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Perfil médico (datos sensibles descifrados)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilMedicoResponse'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *             example:
 *               - id: 2
 *                 nombre: Ana Martínez
 *                 email: ana@example.com
 *                 edad: 28
 *                 peso: 65.5
 *                 altura: 1.65
 *                 sexo: femenino
 *                 nivelActividad: activo
 *                 diasDisponibles: 4
 *                 diasSemana: [1, 3, 5, 6]
 *                 fechaRegistro: 2025-03-10
 *                 activo: true
 *                 entrenadorId: 1
 *                 rol: instruido
 *               - id: 6
 *                 nombre: Pedro López
 *                 email: pedro@example.com
 *                 edad: 30
 *                 peso: 82
 *                 altura: 1.8
 *                 sexo: masculino
 *                 nivelActividad: moderado
 *                 diasDisponibles: 3
 *                 diasSemana: [2, 4, 6]
 *                 fechaRegistro: 2025-07-01
 *                 activo: true
 *                 entrenadorId: 1
 *                 rol: instruido
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   post:
 *     tags: [Instruidos]
 *     summary: Crear un instruido (entrenador/administrador)
 *     description: >
 *       Crea un instruido. Nota: si el email ya está registrado, la base de datos
 *       lanza una excepción de unicidad que se reporta como error interno (500),
 *       no como 409.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstruidoCreateRequest'
 *     responses:
 *       201:
 *         description: Instruido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   put:
 *     tags: [Instruidos]
 *     summary: Actualizar instruido
 *     description: >
 *       Actualiza un instruido por ID (entrenador solo sobre sus asignados).
 *       Nota: un email duplicado se reporta como error interno (500), no como 409.
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
 *             $ref: '#/components/schemas/InstruidoUpdateRequest'
 *     responses:
 *       200:
 *         description: Instruido actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInstruido'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   delete:
 *     tags: [Instruidos]
 *     summary: Eliminar instruido (borrado físico)
 *     description: >
 *       Elimina definitivamente al instruido de la base de datos.
 *       Nota: el endpoint responde 204 incluso si el ID no existe (el borrado
 *       no verifica la existencia previa del registro).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Instruido eliminado (respuesta sin cuerpo, aplica incluso si no existía)
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *       Entrenador/administrador puede ver el perfil médico descifrado de un instruido.
 *       El entrenador solo puede acceder a los instruidos que tenga asignados.
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Instruido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.use('/:instruidoId/perfil-medico', (req, res, next) => {
  if (req.usuario.rol === 'instruido') {
    return res.status(403).json({ error: 'Accede a tu perfil médico desde /api/instruidos/yo/perfil-medico' });
  }
  if (!['administrador', 'entrenador'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}, rutasPerfilMedico);

module.exports = router;
