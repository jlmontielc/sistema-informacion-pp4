const { Router } = require('express');
const ctrl = require('./pagos.controller');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validar } = require('../../shared/middleware/validate');
const {
  esquemaCrearPlan,
  esquemaActualizarPlan,
  esquemaCrearMetodo,
  esquemaActualizarMetodo,
  esquemaActualizarTasa,
  esquemaCrearPago,
  esquemaRechazarPago,
} = require('./pagos.validation');

const router = Router();

router.use(autenticar);

// ============ INSTRUIDO ============

/**
 * @openapi
 * /api/pagos/catalogo/{entrenadorId}:
 *   get:
 *     tags: [Pagos]
 *     summary: Catálogo de planes, métodos de pago y tasa de cambio del entrenador
 *     description: Devuelve los planes activos, métodos de pago activos y la tasa de cambio del entrenador especificado.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entrenadorId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Catálogo completo del entrenador (caché 300s)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagoCatalogoResponse'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: El instruido no está asignado al entrenador indicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No estás asignado a este entrenador' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/catalogo/:entrenadorId', autorizar('instruido'), ctrl.obtenerCatalogo);

/**
 * @openapi
 * /api/pagos:
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar pago con comprobante
 *     description: >
 *       El instruido registra un pago con capture de comprobante en base64.
 *       El pago queda en estado "pendiente" hasta que el entrenador lo verifique.
 *       Límite de body: 5MB para admite comprobantes en base64.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoRegistrarRequest'
 *     responses:
 *       201:
 *         description: Pago registrado en estado pendiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagoResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plan o método de pago no disponible para el entrenador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               plan:
 *                 summary: Plan no disponible
 *                 value: { error: 'Plan no encontrado o no está disponible' }
 *               metodo:
 *                 summary: Método no disponible
 *                 value: { error: 'Método de pago no encontrado o no está disponible' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/', autorizar('instruido'), validar(esquemaCrearPago), ctrl.registrarPago);

/**
 * @openapi
 * /api/pagos/mis-pagos:
 *   get:
 *     tags: [Pagos]
 *     summary: Historial de pagos del instruido
 *     description: Devuelve todos los pagos registrados por el instruido autenticado.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de pagos del instruido (caché 60s)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagoResponse'
 *             example:
 *               - id: 1
 *                 instruidoId: 2
 *                 entrenadorId: 1
 *                 planId: 1
 *                 metodoPagoId: 1
 *                 montoUsd: 30
 *                 montoBs: 1387.5
 *                 tasaAplicada: 46.25
 *                 referencia: Pago-001234
 *                 fechaPago: 2025-07-10
 *                 estado: verificado
 *                 verificadoPor: 1
 *                 fechaVerificacion: 2025-07-10T15:00:00.000Z
 *                 fechaInicio: 2025-07-10
 *                 fechaFin: 2025-08-09
 *                 plan: { id: 1, nombre: Plan Mensual Premium, montoUsd: 30, diasVigencia: 30 }
 *                 metodo: { id: 1, tipo: pago_movil }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/mis-pagos', autorizar('instruido'), ctrl.listarMisPagos);

/**
 * @openapi
 * /api/pagos/mi-suscripcion:
 *   get:
 *     tags: [Pagos]
 *     summary: Estado de la suscripción del instruido
 *     description: Devuelve si la suscripción está activa o vencida, con fechas y días restantes.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Estado de suscripción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuscripcionResponse'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/mi-suscripcion', autorizar('instruido'), ctrl.miSuscripcion);

// ============ PLANES (ENTRENADOR) ============

/**
 * @openapi
 * /api/pagos/planes:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar planes de mensualidad
 *     description: Entrenador ve sus propios planes; administrador ve todos.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de planes (caché 600s)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanPagoResponse'
 *             example:
 *               - id: 1
 *                 entrenadorId: 1
 *                 nombre: Plan Mensual Premium
 *                 descripcion: Acceso completo a entrenamiento y dietas
 *                 ofrecimiento: ambos
 *                 montoUsd: 30
 *                 diasVigencia: 30
 *                 activo: true
 *               - id: 2
 *                 entrenadorId: 1
 *                 nombre: Plan Solo Dietas
 *                 descripcion: Planificación nutricional mensual
 *                 ofrecimiento: dietas
 *                 montoUsd: 20
 *                 diasVigencia: 30
 *                 activo: true
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   post:
 *     tags: [Pagos]
 *     summary: Crear plan de mensualidad
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanPagoCreateRequest'
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanPagoResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.route('/planes')
  .get(autorizar('entrenador', 'administrador'), ctrl.listarPlanes)
  .post(autorizar('entrenador', 'administrador'), validar(esquemaCrearPlan), ctrl.crearPlan);

/**
 * @openapi
 * /api/pagos/planes/{planId}:
 *   put:
 *     tags: [Pagos]
 *     summary: Modificar plan de mensualidad
 *     description: Debe enviarse al menos un campo.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanPagoUpdateRequest'
 *     responses:
 *       200:
 *         description: Plan actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanPagoResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plan no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   delete:
 *     tags: [Pagos]
 *     summary: Desactivar plan (borrado lógico)
 *     description: Desactiva el plan conservando el historial de pagos asociados.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Plan desactivado exitosamente
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Plan no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.route('/planes/:planId')
  .put(autorizar('entrenador', 'administrador'), validar(esquemaActualizarPlan), ctrl.actualizarPlan)
  .delete(autorizar('entrenador', 'administrador'), ctrl.eliminarPlan);

// ============ MÉTODOS DE PAGO (ENTRENADOR) ============

/**
 * @openapi
 * /api/pagos/metodos:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar métodos de pago
 *     description: Entrenador ve sus propios métodos; administrador ve todos.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de métodos de pago (caché 600s)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MetodoPagoResponse'
 *             example:
 *               - id: 1
 *                 entrenadorId: 1
 *                 tipo: pago_movil
 *                 datos: { banco: '0102', telefono: '04141234567', cedula: 'V-12345678' }
 *                 activo: true
 *               - id: 2
 *                 entrenadorId: 1
 *                 tipo: zelle
 *                 datos: { correo: 'entrenador@example.com' }
 *                 activo: true
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   post:
 *     tags: [Pagos]
 *     summary: Crear método de pago
 *     description: >
 *       Crea un método de pago (pago móvil, transferencia, Zelle, Binance u otro).
 *       Los datos varían según el tipo seleccionado.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetodoPagoCreateRequest'
 *     responses:
 *       201:
 *         description: Método creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetodoPagoResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.route('/metodos')
  .get(autorizar('entrenador', 'administrador'), ctrl.listarMetodos)
  .post(autorizar('entrenador', 'administrador'), validar(esquemaCrearMetodo), ctrl.crearMetodo);

/**
 * @openapi
 * /api/pagos/metodos/{metodoId}:
 *   put:
 *     tags: [Pagos]
 *     summary: Modificar método de pago
 *     description: Debe enviarse al menos un campo.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metodoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetodoPagoUpdateRequest'
 *     responses:
 *       200:
 *         description: Método actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetodoPagoResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Método de pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Método de pago no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   delete:
 *     tags: [Pagos]
 *     summary: Desactivar método de pago (borrado lógico)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metodoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Método desactivado exitosamente
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Método de pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Método de pago no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.route('/metodos/:metodoId')
  .put(autorizar('entrenador', 'administrador'), validar(esquemaActualizarMetodo), ctrl.actualizarMetodo)
  .delete(autorizar('entrenador', 'administrador'), ctrl.eliminarMetodo);

// ============ CONFIGURACIÓN / TASA DE CAMBIO (ENTRENADOR) ============

/**
 * @openapi
 * /api/pagos/configuracion:
 *   get:
 *     tags: [Pagos]
 *     summary: Obtener configuración de pagos
 *     description: Devuelve la configuración de tasa de cambio USD -> Bs del entrenador.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Configuración con tasa actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfiguracionPagoResponse'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 *   put:
 *     tags: [Pagos]
 *     summary: Actualizar tasa de cambio $ -> Bs
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TasaCambioRequest'
 *     responses:
 *       200:
 *         description: Tasa actualizada (caché 300s)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfiguracionPagoResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.route('/configuracion')
  .get(autorizar('entrenador', 'administrador'), ctrl.obtenerConfiguracion)
  .put(autorizar('entrenador', 'administrador'), validar(esquemaActualizarTasa), ctrl.actualizarConfiguracion);

// ============ VERIFICACIÓN (ENTRENADOR) ============

/**
 * @openapi
 * /api/pagos/historial:
 *   get:
 *     tags: [Pagos]
 *     summary: Historial de pagos recibidos
 *     description: >
 *       Devuelve el historial completo de pagos recibidos por el entrenador.
 *       Soporta filtros opcionales por estado e instruido.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: estado
 *         required: false
 *         schema: { type: string, enum: [pendiente, verificado, rechazado] }
 *       - in: query
 *         name: instruidoId
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de pagos (caché 60s; incluye datos del instruido)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagoResponse'
 *             example:
 *               - id: 1
 *                 instruidoId: 2
 *                 entrenadorId: 1
 *                 planId: 1
 *                 metodoPagoId: 1
 *                 montoUsd: 30
 *                 montoBs: 1387.5
 *                 tasaAplicada: 46.25
 *                 referencia: Pago-001234
 *                 fechaPago: 2025-07-10
 *                 estado: pendiente
 *                 Instruido: { id: 2, nombre: Ana Martínez }
 *                 plan: { id: 1, nombre: Plan Mensual Premium, montoUsd: 30, diasVigencia: 30 }
 *                 metodo: { id: 1, tipo: pago_movil }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/historial', autorizar('entrenador', 'administrador'), ctrl.listarPagosEntrenador);

/**
 * @openapi
 * /api/pagos/{pagoId}/comprobante:
 *   get:
 *     tags: [Pagos]
 *     summary: Descargar comprobante de pago
 *     description: >
 *       Devuelve la imagen del comprobante en su formato original (JPEG, PNG o WebP).
 *       Solo el dueño del pago o el entrenador pueden acceder.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Imagen del comprobante
 *         content:
 *           image/jpeg:
 *             schema: { type: string, format: binary }
 *           image/png:
 *             schema: { type: string, format: binary }
 *           image/webp:
 *             schema: { type: string, format: binary }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: El solicitante no es el dueño del pago ni el entrenador asignado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'No tienes acceso a este comprobante' }
 *       404:
 *         description: Pago no encontrado o sin comprobante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Pago no encontrado' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/:pagoId/comprobante', autorizar('instruido', 'entrenador', 'administrador'), ctrl.obtenerComprobante);

/**
 * @openapi
 * /api/pagos/{pagoId}/verificar:
 *   post:
 *     tags: [Pagos]
 *     summary: Verificar pago y activar suscripción
 *     description: >
 *       Marca el pago como "verificado" y activa la mensualidad del instruido.
 *       Calcula fecha_inicio/fecha_fin según dias_vigencia del plan.
 *       Si el instruido ya tiene suscripción vigente, la renovación se apila después del vencimiento.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pago verificado y mensualidad activada (devuelve el pago completo; las sugerencias de IA fallidas no alteran la respuesta, quedan en errorPrediccionIa)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagoResponse'
 *       400:
 *         description: El plan asociado al pago ya no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'El plan asociado al pago ya no existe' }
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Pago no encontrado' }
 *       409:
 *         description: El pago ya fue procesado (verificado o rechazado); el mensaje incluye el estado actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'El pago ya fue procesado (estado actual: verificado)' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/:pagoId/verificar', autorizar('entrenador', 'administrador'), ctrl.verificarPago);

/**
 * @openapi
 * /api/pagos/{pagoId}/rechazar:
 *   post:
 *     tags: [Pagos]
 *     summary: Rechazar pago pendiente
 *     description: Marca el pago como "rechazado" con un comentario opcional.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoRechazarRequest'
 *     responses:
 *       200:
 *         description: Pago rechazado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagoResponse'
 *       400:
 *         $ref: '#/components/responses/PeticionInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/AccesoDenegado'
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'Pago no encontrado' }
 *       409:
 *         description: El pago ya fue procesado; el mensaje incluye el estado actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example: { error: 'El pago ya fue procesado (estado actual: pendiente)' }
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/:pagoId/rechazar', autorizar('entrenador', 'administrador'), validar(esquemaRechazarPago), ctrl.rechazarPago);

module.exports = router;
