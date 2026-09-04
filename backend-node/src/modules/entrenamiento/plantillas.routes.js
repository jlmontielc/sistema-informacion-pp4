const { Router } = require('express');
const ctrl = require('./plantillas.controller');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const {
  esquemaCrear,
  esquemaActualizar,
  esquemaAgregarEjercicio,
  esquemaEditarEjercicio,
  esquemaReordenar,
} = require('./plantillas.validation');

const router = Router();

/**
 * @openapi
 * /api/entrenamiento/plantillas:
 *   get:
 *     tags: [Plantillas]
 *     summary: Listar plantillas del entrenador
 *     description: >
 *       Entrenador ve sus propias plantillas; administrador ve todas.
 *       Soporta filtros por query string.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de plantillas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlantillaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 *   post:
 *     tags: [Plantillas]
 *     summary: Crear plantilla de entrenamiento
 *     description: Crea una nueva plantilla con ejercicios distribuidos por días.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlantillaCreateRequest'
 *     responses:
 *       201:
 *         description: Plantilla creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlantillaResponse'
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
 * /api/entrenamiento/plantillas/{id}:
 *   get:
 *     tags: [Plantillas]
 *     summary: Obtener plantilla por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plantilla encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlantillaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   put:
 *     tags: [Plantillas]
 *     summary: Actualizar plantilla
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
 *             $ref: '#/components/schemas/PlantillaCreateRequest'
 *     responses:
 *       200:
 *         description: Plantilla actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlantillaResponse'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Plantillas]
 *     summary: Eliminar plantilla
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Plantilla eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:id', ctrl.obtenerPorId);
router.put('/:id', autorizar('administrador', 'entrenador'), validar(esquemaActualizar), ctrl.actualizar);
router.delete('/:id', autorizar('administrador', 'entrenador'), ctrl.eliminar);

/**
 * @openapi
 * /api/entrenamiento/plantillas/{id}/dia/{dia}:
 *   get:
 *     tags: [Plantillas]
 *     summary: Obtener ejercicios de un día específico
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
 *         description: Día de la semana (1-7)
 *     responses:
 *       200:
 *         description: Ejercicios del día
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlantillaDiaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:id/dia/:dia', autorizar('administrador', 'entrenador'), ctrl.obtenerPorDia);

/**
 * @openapi
 * /api/entrenamiento/plantillas/{id}/dia/{dia}/ejercicios:
 *   post:
 *     tags: [Plantillas]
 *     summary: Agregar ejercicio a un día de la plantilla
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
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
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
 * /api/entrenamiento/plantillas/{id}/dia/{dia}/ejercicios/{idx}:
 *   put:
 *     tags: [Plantillas]
 *     summary: Editar ejercicio en un día de la plantilla
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
 *         description: Índice del ejercicio dentro del día
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
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/Error'
 *   delete:
 *     tags: [Plantillas]
 *     summary: Eliminar ejercicio de un día de la plantilla
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
 *               $ref: '#/components/schemas/PlantillaDiaResponse'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       403:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
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
 * /api/entrenamiento/plantillas/{id}/dia/{dia}/reordenar:
 *   put:
 *     tags: [Plantillas]
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
 *                 description: Nuevo orden de índices
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
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
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
