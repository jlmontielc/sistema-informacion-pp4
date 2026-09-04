const { Router } = require('express');
const ctrl = require('./dashboard.controller');
const { autenticar } = require('../../shared/middleware/authenticate');

const router = Router();

router.use(autenticar);

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Estadísticas del dashboard según rol
 *     description: >
 *       Devuelve estadísticas según el rol del usuario autenticado:
 *       - **Administrador**: totales globales (clientes, entrenadores, rutinas activas, dietas activas, cálculos metabólicos, clientes nuevos del mes).
 *       - **Entrenador**: totales de sus clientes, rutinas activas, dietas activas, clientes nuevos del mes y lista de 5 clientes más recientes.
 *       - **Instruido**: última medición, rutina activa, dieta activa y registros de entrenamiento recientes.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Estadísticas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DashboardAdminResponse'
 *                 - $ref: '#/components/schemas/DashboardEntrenadorResponse'
 *                 - $ref: '#/components/schemas/DashboardInstruidoResponse'
 *             examples:
 *               administrador:
 *                 summary: Dashboard de administrador
 *                 value:
 *                   totalClientes: 45
 *                   totalEntrenadores: 5
 *                   rutinasActivas: 38
 *                   dietasActivas: 22
 *                   metabolicos: 30
 *                   clientesNuevosMes: 8
 *               entrenador:
 *                 summary: Dashboard de entrenador
 *                 value:
 *                   totalClientes: 12
 *                   rutinasActivas: 10
 *                   dietasActivas: 6
 *                   clientesNuevosMes: 3
 *                   clientesRecientes:
 *                     - id: 2
 *                       nombre: Ana Martínez
 *                       peso: 58
 *                       nivelActividad: activo
 *                       fechaRegistro: '2025-06-15'
 *               instruido:
 *                 summary: Dashboard de instruido
 *                 value:
 *                   medicion:
 *                     peso: 65.5
 *                     imc: 24.1
 *                     fecha: '2025-07-01'
 *                   rutinaActiva:
 *                     id: 1
 *                     nombre: Full Body Fuerza
 *                     tipo: fuerza
 *                     fecha_inicio: '2025-07-01'
 *                     fecha_fin: '2025-08-12'
 *                     frecuencia_semanal: 3
 *                   dietaActiva:
 *                     id: 1
 *                     objetivo_calorico: 2200
 *                     proteinas_gramos: 140
 *                     carbohidratos_gramos: 250
 *                     grasas_gramos: 75
 *                     fecha_inicio: '2025-07-01'
 *                     fecha_fin: '2025-07-31'
 *                   registrosRecientes:
 *                     - id: 1
 *                       fecha: '2025-07-10'
 *                       percepcion_esfuerzo: 7
 *                       duracion_minutos: 55
 *                       rutina_nombre: Full Body Fuerza
 *       401:
 *         $ref: '#/components/responses/Error'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get('/stats', ctrl.stats);

module.exports = router;
