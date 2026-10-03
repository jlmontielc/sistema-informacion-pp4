# Sistema de Entrenador Personal — PP4

Sistema de gestión para entrenadores personales que integra un motor predictivo de inteligencia artificial bajo el paradigma **Human-in-the-Loop (HITL)**. La IA recomienda rutinas y dietas con la mayor probabilidad estadística de éxito, un **guardián de seguridad** filtra cualquier sugerencia contraindicada contra el historial médico del cliente, y el entrenador humano —punto final de decisión— aprueba, modifica o rechaza antes de publicar. El sistema no reemplaza al entrenador: lo potencia.

Proyecto académico desarrollado para la asignatura **961616 PP4: Desarrollo de Sistemas** — Facultad Experimental de Ciencias, LUZ, periodo 2026-I.

---

## Tabla de contenidos

- [Problema o necesidad que aborda](#problema-o-necesidad-que-aborda)
- [Objetivo](#objetivo)
- [Funcionalidades principales](#funcionalidades-principales)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Base de datos](#base-de-datos)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Despliegue en producción (MVP)](#despliegue-en-producción-mvp)
- [Documentación de la API](#documentación-de-la-api)
- [Seguridad](#seguridad)
- [Roles del sistema](#roles-del-sistema)
- [Pruebas](#pruebas)
- [Estado del proyecto](#estado-del-proyecto)
- [Notas operativas](#notas-operativas)
- [Equipo](#equipo)

---

## Problema o necesidad que aborda

El entrenador personal profesional asume tres roles que ninguna herramienta le resuelve bien: prescribe, verifica y factura. En la práctica ese trabajo se reparte entre una hoja de cálculo, la memoria y un chat de WhatsApp, y esa combinación produce cuatro problemas concretos.

**1. Planes armados a mano sin verificación sistemática de contraindicaciones.** Un entrenador puede tener treinta clientes con antecedentes distintos —lesiones de rodilla, hipertensión, intolerancia a la lactosa— y decidir de memoria qué ejercicio es seguro para cada uno. El error humano no es una excepción, es una estadística: una Deadlift con técnica imperfecta en alguien con estenosis espinal es un riesgo evitable con una regla automática. Las herramientas genéricas de fitness ignoran este problema: no conocen las contraindicaciones de cada cliente.

**2. El historial médico vive pegado al perfil público, sin separación ni cifrado.** Alergias, medicación crónica y lesiones previas son datos de alta sensibilidad, guardados en el mismo registro que el nombre y la foto. Una filtración de ese perfil expone información clínica, no solo ejercicio. Ninguna hoja de cálculo cifra nada.

**3. Sin seguimiento centralizado, el instruido abandona y el entrenador no lo sabe.** El registro de adherencia —series ejecutadas, comidas anotadas, peso— queda en cuadernos que nadie consulta. Cuando el cliente deja de asistir, el entrenador se entera porque dejó de venir, no porque el sistema le avisó. Sin histórico comparable, no hay forma de demostrarle al cliente que el plan funciona.

**4. Las recomendaciones se apoyan en la experiencia, no en evidencia.** Cuando dos entrenadores proponen Planes parecidos para el mismo perfil, se elige el que "suena" mejor. No hay forma de aprender de cuál funcionó, porque la decisión y su resultado quedan en dos lugares distintos.

A esto se suma una restricción de contexto: buena parte de los clientes se atiende en gimnasios con conexión intermitente, y un entrenador conectado a un SaaS estadounidense no tiene una implementación viable ni en el presupuesto ni en la infraestructura disponible.

## Objetivo

**Objetivo general:** desarrollar un sistema de información que permita al entrenador personal gestionar de forma integral el ciclo completo de sus clientes —alta, perfil médico, evaluación metabólica, prescripción de entrenamiento y nutrición, seguimiento, facturación y reporte—, incorporando un motor de inteligencia artificial predictiva como **apoyo a la decisión profesional** y no como sustituto, garantizando la seguridad en el manejo de datos clínicos sensibles y la operatividad en condiciones de conectividad intermitente.

**Objetivos específicos:**

1. **Automatizar la gestión de usuarios y roles** con autenticación por token y control de acceso diferenciados para administrador, entrenador e instruido, de modo que cada usuario solo vea y modifique lo que le corresponde.
2. **Capturar y proteger el perfil médico cifrado**, almacenando alergias, intolerancias, lesiones, condiciones preexistentes y medicación con cifrado en reposo y revelándolos únicamente ante el propio instruido, su entrenador asignado o un administrador.
3. **Calcular el gasto metabólico** basal y total a partir de métricas físicas y nivel de actividad, sirviendo de insumo objetivo para la prescripción nutricional.
4. **Generar recomendaciones de rutina y dieta mediante IA**, con un guardián de seguridad que audite cada predicción contra el historial médico y bloquee ejercicios o alimentos contraindicados.
5. **Implementar un panel de revisión Human-in-the-Loop** en el que el entrenador acepta, modifica o rechaza la propuesta de la IA antes de que llegue al cliente, dejando el feedback registrado.
6. **Cerrar el ciclo de aprendizaje continuo**, recalibrando en caliente los pesos del modelo de scoring a partir de las decisiones de los entrenadores, de modo que el sistema mejore con el uso.
7. **Ofrecer reportes de adherencia y progreso** que permitan al entrenador ajustar la prescripción y le demuestren al cliente la evolución.
8. **Monetizar el servicio** mediante planes de pago, métodos de pago y verificación de comprobantes.
9. **Operar sobre infraestructura de bajo costo**, apoyándose en servicios gestionados y en una PWA que tolera cortes de conexión.

## Funcionalidades principales

- **Gestión de usuarios con roles** (entrenador, instruido, administrador) con autenticación JWT, refresh token y sesión segura (RF01, RF02).
- **Captura de métricas físicas** del instruido: peso, altura, edad, sexo y nivel de actividad física (RF03).
- **Perfil médico detallado y cifrado**: alergias, intolerancias alimentarias, lesiones previas y patologías crónicas (RF04).
- **Módulo de clientes** para que entrenadores y administradores consulten la lista de sus instruidos y su perfil médico descifrado.
- **Cálculo del gasto metabólico** basal y total según métricas y nivel de actividad (RF05).
- **Recomendación predictiva**: el motor de IA analiza el perfil y devuelve la plantilla de entrenamiento y nutrición con mayor adherencia estadística (RF06).
- **Guardián de contraindicaciones**: el núcleo evalúa cada predicción contra el historial médico y bloquea sugerencias peligrosas, generando alertas (RF07).
- **Panel de revisión HITL**: la plantilla sugerida se clona y se presenta al entrenador, quien puede aceptar, modificar o rechazar cada bloque antes de publicarlo (RF08, RF09).
- **Gráficas de rendimiento mensual** basadas en la retroalimentación del instruido: pesos levantados, series ejecutadas y adherencia a la dieta (RF10).
- **Módulo de pagos**: planes de entrenamiento, métodos de pago, carga de comprobantes y verificación de suscripción (RF11).
- **PWA offline-first**: la interfaz opera de forma resiliente ante cortes de conexión (útil en gimnasios), con banner de estado de red y almacenamiento transitorio de métricas.
- **Aprendizaje continuo**: el feedback de los entrenadores recalibra en caliente los pesos del modelo de scoring.

## Arquitectura del sistema

Arquitectura de **monolito modular** (núcleo Node.js) con un **microservicio especializado** (motor de IA en Flask), orquestados con Docker Compose y expuestos a través de nginx.

```
Usuario -> nginx:80
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
3. **Guardián (capa 2):** `RecommenderEngine` genera la rutina o dieta propuesta y Node la revalida contra el historial médico antes de persistirla.
4. **Decisión humana:** el entrenador revisa la propuesta en el panel de aprobación y la acepta, modifica o rechaza.
5. **Aprendizaje:** el feedback queda registrado en `feedback_hitl` y recalibra los pesos del modelo (tabla `pesos_modelo_ia`), aplicándose en caliente sin reiniciar el servicio.

## Tecnologías utilizadas

| Capa | Tecnologías |
|---|---|
| Frontend | React 18 (CRA), React Router 6, Axios, Recharts, Workbox (PWA) |
| API principal | Node 20, Express 4, Sequelize 6, mysql2, JWT, Joi, Swagger (swagger-jsdoc + swagger-ui-express) |
| Motor de IA | Python 3.11, Flask 3, scikit-learn, pandas, numpy |
| Base de datos | MySQL 8.0 (conexión SSL forzada por Node y Flask) |
| Caché | Redis 7 / ioredis (caché de lectura, blacklist JWT) |
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
│   ├── tests/                 # 27 suites Jest con coverage
│   ├── .env.example           # plantilla de variables (sin secretos)
│   └── Dockerfile
├── backend-flask/             # Motor de IA (Flask + scikit-learn)
│   ├── api/                   # validación del JWT servicio-a-servicio
│   ├── models/rules/          # injury_rules, condition_rules, load_rules
│   ├── services/              # feedback_learner, feedback_store, db_connector
│   ├── tests/test_guardian.py # pruebas manuales de GuardianSeguridad
│   ├── .env.example           # plantilla de variables (sin secretos)
│   ├── Dockerfile
│   └── app.py                 # punto de entrada
├── frontend/                  # SPA React (CRA + PWA)
│   ├── src/                   # páginas, componentes, contextos, servicios, PWA
│   ├── public/icons/          # íconos PWA
│   ├── .env.example           # plantilla de REACT_APP_API_URL
│   ├── vercel.json            # configuración de despliegue en Vercel
│   └── Dockerfile
├── database/
│   ├── schema.sql             # esquema de referencia
│   └── migrations/            # migraciones incrementales (aplicar en orden)
├── documentacion/             # modelo de datos y entregables del proyecto
├── .opencode/                 # skills y agentes de desarrollo (hitl, nuevo-modulo)
├── AGENTS.md                  # convenciones y comandos del proyecto
├── docker-compose.yml         # 4 servicios: frontend, backend-node, backend-flask, redis
└── README.md
```

## Base de datos

Motor **MySQL 8.0**. `database/schema.sql` es el esquema de referencia (incluye seed de administrador, 20 ejercicios y las tablas del módulo de pagos). Las migraciones manuales de `database/migrations/` se aplican **en orden**; cada incremento refleja la evolución ágil del sistema:

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
- Sequelize `sync()` crea y actualiza tablas al arrancar Node, pero **no reemplaza** las migraciones manuales en producción.
- La tabla `pesos_modelo_ia` es creada por Flask si no existe al recalibrar.
- Las tablas de datos médicos están desacopladas del perfil público en una relación 1:1.

## Requisitos previos

**Opción recomendada — Docker:**
- Docker Desktop (o Docker Engine) con Docker Compose.

**Opción manual (desarrollo):**
- Node.js 20+
- Python 3.11+
- MySQL 8.0
- Redis 7 (opcional en local; obligatorio dentro de Docker Compose)

## Variables de entorno

**Nunca commitear archivos `.env`; ya están en `.gitignore`.** Cada servicio incluye un `.env.example` sin secretos para partir de él.

### `backend-node/.env`

Obligatorias (validadas al arrancar en `src/shared/constants/index.js`):

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
NODE_ENV=development                # en producción se desactiva Swagger
PORT=3000                           # en Render lo inyecta la plataforma
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=10d
REDIS_URL=redis://localhost:6379/0  # Upstash: rediss://...
REDIS_ENABLED=false
CORS_ORIGINS=http://localhost:3000  # lista separada por comas; vacío = cualquier origen
ADMIN_EMAIL=<correo del administrador>
ADMIN_PASSWORD=<mínimo 12 caracteres si NODE_ENV=production>
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
PORT=5000                           # en Render lo inyecta la plataforma
```

## Instalación y ejecución

### Con Docker (recomendado)

```bash
docker-compose up --build   # construye y levanta todo
docker-compose up           # con imágenes existentes
docker-compose down         # detiene todo
docker-compose logs --tail=50
```

Una vez levantado, la aplicación está en `http://localhost`.

> El compose fija `NODE_ENV=production` en `backend-node`, por lo que **Swagger no está montado** en este stack (`/api/docs` responde 404). Para consultar la documentación de la API hay que levantar Node fuera de Docker con `NODE_ENV=development`.

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
python app.py                               # dev, puerto 5000 (o el de la variable PORT)
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

## Despliegue en producción (MVP)

El MVP está desplegado sobre servicios gestionados, todos con planes gratuitos o de costo mínimo (en un principio), evitando la operación de servidores propios.

```
Navegador
  └─ Vercel · frontend React (build estático, CDN + HTTPS)
        │  HTTPS  →  REACT_APP_API_URL
        ▼
  Render · backend-node (Express, puerto $PORT)
        ├── HTTPS + JWT de servicio (5 min) ──► Render · backend-flask (gunicorn, puerto $PORT)
        ├── MySQL · Aiven (3306, SSL obligatorio)
        └── Upstash Redis (rediss://, TLS) — caché de lectura + blacklist JWT
```

| Pieza | Servicio | Papel en el sistema |
|---|---|---|
| Frontend | **Vercel** | Aloja el build de CRA como estáticos, sirve el SPA con HTTPS y fallback de rutas a `index.html`. `frontend/vercel.json` fija además `Cache-Control: must-revalidate` en `service-worker.js` y `X-Content-Type-Options: nosniff`. |
| API principal | **Render** (web service Node) | Autenticación, roles, módulos de negocio, persistencia y Swagger en desarrollo. Respeta el puerto inyectado y tiene `trust proxy` activo para que el rate limiting lea la IP real detrás del proxy de la plataforma. |
| Motor de IA | **Render** (web service Python) | Endpoints `/api/predict`, guardián de seguridad y recalibración. No es público para el navegador: solo acepta el JWT de servicio que firma Node. |
| Base de datos | **Aiven** (MySQL 8) | Persistencia única para Node y Flask, con SSL forzado desde ambos clientes. |
| Caché y blacklist | **Upstash** (Redis) | Caché de lectura (dashboard, ejercicios, reportes, rutinas, dietas) y persistencia de la blacklist de JWT, ambos con TTL. |

### Variables por servicio

**Vercel** (Project Settings → Environment Variables):

```env
REACT_APP_API_URL=https://<backend-node>.onrender.com/api
```

> El sufijo `/api` es obligatorio: todas las rutas del backend cuelgan de ese prefijo. Las variables `REACT_APP_*` se incrustan **en tiempo de build**, así que tras cambiarlas hay que replegar.

**Render · backend-node** (Environment):

```env
NODE_ENV=production
DB_HOST=<host-de-aiven>
DB_PORT=3306
DB_NAME=<nombre-de-la-base>
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
JWT_SECRET=<secreto-compartido-con-flask>
ENC_KEY=<64 caracteres hexadecimales>
ENC_IV=<32 caracteres hexadecimales>
FLASK_IA_URL=https://<backend-flask>.onrender.com
REDIS_ENABLED=true
REDIS_URL=rediss://default:<token>@<host-upstash>:<puerto>
CORS_ORIGINS=https://<tu-app>.vercel.app
ADMIN_EMAIL=<correo-del-admin>
ADMIN_PASSWORD=<mínimo 12 caracteres>
```

Start Command: `npm start`. `PORT` lo inyecta Render y el backend lo respeta.

**Render · backend-flask** (Environment):

```env
DB_HOST=<host-de-aiven>
DB_PORT=3306
DB_NAME=<nombre-de-la-base>
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
JWT_SECRET=<el mismo que backend-node>
CORS_ORIGINS=*
LOG_LEVEL=INFO
```

Start Command:

```bash
gunicorn --bind 0.0.0.0:$PORT app:app
```

> Render asigna un puerto **aleatorio** en `PORT` y su proxy inverso solo enruta hacia ese puerto. Por eso el start command debe usar `$PORT` y no el 5000 fijo; el `Dockerfile` del servicio ya usa `${PORT:-5000}` para el mismo fin y conservar el 5000 en desarrollo local.

**Upstash** entrega la URL con esquema `rediss://` (TLS) y token integrado. ioredis negocia el TLS a partir del esquema, sin configuración adicional. Si Upstash no está conectado, el sistema degrada sin romperse: las lecturas de caché cuentan como *miss*, las escrituras se descartan y la blacklist de JWT cae a un `Set` en memoria.

**Aiven** entrega el host y el puerto del servicio MySQL. No hace falta cargar el certificado CA porque ambos clientes forzan SSL sin validar la cadena (ver limitaciones).

### Orden de despliegue

1. **Aiven** — crear el servicio MySQL, la base de datos y el usuario; aplicar `database/schema.sql` y las migraciones en orden.
2. **Upstash** — crear la base Redis y copiar la URL `rediss://`.
3. **Render · backend-flask** — desplegar y verificar con `GET /api/health`.
4. **Render · backend-node** — desplegar con `FLASK_IA_URL` apuntando a Flask y verificar con `GET /api/health`.
5. **Vercel** — conectar el repositorio, definir `REACT_APP_API_URL` y desplegar.
6. **CORS** — con el dominio de Vercel ya emitido, confirmar que `CORS_ORIGINS` de Node lo incluye y replegar Node.

Los pasos 4 y 5 dependen del anterior porque cada componente apunta a la URL del siguiente.

### Verificación tras el despliegue

| Comprobación | Resultado esperado |
|---|---|
| `GET https://<backend-node>/api/health` | `{"status":"ok","service":"backend-node"}` |
| `GET https://<backend-flask>/api/health` | `{"status":"ok","service":"backend-flask", ...}` — accesible solo con el JWT de servicio si se llama a `/api/predict/*` |
| Login desde la app en Vercel | El navegador muestra la respuesta de Node sin errores CORS |
| Predictor de rutina | El panel HITL recibe propuesta; confirma que Node alcanza a Flask |
| Revisar logs de Render | `Conexión a MySQL establecida.` y `Conexión a Redis establecida.` |

### Limitaciones conocidas del despliegue actual

1. **Swagger no existe en producción.** `app.js` solo monta `/api/docs` cuando `NODE_ENV !== 'production'`. Es deliberado, pero implica que la documentación solo es consultable en desarrollo.
2. **El service worker no cachea la API en producción.** La regla de caché de `/api/` está restringida al mismo origen, así que solo opera en el stack con nginx. Es una decisión de seguridad: la clave de caché de Workbox es la URL y el JWT viaja en cabecera, por lo que cachear respuestas cross-origin habría permitido que un usuario heredara los datos de otro en un dispositivo compartido. La caché se purga además en cada cierre de sesión.
3. **MySQL se conecta con SSL sin validar el certificado.** `connection.js` usa `rejectUnauthorized: false` y `db_connector.py` desactiva la verificación de identidad. El cifrado en tránsito está activo, pero la conexión no comprueba contra quién se conecta.
4. **Los planes gratuitos duermen.** Aiven y Render pueden suspender los servicios tras un periodo de inactividad. La primera petición tras la suspensión puede fallar; Node traduce un `ECONNREFUSED` del motor de IA a un `503 Servicio de IA no disponible`, que es reintentable. Los dos servicios backend deben estar activos para que la predicción funcione.
5. **No hay CI/CD.** Cada despliegue es manual desde el panel del proveedor, y las migraciones se aplican a mano contra Aiven. `sequelize.sync()` no sustituye a las migraciones en producción.

## Documentación de la API

- **Swagger (Node):** disponible en `/api/docs` y `/api/docs.json` **únicamente con `NODE_ENV != production`**.
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

- **Comunicación servicio-a-servicio:** Node firma un JWT `{service: 'backend-node'}` con expiración de 5 minutos y lo envía como `Bearer` a Flask, que valida firma, expiración y emisor. En producción este canal viaja por HTTPS.

## Seguridad

- **Cifrado AES-256-CBC a nivel de aplicación** de datos médicos sensibles (`alergias`, `intolerancias`, `lesiones`, `condiciones_preexistentes`, `medicacionActual`) con `ENC_KEY` (32 bytes) e `ENC_IV` (16 bytes).
- **Aislamiento de datos médicos:** tabla independiente en relación 1:1, desacoplada del perfil público; acceso controlado por RBAC.
- **Revelado controlado en el frontend:** los valores médicos se ocultan por defecto y se muestran con un botón de privacidad; solo el propio instruido, su entrenador asignado o un administrador pueden verlos descifrados.
- **RBAC:** middleware `autenticar` (JWT) → `autorizar` (roles) → `validar` (Joi) en todas las rutas.
- **Rate limiting en auth:** 20 logins / 15 min, 10 registros / hora, 30 refresh / 15 min. Requiere `trust proxy` para leer la IP real detrás del proxy de Render.
- **Blacklist JWT:** persiste en Redis cuando `REDIS_ENABLED=true`; sin Redis activo cae a un `Set` en memoria que se pierde al reiniciar Node.
- **JWT de servicio:** comunicación Node ↔ Flask autenticada con token de 5 minutos firmado con secreto compartido; solo `/api/health` y `/api/health/detailed` son públicos en Flask.
- **Variables de producción validadas al arrancar:** longitud y formato de `ENC_KEY` / `ENC_IV`, y longitud mínima de `ADMIN_PASSWORD`.
- **Detección de corrupción:** si los datos médicos fueron cifrados con una `ENC_KEY`/`ENC_IV` distinta a la actual, el backend devuelve `datosMedicosCorruptos: true` y el frontend solicita reingresar la información. Los valores originales no son recuperables sin la clave con que se cifraron.

## Roles del sistema

| Rol | `tipo` en el JWT | Capacidades |
|---|---|---|
| `administrador` | `entrenador` | Acceso total al sistema |
| `entrenador` | `entrenador` | Sus instruidos, panel de revisión HITL, reportes, certificaciones |
| `instruido` | `instruido` | Su perfil y métricas, rutinas y dietas asignadas, pagos, reportes |

Redirección post-login: un instruido sin `perfilMedicoCompleto` es enviado a `/complete-profile`; de lo contrario, al dashboard.

## Pruebas

| Servicio | Comando | Cobertura actual |
|---|---|---|
| backend-node | `npm test` (Jest + coverage) | **27 suites**: auth (servicio, validación, invalidación, caché), blacklist, caché Redis y sus TTL, pagos (invalidación, caché), dietas, ejercicios, cliente Flask, validación HITL, instruidos, perfil médico, plantillas, reportes, rutinas asignadas |
| backend-flask | `python tests/test_guardian.py` | Suite manual (assert) centrada en `GuardianSeguridad`; registrar nuevas funciones `test_*` en el bloque `__main__` o no se ejecutarán |
| frontend | `npm test` | Infraestructura CRA lista, sin pruebas aún |

## Estado del proyecto

**Alcance completado.** Los once requisitos funcionales (RF01–RF11) están implementados de extremo a extremo: autenticación y roles, métricas físicas, perfil médico cifrado, cálculo metabólico, predicción de rutina y dieta, guardián de contraindicaciones, panel de aprobación HITL con feedback, reportes de adherencia, módulo de pagos con verificación de comprobantes, y PWA offline-first. El aprendizaje continuo con recalibración en caliente de los pesos del modelo también está operativo.

**Estado por capa:**

| Capa | Estado |
|---|---|
| Frontend | 15 rutas en `App.jsx` con carga diferida por página, tema oscuro, diseño responsivo y accesible, contextos de autenticación, UI y tema, PWA con service worker y página offline. Sin pruebas automatizadas. |
| Backend Node | 8 módulos (`auth`, `instruidos`, `entrenamiento`, `metabolismo`, `dietas`, `pagos`, `reportes`, `dashboard`), Swagger, caché con invalidación por patrón y blacklist en Redis. 27 suites Jest en verde. |
| Backend Flask | `GuardianSeguridad`, `RecommenderEngine`, endpoints de predicción, validación, feedback y recalibración, autenticación servicio-a-servicio. |
| Infraestructura | Docker Compose con 4 servicios y nginx como proxy inverso hacia Node. |
| Producción | Operativo: frontend en Vercel, ambos backends en Render, MySQL en Aiven y caché en Upstash. Ver [Despliegue en producción](#despliegue-en-producción-mvp). |

**Deuda técnica y pendientes conocidos:**

- Sin pruebas unitarias en el frontend (la infraestructura de CRA está lista).
- Sin linter, formatter ni integración continua; el estilo se sostiene por convención.
- Migraciones SQL de aplicación manual: no existe un runner que garantice el esquema en un entorno limpio.
- `ENC_IV` es una constante compartida por toda la instalación, no un vector aleatorio por registro; además, rotar `ENC_KEY` o `ENC_IV` vuelve indecifrables los registros previos.
- El pool de conexiones de Sequelize (10) es fijo y no se ajusta a los límites del plan de Aiven.
- La verificación de identidad en la conexión MySQL está desactivada (SSL sin validar certificado).
- Los planes gratuitos de Aiven, Render y Upstash imponen suspensión por inactividad y límites de conexiones.

## Notas operativas

- `npm run seed:ejercicios` es **destructivo**: borra la tabla `ejercicios` y la vuelve a insertar (~1000 ejercicios descargados desde GitHub).
- El body de `/api/pagos` y `/api/auth/certifications` tiene un límite de **5 MB** para comprobantes y archivos en base64; el resto de la API conserva el límite por defecto (100 kB).
- Si Redis no está disponible con `REDIS_ENABLED=true`, el sistema usa un fallback en memoria (`Set`) para la blacklist, que se pierde al reiniciar Node.
- Guardar datos médicos con una `ENC_KEY`/`ENC_IV` distinta a la actual hará que esos registros no puedan descifrarse (sin posibilidad de recuperación).
- Los secretos de producción (`JWT_SECRET`, `ENC_KEY`, `ENC_IV`, contraseñas de base de datos, tokens de Upstash) se configuran **solo en los paneles de Vercel y Render**, nunca en el repositorio.

---

## Equipo

**Jorge Luis Montiel** — CI 31.545.512

Desarrollo full-stack del sistema: arquitectura y backend Node/Express, motor de IA en Flask, base de datos, interfaz React y despliegue en producción.

Facultad Experimental de Ciencias — LUZ
961616 PP4: Desarrollo de Sistemas · 2026-I
