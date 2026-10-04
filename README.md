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
- [Modelo Entidad-Relación (ER) y Base de datos](#modelo-entidad-relación-er-y-base-de-datos)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Despliegue en producción (MVP)](#despliegue-en-producción-mvp)
- [Documentación de la API](#documentación-de-la-api)
- [Seguridad](#seguridad)
- [Roles del sistema](#roles-del-sistema)
- [Pruebas](#pruebas)
- [Estado del proyecto](#estado-del-proyecto)
- [Dificultades encontradas y soluciones aplicadas](#dificultades-encontradas-y-soluciones-aplicadas)
- [Mantenimiento realizado](#mantenimiento-realizado)
- [Notas operativas](#notas-operativas)
- [Conclusiones finales](#conclusiones-finales)
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
3. **Generación (capa 2):** `RecommenderEngine` genera la rutina o dieta propuesta ya filtrada por el guardián, y Node persiste el resultado junto con las advertencias recibidas.
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
| `20260904_eliminar_rendimiento.sql` | Eliminación de la tabla `rendimiento`, reemplazada por `series_ejecutadas` |
| `20260927_certificaciones_archivo.sql` | Archivos adjuntos de certificaciones del entrenador |

- Algunos cambios de datos tienen scripts Node en `backend-node/src/scripts/` (por ejemplo `run-migration-010.js`, `migrate-json-camelcase.js`).
- Sequelize `sync()` crea y actualiza tablas al arrancar Node, pero **no reemplaza** las migraciones manuales en producción.
- La tabla `pesos_modelo_ia` es creada por Flask si no existe al recalibrar.
- Las tablas de datos médicos están desacopladas del perfil público en una relación 1:1.

## Modelo Entidad-Relación (ER) y Base de datos

El modelo Entidad-Relación (ER) del sistema rige la lógica de negocio y se encuentra estructurado en torno a múltiples módulos interconectados. La estructura de estas entidades está materializada en la base de datos a través del archivo central `database/schema.sql`.

> Esta sección agrupa las entidades por **área funcional**. El registro cronológico de cómo evolucionó el esquema está en [Base de datos](#base-de-datos).

### Entidades principales del sistema

A partir de la arquitectura de la aplicación, el modelo se divide en las siguientes áreas clave:

- **Gestión de usuarios:** tablas dedicadas a los diferentes roles del sistema, principalmente `entrenadores` e `instruidos`.
- **Salud y fisiología:** entidades que almacenan datos físicos, como `perfil_medico` y `calculos_metabolicos` (incluyendo el historial de cálculos metabólicos).
- **Actividad física y rutinas:** módulo extenso que abarca `plantillas_entrenamiento`, `series_ejecutadas`, `rutinas_asignadas` (incluyendo decisiones y estados como eliminados) y `registro_entrenamiento`.
- **Nutrición:** entidades relacionadas con el control alimenticio, tales como `planes_dieta` y la toma de decisiones en ellas.
- **Gestión financiera:** entidades encargadas de la facturación, reflejadas en las tablas de `pagos` y `planes_pago` (incluyendo su ofrecimiento).
- **Inteligencia artificial (HITL):** entidades diseñadas para la retroalimentación y aprendizaje del modelo, tales como `feedback_hitl`, `pesos_modelo_ia` y el seguimiento del `error_prediccion_ia`.
- **Validaciones y archivos:** entidades para el respaldo de documentos, como la tabla `certificaciones`.

### Correspondencia con `database/schema.sql`

**Esquema base.** El archivo `database/schema.sql` contiene la definición DDL (Data Definition Language) de las tablas mencionadas, estableciendo los tipos de datos, claves primarias (PK) y claves foráneas (FK) que forman las relaciones del modelo ER.

**Evolución mediante migraciones.** Dado que el modelo ER es escalable, el esquema se actualiza de forma controlada a través de archivos en la carpeta `database/migrations/`. Cada cambio en el modelo ER (como añadir módulos de pago o ajustar los días obligatorios de los instruidos) se refleja en un archivo SQL secuencial (ej. `004_add_modulo_pagos.sql`, `011_instruidos_dias_obligatorios.sql`), y `schema.sql` se mantiene como documento de referencia del diseño.

> **Nota sobre la correspondencia real.** El diagrama ER y `database/schema.sql` no son hoy equivalentes: `certificaciones`, `instruidos.rol` y `pesos_modelo_ia` no están definidos en `schema.sql` — los crea `sequelize.sync()` al arrancar Node, y en el caso de `pesos_modelo_ia` la migration `003` —, y el diagrama todavía incluye `rendimiento`, tabla eliminada de la base por `20260904_eliminar_rendimiento.sql`. Una instalación limpia no se reconstruye únicamente a partir de `schema.sql`.

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

Dos observaciones menores sobre la cobertura del cifrado, que no son fallos de seguridad pero conviene tener presentes:

- **`medicacion_actual` se cifra, pero el esquema no lo declara.** Es la única de las cinco columnas sensibles sin el comentario `'JSON cifrado desde Node.js'` que sí tienen sus cuatro hermanas (`schema.sql:69` frente a `schema.sql:65-68`). El cifrado sí ocurre: `medicacionActual` forma parte de `CAMPOS_SENSIBLES` (`backend-node/src/modules/instruidos/perfil-medico.service.js:5`), que es la lista que recorre `cifrarCampos`. Es el esquema, no el código, el que subdeclara la cobertura.
- **`observaciones` es el único campo médico que viaja en claro.** No está en `CAMPOS_SENSIBLES`, se devuelve al frontend en `obtenerPerfilSeguroParaFrontend` (`perfil-medico.service.js:106`) y llega a Flask sin cifrar, porque `obtenerPerfilDescifradoParaFlask` (`perfil-medico.service.js:112-115`) solo descifra los cinco campos de esa lista. Es texto libre dentro de un perfil médico, y merece la misma decisión que el resto de datos clínicos.

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
| backend-flask | `python tests/test_guardian.py` | Suite manual (assert) de **49 funciones `test_`**, todas ellas registradas en el bloque `__main__`. Cubre `GuardianSeguridad`, el clasificador de plantillas, el motor nutricional, el recommender, la normalización de texto y los health checks. Registrar nuevas funciones `test_*` en `__main__` o no se ejecutarán |
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

## Dificultades encontradas y soluciones aplicadas

Lo que más costó no fue escribir el código de cada módulo, sino las fronteras entre ellos y las consecuencias de las decisiones tomadas al principio. Estas fueron las dificultades reales y cómo quedaron resueltas:

| Dificultad | Causa raíz | Solución aplicada | Evidencia |
|---|---|---|---|
| Un segundo servicio desplegarse por separado rompe la confianza entre módulos | La lógica de negocio quedó en Node y el motor predictivo en Flask, de modo que la frontera quedó concentrada en los datos que cruzan entre ambos | Se fijó un contrato explícito: Node descifra el perfil médico, lo envía con un JWT de servicio de 5 minutos firmado con `JWT_SECRET`, y Flask devuelve la propuesta junto con sus advertencias. La persistencia y la decisión siguen siendo de Node y del entrenador | `shared/utils/flask-client.js:93`, `backend-flask/api/auth.py` |
| La IA proponía siempre lo mismo, y a veces nada | El clasificador tendía a repetir la misma plantilla y, cuando el pool de ejercicios seguros se agotaba tras aplicar las exclusiones, podía devolver una rutina vacía sin avisar | Se corrigió el falso positivo de precaución comparando `contraindica_lesiones` del ejercicio contra las lesiones reales del cliente en vez de marcar como precaución todo ejercicio con el campo poblado, y se añadió la validación explícita del pool vacío con respuesta **HTTP 422** y `alertas_seguridad` | Commits `fcf5060` y `8ce0ca6` |
| Rotar la clave de cifrado dejaba los datos médicos ilegibles para siempre | `ENC_IV` es una constante compartida por toda la instalación, no un vector aleatorio por registro, y cambiar `ENC_KEY` o `ENC_IV` vuelve indecifrables los registros previos | El problema no se arregla, se detecta: se añadió `datosMedicosCorruptos`, que marca el registro cuando un valor parece un hash hexadecimal y no se descifra, y el frontend pide al usuario que reingrese la información | `perfil-medico.service.js:21-52` |
| La adherencia se medía con una tabla que nadie llenaba con datos reales | `rendimiento` era un registro manual, desconectado de lo que el cliente realmente levantaba | Se normalizó a `series_ejecutadas` (migración `20260903`), que guarda cada serie con repeticiones, carga, descanso y RPE; después se eliminó `rendimiento` (`20260904`) y se recreó la vista de progreso sin ella | `database/migrations/20260903_series_ejecutadas.sql`, `20260904_eliminar_rendimiento.sql` |
| Node y Flask hablaban idiomas distintos | El contrato de la API se había estandarizado a camelCase, pero los campos JSON de `plantillas_entrenamiento` y `rutinas_asignadas` arrastraban claves antiguas en snake_case | Migración `009` que delega en un script Node (`src/scripts/migrate-json-camelcase.js`), porque renombrar claves anidadas dentro de arrays JSON no es viable en SQL puro | `database/migrations/009_migrate_json_camelcase.sql` |
| El motor de IA quedaba expuesto si se abría el puerto 5000 | Un microservicio en la red de Docker es alcanzable por cualquier contenedor, no solo por Node | Canal autenticado: Node firma un JWT `{service: 'backend-node'}` de 5 minutos y Flask valida firma, expiración y emisor. `docker-compose.yml` no publica puerto para Flask; en producción ambos pasan por HTTPS | `AGENTS.md`, `docker-compose.yml` |
| El rate limiting no distinguía a un usuario de otro | Render coloca su proxy inverso delante, así que todas las peticiones llegaban con la misma IP y el límite de 20 logins / 15 min bloqueaba a todo el mundo | `app.set('trust proxy', 1)` para que `express-rate-limit` lea la IP real del cliente | `app.js:24-26` |
| Fugas de datos médicos y autorización insuficiente | El perfil médico se revelaba en más contextos de los previstos y las rutas de IA no exigían rol al solicitante | Revisión de tres commits: se corrigió el revelado, se exigieron credenciales validadas al crear instruidos, se permitió al administrador en rutinas y sugerencias IA, se sanitizaron los health checks y se ocultó Swagger en producción | Commits `eb17ba8`, `8088890`, `1f2b9d6` |
| La caché de la API podía devolver datos de otro usuario | La clave de caché de Workbox es la URL y el JWT viaja en cabecera, así que cachear respuestas cross-origin haría que un usuario heredara los datos de otro en un dispositivo compartido | La regla de caché de `/api/` se restringió al mismo origen —de modo que solo opera en el stack con nginx— y la caché se purga en cada cierre de sesión | `frontend/src/service-worker.js` |
| Secretos y datos reales en el repositorio | Credenciales de administrador en archivos de trabajo y en el seed de `schema.sql` | Redacción de los secretos y del correo del administrador, sin pérdida funcional: los secretos de producción se configuran solo en los paneles de Vercel y Render | Commits `1f2b9d6`, `eb17ba8`, `schema.sql:447` |
| `REACT_APP_API_URL` sin el sufijo `/api` | Las variables `REACT_APP_*` se incrustan en tiempo de build, así que un valor equivocado no se corrige sin replegar | Se fijó la variable con el sufijo y se replegó el frontend | Commit `638e6b4` |
| Redis no está garantizado en desarrollo local | El sistema debe operar sin depender de un servicio externo | Degradación explícita: si Redis no responde, las lecturas cuentan como *miss*, las escrituras se descartan y la blacklist de JWT cae a un `Set` en memoria, que se pierde al reiniciar Node | `shared/cache/redis.js` |

## Mantenimiento realizado

El proyecto se mantuvo de forma incremental entre el **9 de junio y el 4 de octubre de 2026**, en **67 commits**.

**Evolución del esquema.** 16 migraciones numeradas más un *rollback* (`011_instruidos_dias_obligatorios_rollback.sql`), que registran la historia real del crecimiento: días de la semana, feedback HITL, pesos del modelo, módulo de pagos, ofrecimiento y decisión en cada capa, borrado lógico de rutinas, normalización de JSON, cálculos metabólicos, series ejecutadas y archivos de certificaciones.

**Cobertura de pruebas.** 27 suites Jest en `backend-node` con mocks de Sequelize y cobertura de caché y TTL, y 49 funciones `test_` manuales en Flask.

**Refactors y correcciones con impacto estructural:**

| Commit | Trabajo |
|---|---|
| `8ce0ca6` | Migración del motor de IA a clasificador único y borrado lógico de rutinas |
| `1e58c7a` | Normalización de la estructura de ejercicios y días en rutinas y plantillas |
| `627c3d4` | Refactor del motor HITL, Guardian y recommender, con migración de JSON a camelCase |
| `4bbdcc5` | Módulo de informes con seguimiento exhaustivo del rendimiento |
| `3bff4a5` | Compresión de respuestas y optimización del pool de conexiones |
| `44b11b3`, `5fe686a` | Caché con Redis en servicios y controladores, TTL por tipo de dato, invalidación por patrón y precarga de ejercicios al arrancar |
| `8b51d00` | Configuración de CORS y gestión de tiempos de espera en las solicitudes |
| `06a52f8` | Sesiones de entrenamiento con seguimiento de series |
| `f008ca4` | Corrección del flujo pagos → HITL |
| `58fb4de` | Manejo de asociaciones nulas y valores no numéricos en reportes |
| `8dcbda3`, `b0690e0` | Diseño responsivo y accesibilidad en tablas y componentes |
| `f542de7`, `94ecbeb` | Documentación Swagger completa de los 66 endpoints |
| `969c6ec`, `638e6b4` | Corrección de la reescritura de rutas en Vercel y redeploy con la URL de API correcta |

**Auditoría de seguridad.** Tres commits dedicados a hallazgos de seguridad: corrección de fugas de datos médicos y autorización (`eb17ba8`), resolución de los seis hallazgos de revisión —validación de correo y contraseña al crear instruido, permisos de administrador en rutinas y sugerencias IA, sanitización de los health checks y ocultamiento de Swagger en producción— (`8088890`) y eliminación de credenciales del repositorio (`1f2b9d6`).

**Despliegue.** Se consolidó el MVP sobre cuatro servicios gestionados: frontend en Vercel, ambos backends en Render, MySQL en Aiven y caché en Upstash, con el orden de despliegue y la verificación posterior documentados en [Despliegue en producción](#despliegue-en-producción-mvp).

## Notas operativas

- `npm run seed:ejercicios` es **destructivo**: borra la tabla `ejercicios` y la vuelve a insertar (~1000 ejercicios descargados desde GitHub).
- El body de `/api/pagos` y `/api/auth/certifications` tiene un límite de **5 MB** para comprobantes y archivos en base64; el resto de la API conserva el límite por defecto (100 kB).
- Si Redis no está disponible con `REDIS_ENABLED=true`, el sistema usa un fallback en memoria (`Set`) para la blacklist, que se pierde al reiniciar Node.
- Guardar datos médicos con una `ENC_KEY`/`ENC_IV` distinta a la actual hará que esos registros no puedan descifrarse (sin posibilidad de recuperación).
- Los secretos de producción (`JWT_SECRET`, `ENC_KEY`, `ENC_IV`, contraseñas de base de datos, tokens de Upstash) se configuran **solo en los paneles de Vercel y Render**, nunca en el repositorio.

---

## Conclusiones finales

- **Lo que más aprendí fue que el riesgo está en la frontera entre los servicios.** Con Node y Flask desplegados por separado, los fallos aparecen en el contrato que los une, no en la lógica de negocio de ninguno de los dos. Y que decidir qué datos son sensibles *antes* de escribir la funcionalidad evitó tener que revertir nada después: el aislamiento del perfil médico y el cifrado en reposo se decidieron al principio y nunca hubo que desmontarlos.

- **Lo más difícil fue el flujo HITL y el guardián de seguridad**, por tres motivos concretos: los falsos positivos de precaución dejaban la rutina vacía, el pool de ejercicios seguros se agotaba sin avisar, y el motor tendía a repetir siempre la misma plantilla. Los tres están resueltos y cubiertos con pruebas, pero fueron los que más iteración costaron.

- **El resultado cumple el objetivo general con limitaciones.** Los once requisitos funcionales funcionan de extremo a extremo, probados y desplegados en producción. Lo que queda pendiente es deuda técnica y de proceso —pruebas en el frontend, migraciones automáticas, verificación del certificado de MySQL—, no funcionalidad ausente.

- **No puedo afirmar todavía que el guardián haya impedido un riesgo real.** Las reglas están demostradas en la suite de pruebas, pero no hay aún volumen de uso que lo evidencie en producción. Prefiero decirlo así antes que presentarlo como un caso de éxito.

- **Si empezara de nuevo**, fijaría el contrato de la API y el esquema de la base de datos antes de escribir la primera línea de código de los dos servicios; pondría las migraciones automáticas desde el día uno en lugar de aplicarlas a mano; modelaría la adherencia normalizada desde el principio, porque `rendimiento` fue un error de diseño que costó una tabla y una migración entera; y reservaría tiempo explícito para seguridad y documentación en lugar de tratarlas como un añadido.

- **El trabajo futuro** apunta a pruebas automatizadas en el frontend, CI/CD con un runner de migraciones, cifrado por registro con rotación de claves en lugar de un IV compartido, endurecer las conexiones a MySQL y Redis, notificaciones y reportes en PDF, y llevar el motor predictivo hacia un modelo de machine learning más real en lugar de un clasificador con pesos recalibrados.

---

## Equipo

**Jorge Luis Montiel** — CI 31.545.512

Desarrollo full-stack del sistema: arquitectura y backend Node/Express, motor de IA en Flask, base de datos, interfaz React y despliegue en producción.

Facultad Experimental de Ciencias — LUZ
961616 PP4: Desarrollo de Sistemas · 2026-I
