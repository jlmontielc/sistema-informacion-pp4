# Sistema de Entrenador Personal — PP4

Sistema de gestión para entrenadores personales que integra un motor predictivo de inteligencia artificial bajo el paradigma **Human-in-the-Loop (HITL)**. La IA recomienda rutinas y dietas con la mayor probabilidad estadística de éxito, un **guardián de seguridad** filtra cualquier sugerencia contraindicada contra el historial médico del cliente, y el entrenador humano —punto final de decisión— aprueba, modifica o rechaza antes de publicar. El sistema no reemplaza al entrenador: lo potencia.

Proyecto académico desarrollado para la asignatura **961616 PP4: Desarrollo de Sistemas** — Facultad Experimental de Ciencias, LUZ (2025-I).

---

## Tabla de contenidos

- [Características principales](#características-principales)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Base de datos](#base-de-datos)
- [Documentación de la API](#documentación-de-la-api)
- [Pruebas](#pruebas)
- [Seguridad](#seguridad)
- [Roles del sistema](#roles-del-sistema)
- [Notas operativas](#notas-operativas)
- [Autor](#autor)

---

## Características principales

- **Gestión de usuarios con roles** (entrenador, instruido, administrador) con autenticación JWT y sesión segura (RF01, RF02).
- **Captura de métricas físicas** del instruido: peso, altura, edad, sexo y nivel de actividad física (RF03).
- **Perfil médico detallado y cifrado**: alergias, intolerancias alimentarias, lesiones previas y patologías crónicas (RF04).
- **Cálculo del gasto metabólico** basal y total según métricas y nivel de actividad (RF05).
- **Recomendación predictiva**: el motor de IA analiza el perfil y devuelve la plantilla de entrenamiento y nutrición con mayor adherencia estadística (RF06).
- **Guardián de contraindicaciones**: el núcleo evalúa cada predicción contra el historial médico y bloquea sugerencias peligrosas, generando alertas (RF07).
- **Panel de revisión HITL**: la plantilla sugerida se clona y se presenta al entrenador, quien puede aceptar, modificar o rechazar cada bloque antes de publicarlo (RF08, RF09).
- **Gráficas de rendimiento mensual** basadas en la retroalimentación del instruido (pesos levantados, adherencia a la dieta) (RF10).
- **Módulo de pagos**: planes de entrenamiento, métodos de pago, carga de comprobantes y verificación de suscripción (RF11).
- **PWA offline-first**: la interfaz opera de forma resiliente ante cortes de conexión (útil en gimnasios), con banner de estado de red y almacenamiento transitorio de métricas.
- **Aprendizaje continuo**: el feedback de los entrenadores recalibra en caliente los pesos del modelo de scoring.

## Arquitectura del sistema

Arquitectura de **monolito modular** (núcleo Node.js) con un **microservicio especializado** (motor de IA en Flask), orquestados con Docker Compose y expuestos a través de nginx.

```
User -> nginx:80
         /api/*  -> backend-node:3000  -> HTTP + JWT de servicio -> backend-flask:5000
         /*      -> index.html (SPA fallback)
                       |
                    redis:6379  (caché de lectura + blacklist JWT)
```

| Servicio | Puerto (host) | Descripción |
|---|---|---|
| `frontend` | 80 | nginx sirve el SPA y hace proxy de `/api/*` hacia Node |
| `backend-node` | 3000 | API principal: lógica de negocio, auth, control de acceso, persistencia |
| `backend-flask` | interno (5000) | Motor de IA; no expone puerto al host, solo dentro de la red Docker |
| `redis` | interno (6379) | Caché de lecturas y blacklist de tokens |

### Flujo Human-in-the-Loop (HITL)

1. **Predicción:** Node envía el perfil del instruido (con datos médicos descifrados) a Flask mediante un JWT de servicio firmado con una clave compartida.
2. **Guardián (capa 1):** `GuardianSeguridad` en Flask filtra los ejercicios según lesiones, patologías y cargas de impacto, contra reglas explícitas (`injury_rules`, `condition_rules`, `load_rules`).
3. **Guardián (capa 2):** `RecommenderEngine` genera la rutina/dieta propuesta y Node la revalida contra el historial médico antes de persistirla.
4. **Decisión humana:** el entrenador revisa la propuesta en el panel de aprobación y la acepta, modifica o rechaza.
5. **Aprendizaje:** el feedback queda registrado en `feedback_hitl` y recalibra los pesos del modelo (tabla `pesos_modelo_ia`), aplicándose en caliente sin reiniciar el servicio.

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Frontend | React 18 (CRA), React Router 6, Axios, Recharts, Workbox (PWA) |
| API principal | Node 20, Express 4, Sequelize 6, mysql2, JWT, Joi, Swagger (swagger-jsdoc + swagger-ui-express) |
| Motor de IA | Python 3.11, Flask 3, scikit-learn, pandas, numpy |
| Base de datos | MySQL 8.0 (conexión SSL forzada por Node y Flask) |
| Caché | Redis 7 (caché de lectura, blacklist JWT) |
| Infraestructura | Docker Compose, nginx, gunicorn |

## Estructura del repositorio

```
├── backend-node/              # API principal (Express + Sequelize)
│   ├── src/
│   │   ├── modules/           # auth, instruidos, entrenamiento, metabolismo,
│   │   │                      # dietas, pagos, reportes, dashboard
│   │   │                      # (cada módulo: routes, validation, controller, service, model)
│   │   ├── shared/            # cache (Redis), database, middleware, swagger, utils
│   │   ├── scripts/           # migraciones de datos y seeds (Node)
│   │   └── server.js          # punto de entrada
│   ├── tests/                 # suites Jest con coverage
│   └── .env                   # variables de entorno (no commitear)
├── backend-flask/             # Motor de IA (Flask + scikit-learn)
│   ├── api/                   # validación del JWT servicio-a-servicio
│   ├── models/rules/          # injury_rules, condition_rules, load_rules
│   ├── services/              # feedback_learner, feedback_store, db_connector
│   ├── tests/test_guardian.py # pruebas manuales de GuardianSeguridad
│   └── app.py                 # punto de entrada
├── frontend/                  # SPA React (CRA + PWA)
│   └── src/                   # componentes por dominio, contextos, servicios, PWA
├── database/
│   ├── schema.sql             # esquema de referencia
│   └── migrations/            # migraciones incrementales (aplicar en orden)
├── documentacion/             # guía del proyecto
├── docker-compose.yml         # 4 servicios: frontend, backend-node, backend-flask, redis
└── README.md
```

## Requisitos previos

**Opción recomendada — Docker:**
- Docker Desktop (o Docker Engine) con Docker Compose.

**Opción manual (desarrollo):**
- Node.js 20+
- Python 3.11+
- MySQL 8.0
- Redis 7 (opcional en local; obligatorio dentro de Docker Compose)

## Variables de entorno

**Nunca commitear archivos `.env`; ya están en `.gitignore`.**

### `backend-node/.env`

Obligatorias (validadas al arrancar):

```env
JWT_SECRET=<secreto para firmar tokens>
ENC_KEY=<hexadecimal de exactamente 64 caracteres (32 bytes AES-256)>
ENC_IV=<hexadecimal de exactamente 32 caracteres (16 bytes AES-256-CBC)>
DB_HOST=<host de MySQL>
DB_PORT=3306
DB_NAME=<nombre de la base de datos>
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
FLASK_IA_URL=http://localhost:5000   # en Docker: http://backend-flask:5000
```

Opcionales:

```env
PORT=3000
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=10d
REDIS_URL=redis://localhost:6379/0
REDIS_ENABLED=false
```

### `backend-flask/.env`

```env
DB_HOST=<host de MySQL>
DB_PORT=3306
DB_NAME=<nombre de la base de datos>
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
JWT_SECRET=<el mismo JWT_SECRET que Node, para validar el token de servicio>
LOG_LEVEL=INFO
CORS_ORIGINS=*
```

## Instalación y ejecución

### Con Docker (recomendado)

```bash
docker-compose up --build   # construye y levanta todo
docker-compose up           # con imágenes existentes
docker-compose down         # detiene todo
docker-compose logs --tail=50
```

Una vez levantado: la aplicación está en `http://localhost` y la documentación de la API en `http://localhost/api/docs` (o `http://localhost:3000/api/docs` directamente contra Node).

### Backend Node (`cd backend-node`)

```bash
npm install              # primera vez
npm run dev              # nodemon hot-reload
npm start                # node src/server.js
npm run seed             # seed de administrador por defecto
npm run seed:ejercicios  # descarga ~1000 ejercicios; ADVERTENCIA: borra la tabla y la vuelve a insertar
npm test                 # jest con coverage
```

### Motor de IA Flask (`cd backend-flask`)

```bash
python -m pip install -r requirements.txt   # primera vez
python app.py                               # dev, puerto 5000, debug=True
python tests/test_guardian.py               # pruebas manuales con assert
gunicorn --bind 0.0.0.0:5000 app:app        # producción
```

### Frontend (`cd frontend`)

```bash
npm install      # primera vez
npm start        # CRA dev server, puerto 3000
npm run build    # build de producción -> build/
npm test         # react-scripts test
```

### Desarrollo local sin SSL

Contra MySQL local sin SSL hay que quitar `dialectOptions.ssl` en `backend-node/src/shared/database/connection.js` y ajustar `backend-flask/services/db_connector.py` (en producción con Aiven, SSL va forzado).

## Base de datos

- `database/schema.sql` es el esquema de referencia (incluye seed de admin, 20 ejercicios y las tablas del módulo de pagos).
- Las migraciones manuales en `database/migrations/` se aplican en orden; cada incremento refleja la evolución ágil del MVP:

| Migración | Contenido |
|---|---|
| `001_add_dias_semana.sql` | Días de la semana para rutinas |
| `002_add_hitl_feedback.sql` | Tabla de feedback HITL |
| `003_add_pesos_modelo_ia.sql` | Métricas de IA: pesos del modelo de scoring |
| `004_add_modulo_pagos.sql` | Módulo financiero: planes, métodos, comprobantes |
| `005_add_ofrecimiento_to_planes_pago.sql` | Ofrecimiento en planes de pago |
| `006_add_error_prediccion_ia_to_pagos.sql` | Error de predicción IA en pagos |
| `007_add_decision_to_planes_dieta.sql` | Decisión en planes de dieta |
| `008_add_eliminado_rutinas_asignadas.sql` | Borrado lógico de rutinas asignadas |
| `009_migrate_json_camelcase.sql` | Normalización de JSON a camelCase |
| `010_add_decision_rutinas_asignadas.sql` | Decisión en rutinas asignadas |
| `011_instruidos_dias_obligatorios.sql` (+ `_rollback`) | Días obligatorios del instruido |
| `20260821_crear_calculos_metabolicos.sql` | Tabla de cálculos metabólicos |
| `20260825_feedback_hitl_tipo.sql` | Tipo de feedback HITL |
| `20260903_series_ejecutadas.sql` | Control de adherencia: series ejecutadas |
| `20260904_eliminar_rendimiento.sql` | Depuración de tabla de rendimiento |
| `20260927_certificaciones_archivo.sql` | Archivos adjuntos de certificaciones del entrenador |

- Algunos cambios de datos tienen scripts Node en `backend-node/src/scripts/` (por ejemplo `run-migration-010.js`, `migrate-json-camelcase.js`).
- Sequelize `sync()` crea/actualiza tablas al arrancar Node, pero **no reemplaza** las migraciones manuales en producción.
- La tabla `pesos_modelo_ia` es creada por Flask si no existe al recalibrar.

## Documentación de la API

- **Swagger (Node):** disponible en `/api/docs` — documentación completa de todos los módulos.
- **Endpoints del motor de IA (Flask)** bajo `/api/predict`:

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/predict/routine` | Predicción de rutina de entrenamiento |
| POST | `/api/predict/validate` | Validación de una predicción |
| POST | `/api/predict/dieta` | Predicción de dieta |
| POST | `/api/predict/feedback` | Registro de feedback del entrenador |
| POST | `/api/predict/recalibrar?tipo=rutina\|dieta` | Recalcula pesos desde `feedback_hitl` y los aplica en caliente |
| GET | `/api/predict/history/<id>` | Historial de predicciones del instruido |
| GET | `/api/predict/stats` | Estadísticas del modelo |
| GET | `/api/predict/last/<id>` | Última predicción del instruido |
| GET | `/api/health` | Único endpoint público de Flask |

- **Comunicación servicio-a-servicio:** Node firma un JWT `{service: 'backend-node'}` con expiración de 5 minutos y lo envía como `Bearer` a Flask, que valida firma, expiración y emisor.

## Pruebas

| Servicio | Comando | Estado |
|---|---|---|
| backend-node | `npm test` (Jest + coverage) | 25 suites: auth, blacklist, caché Redis, pagos, dietas, ejercicios, validación HITL, instruidos, perfil médico, plantillas, reportes |
| backend-flask | `python tests/test_guardian.py` | Suite manual (assert) centrada en `GuardianSeguridad`; registrar nuevas funciones `test_*` en el bloque `__main__` o no se ejecutarán |
| frontend | `npm test` | Infraestructura CRA lista, sin pruebas aún |

## Seguridad

- **Cifrado AES-256-CBC a nivel de aplicación** de datos médicos sensibles (`alergias`, `intolerancias`, `lesiones`, `condiciones_preexistentes`, `medicacionActual`) con `ENC_KEY` (32 bytes) e `ENC_IV` (16 bytes).
- **Aislamiento de datos médicos:** tabla independiente en relación 1:1, desacoplada del perfil público; acceso controlado por RBAC.
- **Revelado controlado en el frontend:** los valores médicos se ocultan por defecto y se muestran con un botón de privacidad; solo el propio instruido, su entrenador asignado o un administrador pueden verlos descifrados.
- **RBAC:** middleware `autenticar` (JWT) → `autorizar` (roles) → `validar` (Joi) en todas las rutas.
- **Rate limiting en auth:** 20 logins / 15 min, 10 registros / hora, 30 refresh / 15 min.
- **Blacklist JWT:** persiste en Redis cuando `REDIS_ENABLED=true`.
- **JWT de servicio:** comunicación Node ↔ Flask autenticada con token de 5 minutos firmado con secreto compartido; solo `/api/health` es público en Flask.
- **Detección de corrupción:** si los datos médicos fueron cifrados con una `ENC_KEY`/`ENC_IV` distinta a la actual, el backend devuelve `datosMedicosCorruptos: true` y el frontend solicita reingresar la información. Los valores originales no son recuperables sin la clave con que se cifraron.

## Roles del sistema

| Rol | `tipo` en el JWT | Capacidades |
|---|---|---|
| `administrador` | `entrenador` | Acceso total al sistema |
| `entrenador` | `entrenador` | Sus instruidos, panel de revisión HITL, reportes, certificaciones |
| `instruido` | `instruido` | Su perfil y métricas, rutinas y dietas asignadas, pagos, reportes |

Redirección post-login: un instruido sin `perfilMedicoCompleto` es enviado a `/complete-profile`; de lo contrario, al dashboard.

## Notas operativas

- `npm run seed:ejercicios` es **destructivo**: borra la tabla `ejercicios` y la vuelve a insertar (~1000 ejercicios descargados desde GitHub).
- El body de `/api/pagos` tiene un límite de **5 MB** para comprobantes base64.
- Si Redis no está disponible con `REDIS_ENABLED=true`, el sistema usa un fallback en memoria (`Set`) para la blacklist, que se pierde al reiniciar Node.
- Guardar datos médicos con una `ENC_KEY`/`ENC_IV` distinta a la actual hará que esos registros no puedan descifrarse (sin posibilidad de recuperación).
- No hay linter, formatter ni CI/CD configurados.

---

## Autor

**Jorge Luis Montiel** — CI 31.545.512

Facultad Experimental de Ciencias — LUZ · 961616 PP4: Desarrollo de Sistemas · 2025-I
