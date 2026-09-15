# Sistema de Entrenador Personal — PP4

## Stack & arquitectura

- **Frontend:** React 18 (CRA), React Router 6, Axios, Recharts, Workbox (PWA).
- **API principal:** Node 20 + Express 4 + Sequelize 6 + mysql2 + JWT + Swagger en `/api/docs`.
- **Motor IA:** Python 3.11 + Flask 3 + scikit-learn/pandas, aislado en `backend-flask/`.
- **DB:** MySQL 8.0 (Aiven en prod). Tanto Node como Flask fuerzan SSL. Para desarrollo local sin SSL hay que ajustar `backend-node/src/shared/database/connection.js` y `backend-flask/services/db_connector.py`.
- **Caché:** Redis 7 (opcional en local, habilitado en Docker Compose). Usado en Node para caché de lectura (dashboard, ejercicios, reportes, rutinas asignadas, dietas, listados) y blacklist JWT. Flask no se cachea.
- **Infra:** Docker Compose 4 servicios (`frontend`, `backend-node`, `backend-flask`, `redis`). nginx sirve el SPA y hace proxy de `/api/*` a Node. Flask no expone puerto al host, solo dentro de la red Docker.

```
User -> nginx:80
         /api/*  -> backend-node:3000  -> HTTP -> backend-flask:5000
         /*      -> index.html (SPA fallback)
```

- **Módulos Node** en `backend-node/src/modules/`: `auth`, `instruidos`, `entrenamiento`, `metabolismo`, `dietas`, `pagos`, `reportes`, `dashboard`.
- **Módulo `pagos` (RF11) ya existe:** planes de pago, métodos, comprobantes base64, verificación y suscripción.
- **Puntos de entrada reales:**
  - Node: `backend-node/src/server.js`
  - Flask: `backend-flask/app.py`
  - Frontend: `frontend/src/index.js` + `App.jsx`

## Comandos exactos

### Docker
```bash
docker-compose up --build   # construye y levanta todo
docker-compose up           # con imágenes existentes
docker-compose down         # detiene todo
docker-compose logs --tail=50
```

### Backend Node (`cd backend-node`)
```bash
npm run dev              # nodemon hot-reload
npm start                # node src/server.js
npm run seed             # admin por defecto
npm run seed:ejercicios  # descarga ~1000 ejercicios desde GitHub; limpia la tabla
npm test                 # jest --coverage
```

### Backend Flask (`cd backend-flask`)
```bash
python app.py                              # dev, puerto 5000, debug=True
python tests/test_guardian.py              # tests manuales con assert
gunicorn --bind 0.0.0.0:5000 app:app       # producción
```

### Frontend (`cd frontend`)
```bash
npm start        # CRA dev server puerto 3000
npm run build    # build -> build/
npm test         # react-scripts test (aún sin tests)
```

## Variables de entorno

### `backend-node/.env`
Obligatorias y validadas en `src/shared/constants/index.js`:
- `JWT_SECRET`
- `ENC_KEY`: hexadecimal de exactamente 64 caracteres (32 bytes AES-256).
- `ENC_IV`: hexadecimal de exactamente 32 caracteres (16 bytes AES-256-CBC).
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `FLASK_IA_URL=http://localhost:5000` (en Docker: `http://backend-flask:5000`)

Opcionales: `PORT` (def 3000), `JWT_EXPIRES_IN` (def 15m), `JWT_REFRESH_EXPIRES_IN` (def 10d), `REDIS_URL` (def `redis://localhost:6379/0`), `REDIS_ENABLED` (def `false`).

### `backend-flask/.env`
- Mismas credenciales DB.
- `JWT_SECRET` (compartido con Node para validar el token servicio-a-servicio).
- `LOG_LEVEL` (def `INFO`).
- `CORS_ORIGINS` (def `*`).

**Nunca commitear archivos `.env`; el repo ya los tiene en `.gitignore`.**

## Base de datos

- `database/schema.sql` es el schema de referencia (seed admin + 20 ejercicios + tablas de pagos).
- Migraciones manuales en `database/migrations/`; aplicar en orden. Algunos cambios de datos tienen scripts Node en `backend-node/src/scripts/` (p. ej. `run-migration-010.js`, `migrate-json-camelcase.js`).
- Sequelize `sync()` crea/actualiza tablas al arrancar Node, pero no reemplaza migraciones manuales en producción.
- Tabla `pesos_modelo_ia` persiste pesos de scoring; Flask la crea si no existe al recalibrar.

## Tests

- **Flask:** `cd backend-flask && python tests/test_guardian.py`. Patrón manual: funciones `test_*` con `assert` + bloque `if __name__ == '__main__'`. **Registrar nuevas funciones en `__main__`** o no se ejecutarán.
- **Node:** `cd backend-node && npm test` ejecuta Jest con coverage. Existe `backend-node/tests/registro-entrenamiento.test.js` (mocks de Sequelize).
- **Frontend:** `cd frontend && npm test` (aún sin tests).

