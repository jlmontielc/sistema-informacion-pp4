const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Información - API',
      version: '1.0.0',
      description: 'API del sistema de información para entrenamiento físico. Gestiona autenticación, perfiles, metabolismo, entrenamientos, dietas y reportes.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor de desarrollo' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT de acceso en el formato: Bearer <token>',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Mensaje descriptivo del error' },
          },
          example: { error: 'Mensaje de error descriptivo' },
        },
        AuthSuccessResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'JWT de acceso (15 min de validez)' },
            refreshToken: { type: 'string', description: 'JWT de actualización (10 días de validez)' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'ID del usuario' },
                nombre: { type: 'string', description: 'Nombre completo' },
                email: { type: 'string', format: 'email', description: 'Correo electrónico' },
                rol: { type: 'string', enum: ['administrador', 'entrenador', 'instruido'], description: 'Rol del usuario' },
                tipo: { type: 'string', enum: ['entrenador', 'instruido'], description: 'Tipo de cuenta' },
                especialidad: { type: 'string', nullable: true, description: 'Especialidad (solo entrenadores/administradores)' },
              },
            },
          },
          example: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: 1,
              nombre: 'Juan Pérez',
              email: 'juan@example.com',
              rol: 'entrenador',
              tipo: 'entrenador',
              especialidad: 'Nutrición deportiva',
            },
          },
        },
        TokenPairResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'Nuevo JWT de acceso' },
            refreshToken: { type: 'string', description: 'Nuevo JWT de actualización' },
          },
          example: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Mensaje de confirmación' },
          },
          example: { message: 'Sesión cerrada correctamente' },
        },
        UserEntrenador: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            especialidad: { type: 'string', nullable: true },
            rol: { type: 'string', enum: ['administrador', 'entrenador'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          example: {
            id: 1,
            nombre: 'Carlos López',
            email: 'carlos@example.com',
            especialidad: 'Entrenamiento funcional',
            rol: 'entrenador',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-06-20T14:22:00.000Z',
          },
        },
        UserInstruido: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            edad: { type: 'integer' },
            peso: { type: 'number', format: 'decimal' },
            altura: { type: 'number', format: 'decimal' },
            sexo: { type: 'string', enum: ['masculino', 'femenino'] },
            nivelActividad: { type: 'string', enum: ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'] },
            propositoEntrenamiento: { type: 'string', nullable: true },
            diasDisponibles: { type: 'integer', nullable: true },
            fechaRegistro: { type: 'string', format: 'date' },
            activo: { type: 'boolean' },
            entrenadorId: { type: 'integer', nullable: true },
            rol: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          example: {
            id: 2,
            nombre: 'María García',
            email: 'maria@example.com',
            edad: 28,
            peso: 65.50,
            altura: 1.65,
            sexo: 'femenino',
            nivelActividad: 'activo',
            propositoEntrenamiento: 'Perder peso y tonificar',
            diasDisponibles: 4,
            fechaRegistro: '2025-03-10',
            activo: true,
            entrenadorId: 1,
            rol: 'instruido',
            createdAt: '2025-03-10T09:00:00.000Z',
            updatedAt: '2025-07-01T16:45:00.000Z',
          },
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            nombre: { type: 'string', maxLength: 100 },
            email: { type: 'string', format: 'email', maxLength: 100 },
            contrasena: { type: 'string', minLength: 8, maxLength: 100, description: 'Contraseña del usuario' },
            especialidad: { type: 'string', maxLength: 100, nullable: true },
            rol: { type: 'string', enum: ['administrador', 'entrenador', 'instruido'], default: 'instruido' },
            edad: { type: 'integer', minimum: 1, maximum: 120, description: 'Requerido si rol=instruido' },
            peso: { type: 'number', exclusiveMinimum: 0, description: 'Requerido si rol=instruido' },
            altura: { type: 'number', exclusiveMinimum: 0, description: 'Requerido si rol=instruido' },
            sexo: { type: 'string', enum: ['masculino', 'femenino'], description: 'Requerido si rol=instruido' },
            nivelActividad: { type: 'string', enum: ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'], description: 'Requerido si rol=instruido' },
            entrenadorId: { type: 'integer', nullable: true },
          },
          example: {
            nombre: 'Nuevo Usuario',
            email: 'nuevo@example.com',
            contrasena: 'Password123',
            rol: 'entrenador',
            especialidad: 'Yoga y meditación',
          },
        },
        RegisterInstruidoRequest: {
          type: 'object',
          required: ['nombre', 'email', 'contrasena', 'edad', 'peso', 'altura', 'sexo', 'nivelActividad'],
          properties: {
            nombre: { type: 'string', maxLength: 100 },
            email: { type: 'string', format: 'email', maxLength: 100 },
            contrasena: { type: 'string', minLength: 8, maxLength: 100 },
            edad: { type: 'integer', minimum: 1, maximum: 120 },
            peso: { type: 'number', exclusiveMinimum: 0 },
            altura: { type: 'number', exclusiveMinimum: 0 },
            sexo: { type: 'string', enum: ['masculino', 'femenino'] },
            nivelActividad: { type: 'string', enum: ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'] },
            propositoEntrenamiento: { type: 'string', nullable: true },
            diasDisponibles: { type: 'integer', minimum: 1, maximum: 7, nullable: true },
          },
          example: {
            nombre: 'Ana Martínez',
            email: 'ana@example.com',
            contrasena: 'MiClaveSegura1',
            edad: 25,
            peso: 58.0,
            altura: 1.62,
            sexo: 'femenino',
            nivelActividad: 'moderado',
            propositoEntrenamiento: 'Mejorar condición física general',
            diasDisponibles: 3,
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'contrasena'],
          properties: {
            email: { type: 'string', format: 'email' },
            contrasena: { type: 'string', description: 'Contraseña del usuario' },
          },
          example: {
            email: 'usuario@example.com',
            contrasena: 'MiPassword123',
          },
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', description: 'JWT de actualización' },
          },
          example: {
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            nombre: { type: 'string', maxLength: 100, nullable: true },
            email: { type: 'string', format: 'email', maxLength: 100, nullable: true },
            especialidad: { type: 'string', maxLength: 100, nullable: true, description: 'Solo para entrenadores' },
            contrasena: { type: 'string', minLength: 8, maxLength: 100, nullable: true, description: 'Nueva contraseña' },
            contrasenaActual: { type: 'string', description: 'Obligatorio si se proporciona contrasena' },
          },
          example: {
            nombre: 'Nombre Actualizado',
            especialidad: 'Nueva especialidad',
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
          },
          example: { status: 'ok', service: 'backend-node' },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y gestión de usuarios' },
      { name: 'Health', description: 'Verificación de estado del servicio' },
    ],
  },
  apis: [
    './src/modules/auth/auth.routes.js',
    './src/app.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
