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
 *             example:
 *               - id: 1
 *                 entrenadorId: 1
 *                 nombre: Full Body Fuerza
 *                 descripcion: Rutina de fuerza tren completo 3 días
 *                 tipo: fuerza
 *                 ejercicios:
 *                   - ejercicioId: 1
 *                     dia: 1
 *                     orden: 1
 *                     series: 4
 *                     repeticiones: 8
 *                     cargaKg: 60
 *                     descansoSegundos: 90
 *                 diasSemana:
 *                   '1': { diaSemana: 1, nombre: Lunes }
 *                   '3': { diaSemana: 3, nombre: Miércoles }
 *                 frecuenciaSemanal: 2
 *                 duracionSemanas: 8
 *                 objetivo: ganancia_muscular
 *                 nivelDificultad: intermedio
 *                 activa: true
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   put:
 *     tags: [Plantillas]
 *     summary: Actualizar plantilla
 *     description: Actualiza campos de la plantilla. Debe enviarse al menos un campo.
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
 *             $ref: '#/components/schemas/PlantillaUpdateRequest'
 *     responses:
 *       200:
 *         description: Plantilla actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlantillaResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/:id', autorizar('administrador', 'entrenador'), ctrl.obtenerPorId);
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *             $ref: '#/components/schemas/AgregarEjercicioDiaRequest'
 *     responses:
 *       201:
 *         description: Ejercicio agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioRutinaItem'
 *       400:
 *         description: Día no configurado en la plantilla o validación Joi fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               diaNoConfigurado:
 *                 summary: El día no está configurado
 *                 value: { error: 'El día 6 no está configurado en esta plantilla' }
 *               validacion:
 *                 summary: Validación Joi
 *                 value: { error: '"series" is required' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plantilla o ejercicio del catálogo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               plantilla:
 *                 summary: Plantilla no encontrada
 *                 value: { error: 'Plantilla no encontrada' }
 *               ejercicio:
 *                 summary: Ejercicio del catálogo no encontrado
 *                 value: { error: 'Ejercicio no encontrado en el catálogo' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *     description: Actualiza campos de un ejercicio identificado por su índice dentro del día. Debe enviarse al menos un campo.
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
 *         description: Índice del ejercicio dentro del día (base 0)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditarEjercicioDiaRequest'
 *     responses:
 *       200:
 *         description: Ejercicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioRutinaItem'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plantilla no encontrada o índice fuera de rango
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               plantilla:
 *                 summary: Plantilla no encontrada
 *                 value: { error: 'Plantilla no encontrada' }
 *               indiceFuera:
 *                 summary: Índice fuera de rango
 *                 value: { error: 'Índice de ejercicio fuera de rango' }
 *               ejercicio:
 *                 summary: Ejercicio del catálogo no encontrado (si cambia ejercicioId)
 *                 value: { error: 'Ejercicio no encontrado en el catálogo' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         description: Índice del ejercicio dentro del día (base 0)
 *     responses:
 *       200:
 *         description: Ejercicio eliminado, devuelve confirmación y el ejercicio eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioEliminadoResponse'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plantilla no encontrada o índice fuera de rango
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               plantilla:
 *                 summary: Plantilla no encontrada
 *                 value: { error: 'Plantilla no encontrada' }
 *               indiceFuera:
 *                 summary: Índice fuera de rango
 *                 value: { error: 'Índice de ejercicio fuera de rango' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *             $ref: '#/components/schemas/ReordenarRequest'
 *     responses:
 *       200:
 *         description: Ejercicios reordenados (lista del día en el nuevo orden)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EjercicioRutinaItem'
 *             example:
 *               - ejercicioId: 5
 *                 nombre: Press de banca
 *                 dia: 1
 *                 orden: 1
 *                 series: 3
 *                 repeticiones: 10
 *                 cargaKg: 30
 *                 descansoSegundos: 60
 *               - ejercicioId: 1
 *                 nombre: Sentadilla con barra
 *                 dia: 1
 *                 orden: 2
 *                 series: 4
 *                 repeticiones: 8
 *                 cargaKg: 60
 *                 descansoSegundos: 90
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plantilla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plantilla no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.put(
  '/:id/dia/:dia/reordenar',
  autorizar('administrador', 'entrenador'),
  validar(esquemaReordenar),
  ctrl.reordenarDia,
);

module.exports = router;