## Seguridad & HITL

- **Datos médicos** (`alergias`, `intolerancias`, `lesiones`, `condiciones_preexistentes`, `medicacionActual`) se cifran en reposo con AES-256-CBC (`backend-node/src/shared/utils/crypto.js`). Node los descifra antes de enviarlos a Flask y, **como excepción de seguridad autorizada**, también antes de enviarlos al frontend cuando el solicitante es el propio instruido, el entrenador asignado o un administrador. En el frontend los valores se ocultan por defecto y se revelan mediante un botón de privacidad.
- **Auth servicio-a-servicio:** Node firma un JWT `{service:'backend-node'}` de 5 min con `JWT_SECRET` y lo envía como `Bearer` a Flask. Flask valida firma, expiración y emisor en `api/auth.py`. Solo `/api/health` es público en Flask.
- **Flujo HITL:** Flask `HitlEngine` ejecuta `GuardianSeguridad` (filtra ejercicios por lesiones/condiciones/carga) y luego `RecommenderEngine` genera la rutina/dieta. Node persiste el resultado; el entrenador aprueba/modifica/rechaza; feedback en `feedback_hitl`. Ver `.opencode/skills/hitl/SKILL.md`.
- **Endpoints Flask** bajo `/api/predict`: `POST /routine`, `/validate`, `/recalibrar`, `/feedback`, `/dieta`; `GET /history/<id>`, `/stats`, `/last/<id>`.
- **Recalibración:** `POST /api/predict/recalibrar?tipo=rutina|dieta` recalcula pesos desde `feedback_hitl` y los aplica en caliente.
- **Rate limiting auth:** 20 login/15min, 10 registros/hora, 30 refresh/15min.

## Convenciones del proyecto

- Código, nombres de archivos, rutas, comentarios y variables en español.
- Validaciones con Joi en archivos `*.validation.js` separados; aplicadas con middleware `validate.js`.
- Middleware en rutas: `autenticar` (JWT) → `autorizar` (roles) → `validar` (Joi). Importar `{ autenticar }`, `{ autorizar }`, `{ validar }`.
- Sequelize: usar `field:` explícito para columnas `snake_case` (p. ej. `contrasenaHash` → `password_hash`). Algunos modelos usan `underscored: true`.
- Modelos y lógica por dominio en `backend-node/src/modules/<dominio>/`.
- Todo acceso HTTP del frontend debe ir por `services/api.js` (interceptor de refresh JWT); no usar axios directamente.
- No hay linter, formatter ni CI/CD.

## Gotchas operativos

- `npm run seed:ejercicios` es destructivo: borra la tabla `ejercicios` y la vuelve a insertar.
- Body de `/api/pagos` tiene límite de 5 MB para comprobantes base64 (`app.js`).
- Local dev contra MySQL sin SSL requiere quitar `dialectOptions.ssl` en `connection.js` y ajustar `db_connector.py`.
- Token blacklist persiste en Redis cuando `REDIS_ENABLED=true`; si Redis no está disponible, usa fallback en memoria (`Set`) y se pierde al reiniciar Node.
- Roles: `administrador` y `entrenador` usan `tipo='entrenador'` en el JWT; `instruido` usa `tipo='instruido'`. `autorizar` revisa `rol`.
- Redirección post-login: un instruido sin `perfilMedicoCompleto` es enviado a `/complete-profile`; de lo contrario, a `/dashboard`. El flag se calcula en el backend y se incluye en la respuesta de login.
- Datos médicos guardados con una `ENC_KEY`/`ENC_IV` distinta a la actual no podrán descifrarse. El backend detecta este caso y devuelve `datosMedicosCorruptos: true`; el frontend muestra una advertencia y pide al usuario reingresar la información. No es posible recuperar los valores originales sin la clave/IV con la que se cifraron.
- Módulo de clientes (`/clientes`): entrenadores y administradores pueden listar a sus instruidos y ver su perfil médico completo descifrado en `/clientes/:id`.
- PWA: no romper `serviceWorkerRegistration.js`, `service-worker.js` ni la estrategia offline (`OfflinePage`, `OfflineBanner`, `useOnlineStatus`).

## Recursos de agentes

- Subagentes/especialistas locales: `.opencode/agent/` (`nodeApi.md`, `frontendReact.md`, `flaskIa.md`, `revisor.md`, `tester.md`).
- Skills: `.opencode/skills/hitl/SKILL.md`, `.opencode/skills/nuevo-modulo/SKILL.md`.
- Permisos de OpenCode: `opencode.json` permite `docker*`, `docker-compose*`, `npm*`, `python*`; `git*` pregunta.
