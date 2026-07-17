/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar administrador o entrenador
 *     description: Crea un nuevo usuario con rol administrador o entrenador. Solo un administrador puede ejecutar esta acción.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTI2OTIxMDB9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTM1NTUyMDB9...
 *               user:
 *                 id: 1
 *                 nombre: Carlos López
 *                 email: carlos@example.com
 *                 rol: entrenador
 *                 tipo: entrenador
 *                 especialidad: Entrenamiento funcional
 *       400:
 *         description: Error de validación (Joi)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El campo "nombre" es requerido
 *       401:
 *         description: Token no proporcionado, invalidado, expirado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: Token no proporcionado
 *                 value: { error: Token no proporcionado }
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value: { error: Token expirado }
 *               tokenInvalidado:
 *                 summary: Token invalidado
 *                 value: { error: Token invalidado }
 *       403:
 *         description: Acceso denegado (solo administradores pueden crear admins/entrenadores)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Solo un administrador puede crear administradores o entrenadores
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El email ya está registrado
 *       429:
 *         description: Límite de tasa excedido (10 solicitudes por hora)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Error interno del servidor
 *
 * /api/auth/register/instruido:
 *   post:
 *     tags: [Auth]
 *     summary: Auto-registro de instruido
 *     description: Registra un nuevo usuario con rol instruido (sin autenticación previa).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInstruidoRequest'
 *     responses:
 *       201:
 *         description: Instruido registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTI2OTIxMDB9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTM1NTUyMDB9...
 *               user:
 *                 id: 2
 *                 nombre: Ana Martínez
 *                 email: ana@example.com
 *                 rol: instruido
 *                 tipo: instruido
 *       400:
 *         description: Error de validación (Joi)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El campo "edad" debe ser un número entero
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El email ya está registrado
 *       429:
 *         description: Límite de tasa excedido (10 solicitudes por hora)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Error interno del servidor
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña. Devuelve tokens de acceso y actualización.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTI2OTIxMDB9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTM1NTUyMDB9...
 *               user:
 *                 id: 1
 *                 nombre: Carlos López
 *                 email: carlos@example.com
 *                 rol: entrenador
 *                 tipo: entrenador
 *                 especialidad: Entrenamiento funcional
 *       400:
 *         description: Error de validación (Joi)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El campo "email" debe ser un correo electrónico válido
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Credenciales inválidas
 *       429:
 *         description: Límite de tasa excedido (20 intentos por 15 minutos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados intentos. Intenta de nuevo en 15 minutos.
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Error interno del servidor
 *
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refrescar tokens
 *     description: Obtiene un nuevo par de tokens (acceso y actualización) usando un refresh token válido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenPairResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTI2OTIxMDB9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUyNjkxMjAwLCJleHAiOjE3NTM1NTUyMDB9...
 *       400:
 *         description: Error de validación (refreshToken requerido)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El campo "refreshToken" es requerido
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Refresh token inválido o expirado
 *       429:
 *         description: Límite de tasa excedido (30 solicitudes por 15 minutos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiadas solicitudes de renovación. Intenta de nuevo en 15 minutos.
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Error interno del servidor
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     description: Invalida los tokens actuales agregándolos a una lista negra.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *             example:
 *               message: Sesión cerrada correctamente
 *       401:
 *         description: Token no proporcionado, invalidado, expirado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: Token no proporcionado
 *                 value: { error: Token no proporcionado }
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value: { error: Token expirado }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Error interno del servidor
 *
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil propio
 *     description: Devuelve los datos del usuario autenticado (entrenador o instruido) excluyendo la contraseña.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserEntrenador'
 *                 - $ref: '#/components/schemas/UserInstruido'
 *             examples:
 *               entrenador:
 *                 summary: Perfil de entrenador
 *                 value:
 *                   id: 1
 *                   nombre: Carlos López
 *                   email: carlos@example.com
 *                   especialidad: Entrenamiento funcional
 *                   rol: entrenador
 *                   createdAt: 2025-01-15T10:30:00.000Z
 *                   updatedAt: 2025-06-20T14:22:00.000Z
 *               instruido:
 *                 summary: Perfil de instruido
 *                 value:
 *                   id: 2
 *                   nombre: Ana Martínez
 *                   email: ana@example.com
 *                   edad: 25
 *                   peso: 58.00
 *                   altura: 1.62
 *                   sexo: femenino
 *                   nivelActividad: moderado
 *                   propositoEntrenamiento: Mejorar condición física general
 *                   diasDisponibles: 3
 *                   fechaRegistro: 2025-03-10
 *                   activo: true
 *                   entrenadorId: 1
 *                   rol: instruido
 *                   createdAt: 2025-03-10T09:00:00.000Z
 *                   updatedAt: 2025-07-01T16:45:00.000Z
 *       401:
 *         description: Token no proporcionado, invalidado, expirado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Token no proporcionado
 *       404:
 *         description: Usuario no encontrado en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               entrenadorNoEncontrado:
 *                 summary: Entrenador no encontrado
 *                 value: { error: Entrenador no encontrado }
 *               instruidoNoEncontrado:
 *                 summary: Instruido no encontrado
 *                 value: { error: Instruido no encontrado }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Error interno del servidor
 *
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Actualizar perfil propio
 *     description: Actualiza los datos del usuario autenticado. Para cambiar la contraseña se requiere la contraseña actual.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserEntrenador'
 *                 - $ref: '#/components/schemas/UserInstruido'
 *             examples:
 *               entrenador:
 *                 summary: Perfil de entrenador actualizado
 *                 value:
 *                   id: 1
 *                   nombre: Carlos López Actualizado
 *                   email: carlos@example.com
 *                   especialidad: Nutrición deportiva
 *                   rol: entrenador
 *                   createdAt: 2025-01-15T10:30:00.000Z
 *                   updatedAt: 2025-07-16T10:00:00.000Z
 *               instruido:
 *                 summary: Perfil de instruido actualizado
 *                 value:
 *                   id: 2
 *                   nombre: Ana Martínez
 *                   email: ana.nuevo@example.com
 *                   edad: 25
 *                   peso: 57.50
 *                   altura: 1.62
 *                   sexo: femenino
 *                   nivelActividad: activo
 *                   propositoEntrenamiento: Mejorar condición física general
 *                   diasDisponibles: 4
 *                   fechaRegistro: 2025-03-10
 *                   activo: true
 *                   entrenadorId: 1
 *                   rol: instruido
 *                   createdAt: 2025-03-10T09:00:00.000Z
 *                   updatedAt: 2025-07-16T10:00:00.000Z
 *       400:
 *         description: Error de validación, falta contraseña actual o no se proporcionaron campos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validacion:
 *                 summary: Error de validación
 *                 value: { error: El campo "nombre" es requerido }
 *               faltaContrasenaActual:
 *                 summary: Falta contraseña actual
 *                 value: { error: Se requiere la contraseña actual para cambiar la contraseña }
 *               sinCampos:
 *                 summary: Sin campos para actualizar
 *                 value: { error: Debe proporcionar al menos un campo para actualizar }
 *       401:
 *         description: Token no proporcionado, invalidado, expirado o contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: Token no proporcionado
 *                 value: { error: Token no proporcionado }
 *               contrasenaIncorrecta:
 *                 summary: Contraseña actual incorrecta
 *                 value: { error: La contraseña actual es incorrecta }
 *       404:
 *         description: Usuario no encontrado en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               entrenadorNoEncontrado:
 *                 summary: Entrenador no encontrado
 *                 value: { error: Entrenador no encontrado }
 *               instruidoNoEncontrado:
 *                 summary: Instruido no encontrado
 *                 value: { error: Instruido no encontrado }
 *       409:
 *         description: El email ya está registrado por otro usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El email ya está registrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Error interno del servidor
 */

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('./auth.controller');
const { validar } = require('../../shared/middleware/validate');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { esquemaRegistro, esquemaRegistroInstruido, esquemaInicioSesion, esquemaRefrescar, esquemaActualizarPerfil } = require('./auth.validation');

const limiteInicioSesion = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const limiteRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const limiteRefresh = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Demasiadas solicitudes de renovación. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', limiteRegistro, autenticar, autorizar('administrador'), validar(esquemaRegistro), ctrl.registrar);
router.post('/register/instruido', limiteRegistro, validar(esquemaRegistroInstruido), ctrl.registrarInstruido);
router.post('/login', limiteInicioSesion, validar(esquemaInicioSesion), ctrl.iniciarSesion);
router.post('/refresh', limiteRefresh, validar(esquemaRefrescar), ctrl.refrescarToken);
router.post('/logout', autenticar, ctrl.cerrarSesion);
router.get('/me', autenticar, ctrl.obtenerPerfil);
router.put('/profile', autenticar, validar(esquemaActualizarPerfil), ctrl.actualizarPerfil);

module.exports = router;
