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
 *       administrador ve todas. Los borradores generados por IA (decision
 *       "pendiente", activa=false) se excluyen por defecto; verlos con ?ia=true.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: instruidoId
 *         required: false
 *         schema: { type: integer }
 *         description: Filtrar por instruido
 *       - in: query
 *         name: activa
 *         required: false
 *         schema: { type: boolean }
 *       - in: query
 *         name: ia
 *         required: false
 *         schema: { type: boolean }
 *         description: "true: solo borradores IA (pendientes); false: excluye borradores IA"
 *     responses:
 *       200:
 *         description: Lista de rutinas asignadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RutinaAsignadaResponse'
 *             example:
 *               - id: 1
 *                 instruidoId: 2
 *                 plantillaOrigenId: 1
 *                 entrenadorId: 1
 *                 nombre: IA - Full Body Fuerza
 *                 tipo: fuerza
 *                 ejercicios:
 *                   - ejercicioId: 1
 *                     dia: 1
 *                     orden: 1
 *                     series: 4
 *                     repeticiones: 8
 *                     cargaKg: 50
 *                     descansoSegundos: 90
 *                 diasSemana:
 *                   '1': { diaSemana: 1, nombre: Lunes }
 *                 frecuenciaSemanal: 1
 *                 duracionSemanas: 6
 *                 observaciones: '{"confianza":0.85}'
 *                 personalizadaPorEntrenador: false
 *                 decision: aprobada
 *                 fechaInicio: 2025-07-01
 *                 fechaFin: 2025-08-12
 *                 activa: true
 *                 eliminado: false
 *                 Instruido: { id: 2, nombre: Ana Martínez }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Instruido no encontrado o no pertenece al entrenador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Instruido no encontrado o no pertenece al entrenador' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   put:
 *     tags: [Rutinas Asignadas]
 *     summary: Actualizar rutina asignada
 *     description: Debe enviarse al menos un campo. Si se cambia instruidoId, el nuevo instruido debe pertenecer al entrenador.
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
 *             $ref: '#/components/schemas/RutinaUpdateRequest'
 *     responses:
 *       200:
 *         description: Rutina actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RutinaAsignadaResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plantilla no encontrada o instruido no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               plantilla:
 *                 summary: Plantilla no encontrada
 *                 value: { error: 'Plantilla no encontrada' }
 *               instruido:
 *                 summary: Instruido no disponible
 *                 value: { error: 'Instruido no encontrado o no pertenece al entrenador' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *             $ref: '#/components/schemas/AgregarEjercicioDiaRequest'
 *     responses:
 *       201:
 *         description: Ejercicio agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EjercicioRutinaItem'
 *       400:
 *         description: Día no configurado en la rutina o validación Joi fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               diaNoConfigurado:
 *                 summary: El día no está configurado
 *                 value: { error: 'El día 6 no está configurado en esta rutina' }
 *               validacion:
 *                 summary: Validación Joi
 *                 value: { error: '"series" is required' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Rutina o ejercicio del catálogo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rutina:
 *                 summary: Rutina no encontrada
 *                 value: { error: 'Rutina no encontrada' }
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
 * /api/entrenamiento/asignadas/{id}/dia/{dia}/ejercicios/{idx}:
 *   put:
 *     tags: [Rutinas Asignadas]
 *     summary: Editar ejercicio en un día de la rutina
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
 *         description: Rutina no encontrada, índice fuera de rango o ejercicio del catálogo inexistente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rutina:
 *                 summary: Rutina no encontrada
 *                 value: { error: 'Rutina no encontrada' }
 *               indiceFuera:
 *                 summary: Índice fuera de rango
 *                 value: { error: 'Índice de ejercicio fuera de rango' }
 *               ejercicio:
 *                 summary: Ejercicio del catálogo no encontrado (si cambia ejercicioId)
 *                 value: { error: 'Ejercicio no encontrado en el catálogo' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
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
 *         description: Rutina no encontrada o índice fuera de rango
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rutina:
 *                 summary: Rutina no encontrada
 *                 value: { error: 'Rutina no encontrada' }
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
 *                 cargaKg: 50
 *                 descansoSegundos: 90
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Rutina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Rutina no encontrada' }
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
