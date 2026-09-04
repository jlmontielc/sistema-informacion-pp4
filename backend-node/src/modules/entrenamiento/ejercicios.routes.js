const { Router } = require('express');
const ctrl = require('./ejercicios.controller');
const { autorizar } = require('../../shared/middleware/autorizar');

const router = Router();

/**
 * @openapi
 * /api/entrenamiento/ejercicios:
 *   get:
 *     tags: [Ejercicios]
 *     summary: Listar ejercicios del catálogo
 *     description: >
 *       Devuelve ejercicios paginados con filtros opcionales por grupo muscular,
 *       target, equipo necesario, dificultad y búsqueda por nombre.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         required: false
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         required: false
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: grupoMuscular
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: target
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: equipoNecesario
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: dificultad
 *         required: false
 *         schema: { type: string, enum: [principiante, intermedio, avanzado] }
 *       - in: query
 *         name: busqueda
 *         required: false
 *         schema: { type: string }
 *         description: Búsqueda por nombre de ejercicio
 *     responses:
 *       200:
 *         description: Lista paginada de ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioListResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   post:
 *     tags: [Ejercicios]
 *     summary: Crear un ejercicio en el catálogo
 *     description: Solo administradores y entrenadores pueden crear ejercicios.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EjercicioCreateRequest'
 *     responses:
 *       201:
 *         description: Ejercicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/', ctrl.obtenerTodos);
router.post('/', autorizar('administrador', 'entrenador'), ctrl.crear);

/**
 * @openapi
 * /api/entrenamiento/ejercicios/{id}:
 *   get:
 *     tags: [Ejercicios]
 *     summary: Obtener ejercicio por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ejercicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Ejercicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Ejercicio no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   put:
 *     tags: [Ejercicios]
 *     summary: Actualizar ejercicio
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
 *             $ref: '#/components/schemas/EjercicioUpdateRequest'
 *     responses:
 *       200:
 *         description: Ejercicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Ejercicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Ejercicio no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Ejercicios]
 *     summary: Eliminar ejercicio
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Ejercicio eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Ejercicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Ejercicio no encontrado' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:id', ctrl.obtenerPorId);
router.put('/:id', autorizar('administrador', 'entrenador'), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

module.exports = router;
