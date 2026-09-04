const { Router } = require('express');
const ctrl = require('./rutinas-asignadas.controller');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const {
  esquemaCrear,
  esquemaActualizar,
  esquemaAgregarEjercicio,
  esquemaEditarEjercicio,
  esquemaReordenar,
  esquemaClonar,
} = require('./rutinas-asignadas.validation');

const router = Router();

/**
 * @openapi
 * /api/entrenamiento/asignadas:
 *   get:
 *     tags: [Rutinas Asignadas]
 *     summary: Listar rutinas asignadas
 *     description: >
 *       Entrenador ve rutinas de sus instruidos; instruido ve las suyas;
 *       administrador ve todas.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de rutinas asignadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RutinaAsignadaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   post:
 *     tags: [Rutinas Asignadas]
 *     summary: Crear rutina asignada a un instruido
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RutinaCreateRequest'
 *     responses:
 *       201:
 *         description: Rutina creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaAsignadaResponse'
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
router.post('/', autorizar('administrador', 'entrenador'), validar(esquemaCrear), ctrl.crear);

/**
 * @openapi
 * /api/entrenamiento/asignadas/{id}:
 *   get:
 *     tags: [Rutinas Asignadas]
 *     summary: Obtener rutina por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rutina encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaAsignadaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   put:
 *     tags: [Rutinas Asignadas]
 *     summary: Actualizar rutina asignada
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
 *             $ref: '#/components/schemas/RutinaCreateRequest'
 *     responses:
 *       200:
 *         description: Rutina actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaAsignadaResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Rutinas Asignadas]
 *     summary: Eliminar rutina asignada (borrado lógico)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Rutina eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:id', ctrl.obtenerPorId);
router.put('/:id', autorizar('administrador', 'entrenador'), validar(esquemaActualizar), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

/**
 * @openapi
 * /api/entrenamiento/asignadas/clonar/{plantillaId}:
 *   post:
 *     tags: [Rutinas Asignadas]
 *     summary: Clonar plantilla como rutina asignada
 *     description: Crea una rutina asignada basada en una plantilla existente para un instruido específico.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: plantillaId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la plantilla a clonar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RutinaClonarRequest'
 *     responses:
 *       201:
 *         description: Rutina clonada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaAsignadaResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.post(
  '/clonar/:plantillaId',
  autorizar('administrador', 'entrenador'),
  validar(esquemaClonar),
  ctrl.clonarDesdePlantilla,
);

/**
 * @openapi
 * /api/entrenamiento/asignadas/{id}/dia/{dia}:
 *   get:
 *     tags: [Rutinas Asignadas]
 *     summary: Obtener ejercicios de un día específico de la rutina
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: dia
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 7 }
 *     responses:
 *       200:
 *         description: Ejercicios del día
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaDiaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:id/dia/:dia', ctrl.obtenerPorDia);

/**
 * @openapi
 * /api/entrenamiento/asignadas/{id}/resumen:
 *   get:
 *     tags: [Rutinas Asignadas]
 *     summary: Obtener resumen semanal de la rutina
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Resumen semanal de la rutina
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaResumenResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:id/resumen', ctrl.obtenerResumenSemanal);

/**
 * @openapi
 * /api/entrenamiento/asignadas/{id}/dia/{dia}/ejercicios:
 *   post:
 *     tags: [Rutinas Asignadas]
 *     summary: Agregar ejercicio a un día de la rutina
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: dia
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 7 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EjercicioRutinaItem'
 *     responses:
 *       201:
 *         description: Ejercicio agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioRutinaItem'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.post(
  '/:id/dia/:dia/ejercicios',
  autorizar('administrador', 'entrenador'),
  validar(esquemaAgregarEjercicio),
  ctrl.agregarEjercicioADia,
);

/**
 * @openapi
 * /api/entrenamiento/asignadas/{id}/dia/{dia}/ejercicios/{idx}:
 *   put:
 *     tags: [Rutinas Asignadas]
 *     summary: Editar ejercicio en un día de la rutina
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: dia
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 7 }
 *       - in: path
 *         name: idx
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EjercicioRutinaItem'
 *     responses:
 *       200:
 *         description: Ejercicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioRutinaItem'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Rutinas Asignadas]
 *     summary: Eliminar ejercicio de un día de la rutina
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: dia
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 7 }
 *       - in: path
 *         name: idx
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ejercicio eliminado, devuelve lista actualizada del día
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaDiaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.put(
  '/:id/dia/:dia/ejercicios/:idx',
  autorizar('administrador', 'entrenador'),
  validar(esquemaEditarEjercicio),
  ctrl.editarEjercicioEnDia,
);
router.delete(
  '/:id/dia/:dia/ejercicios/:idx',
  autorizar('administrador', 'entrenador'),
  ctrl.eliminarEjercicioDeDia,
);

/**
 * @openapi
 * /api/entrenamiento/asignadas/{id}/dia/{dia}/reordenar:
 *   put:
 *     tags: [Rutinas Asignadas]
 *     summary: Reordenar ejercicios de un día
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: dia
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 7 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orden]
 *             properties:
 *               orden:
 *                 type: array
 *                 items: { type: integer }
 *             example: { orden: [2, 0, 1] }
 *     responses:
 *       200:
 *         description: Ejercicios reordenados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EjercicioRutinaItem'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.put(
  '/:id/dia/:dia/reordenar',
  autorizar('administrador', 'entrenador'),
  validar(esquemaReordenar),
  ctrl.reordenarDia,
);

module.exports = router;
