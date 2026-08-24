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
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entrenadorId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Planes activos, métodos activos y tasa actual }
 *       403: { $ref: '#/components/responses/Error' }
 */
router.get('/catalogo/:entrenadorId', autorizar('instruido'), ctrl.obtenerCatalogo);

/**
 * @openapi
 * /api/pagos:
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar pago con comprobante (capture en base64)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Pago registrado en estado pendiente }
 *       400: { $ref: '#/components/responses/Error' }
 *       403: { $ref: '#/components/responses/Error' }
 *       404: { $ref: '#/components/responses/Error' }
 */
router.post('/', autorizar('instruido'), validar(esquemaCrearPago), ctrl.registrarPago);

/**
 * @openapi
 * /api/pagos/mis-pagos:
 *   get:
 *     tags: [Pagos]
 *     summary: Historial de pagos del instruido autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de pagos }
 */
router.get('/mis-pagos', autorizar('instruido'), ctrl.listarMisPagos);

/**
 * @openapi
 * /api/pagos/mi-suscripcion:
 *   get:
 *     tags: [Pagos]
 *     summary: Estado de la mensualidad del instruido (activa/vencida)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Estado de suscripción con fechas y días restantes }
 */
router.get('/mi-suscripcion', autorizar('instruido'), ctrl.miSuscripcion);

// ============ PLANES (ENTRENADOR) ============

/**
 * @openapi
 * /api/pagos/planes:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar planes del entrenador (todos para administrador)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de planes }
 *   post:
 *     tags: [Pagos]
 *     summary: Crear plan de mensualidad
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, montoUsd]
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string, nullable: true }
 *               montoUsd: { type: number }
 *               diasVigencia: { type: integer, default: 30 }
 *               activo: { type: boolean }
 *     responses:
 *       201: { description: Plan creado }
 *       400: { $ref: '#/components/responses/Error' }
 */
router.route('/planes')
  .get(autorizar('entrenador', 'administrador'), ctrl.listarPlanes)
  .post(autorizar('entrenador', 'administrador'), validar(esquemaCrearPlan), ctrl.crearPlan);

/**
 * @openapi
 * /api/pagos/planes/{planId}:
 *   put:
 *     tags: [Pagos]
 *     summary: Modificar plan propio
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Plan actualizado }
 *       404: { $ref: '#/components/responses/Error' }
 *   delete:
 *     tags: [Pagos]
 *     summary: Desactivar plan propio (borrado lógico, conserva historial)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Plan desactivado }
 *       404: { $ref: '#/components/responses/Error' }
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
 *     summary: Listar métodos de pago del entrenador
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de métodos }
 *   post:
 *     tags: [Pagos]
 *     summary: Crear método de pago (pago_movil, transferencia, zelle, binance, otro)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, datos]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [pago_movil, transferencia, zelle, binance, otro]
 *               datos:
 *                 type: object
 *                 description: Datos de contacto según método (banco, telefono, correo, id)
 *               activo: { type: boolean }
 *     responses:
 *       201: { description: Método creado }
 *       400: { $ref: '#/components/responses/Error' }
 */
router.route('/metodos')
  .get(autorizar('entrenador', 'administrador'), ctrl.listarMetodos)
  .post(autorizar('entrenador', 'administrador'), validar(esquemaCrearMetodo), ctrl.crearMetodo);

/**
 * @openapi
 * /api/pagos/metodos/{metodoId}:
 *   put:
 *     tags: [Pagos]
 *     summary: Modificar método de pago propio
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metodoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Método actualizado }
 *       404: { $ref: '#/components/responses/Error' }
 *   delete:
 *     tags: [Pagos]
 *     summary: Desactivar método de pago propio (borrado lógico)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metodoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Método desactivado }
 *       404: { $ref: '#/components/responses/Error' }
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
 *     summary: Obtener configuración de pagos (tasa $ -> Bs) del entrenador
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Configuración con tasa actual }
 *   put:
 *     tags: [Pagos]
 *     summary: Actualizar tasa de cambio $ -> Bs
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tasaCambio]
 *             properties:
 *               tasaCambio: { type: number, example: 46.25 }
 *     responses:
 *       200: { description: Tasa actualizada }
 *       400: { $ref: '#/components/responses/Error' }
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
 *     summary: Historial completo de pagos recibidos (filtro opcional por estado e instruido)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [pendiente, verificado, rechazado] }
 *       - in: query
 *         name: instruidoId
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de pagos }
 */
router.get('/historial', autorizar('entrenador', 'administrador'), ctrl.listarPagosEntrenador);

/**
 * @openapi
 * /api/pagos/{pagoId}/comprobante:
 *   get:
 *     tags: [Pagos]
 *     summary: Descargar el capture del comprobante (solo dueño o entrenador del pago)
 *     security: [{ bearerAuth: [] }]
 *     produces: [image/jpeg, image/png, image/webp]
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Imagen del comprobante }
 *       403: { $ref: '#/components/responses/Error' }
 *       404: { $ref: '#/components/responses/Error' }
 */
router.get('/:pagoId/comprobante', ctrl.obtenerComprobante);

/**
 * @openapi
 * /api/pagos/{pagoId}/verificar:
 *   post:
 *     tags: [Pagos]
 *     summary: Verificar pago (check) — activa la mensualidad automáticamente al instruido
 *     description: Marca el pago como verificado y calcula fecha_inicio/fecha_fin según dias_vigencia del plan. Si el instruido ya tiene suscripción vigente, la renovación se apila después del vencimiento.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Pago verificado y mensualidad activada }
 *       404: { $ref: '#/components/responses/Error' }
 *       409: { $ref: '#/components/responses/Error' }
 */
router.post('/:pagoId/verificar', autorizar('entrenador', 'administrador'), ctrl.verificarPago);

/**
 * @openapi
 * /api/pagos/{pagoId}/rechazar:
 *   post:
 *     tags: [Pagos]
 *     summary: Rechazar pago pendiente con comentario opcional
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comentario: { type: string, maxLength: 255 }
 *     responses:
 *       200: { description: Pago rechazado }
 *       404: { $ref: '#/components/responses/Error' }
 *       409: { $ref: '#/components/responses/Error' }
 */
router.post('/:pagoId/rechazar', autorizar('entrenador', 'administrador'), validar(esquemaRechazarPago), ctrl.rechazarPago);

module.exports = router;
