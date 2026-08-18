---
name: nuevo-modulo
description: Guia para crear un modulo nuevo en el backend Node del sistema PP4 (ej. pagos, RF11 pendiente). Usa esta skill cuando se pida agregar una funcionalidad/dominio nuevo siguiendo el patron del monolitico modular: routes, controller, service, validation Joi, model Sequelize, registro en app.js y seed.
---

# Crear un modulo nuevo en backend-node

El backend es un monolitico modular: cada dominio es una carpeta autonoma bajo `backend-node/src/modules/`. Para agregar un modulo nuevo (ej. el pendiente de pagos RF11), sigue este patron basado en el modulo `dietas` existente.

## Paso 1: Estructura de archivos

```
backend-node/src/modules/<modulo>/
  <modulo>.routes.js       # definicion de rutas + montaje de middlewares
  <modulo>.controller.js   # logica de request/response, sin reglas de negocio
  <modulo>.service.js      # reglas de negocio y acceso a modelos
  <modulo>.validation.js   # esquemas Joi (separado SIEMPRE)
  <modulo>.model.js        # modelo Sequelize (solo si hay tabla nueva)
```

## Paso 2: Modelo Sequelize (si aplica)

- Nombres en espanol; `field:` explicito para cada columna snake_case.
- Tipos Sequelize: `STRING`, `TEXT`, `INTEGER`, `DATE`, `BOOLEAN`, `JSON`.
- Si la tabla no existe, Sequelize `sync()` la crea al iniciar, PERO:
  - Agregar la creacion a `database/schema.sql` (seed de referencia).
  - Agregar migracion SQL en `database/migrations/` si la DB ya esta en produccion.
- Registrar asociaciones en `src/shared/database/associations.js` si se relaciona con Instruido, Entrenador, etc.

## Paso 3: Validaciones Joi

- Crear `*.validation.js` con esquemas por accion (crear, actualizar, listar).
- Campos requeridos, tipos, longitudes, formato de email/datos si aplica.
- El controller NO valida a mano: se aplica el middleware `validate.js` en la ruta.

## Paso 4: Rutas + middlewares

```js
const { authenticate } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { validate } = require('../../shared/middleware/validate');
```

- Orden: `authenticate` -> `autorizar('entrenador' | 'administrador' | ...)` -> `validate(schema)`.
- Prefijo de ruta: `/api/<modulo>`.

## Paso 5: Registro en app.js

- Montar el router en `backend-node/src/app.js` junto a los demas:
  ```js
  app.use('/api/<modulo>', moduloRoutes);
  ```
- Documentar los endpoints en el Swagger (`src/shared/swagger/swaggerConfig.js`).

## Paso 6: Verificacion

1. `cd backend-node && npm test` — suite completa.
2. Levantar con `npm run dev` y probar contra `/api/docs` (Swagger interactivo).
3. Si el modulo expone datos medicos, aplicar cifrado AES via `shared/utils/crypto.js` y NUNCA devolverlos en claro.
4. Pedir revision al agente `revisor` antes de considerar el modulo terminado.