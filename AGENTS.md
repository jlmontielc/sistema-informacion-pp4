# Sistema de Entrenador Personal — PP4

## Stack

- **Frontend:** React 18 (CRA) + React Router 6 + Axios + Recharts + Workbox (PWA)
- **API:** Node.js 20 + Express 4 + Sequelize 6 + MySQL2 + JWT + Swagger
- **IA:** Python 3.11 + Flask 3 + scikit-learn + pandas (HITL engine)
- **DB:** MySQL 8.0 en Aiven Cloud (externa, no Dockerizada)
- **Infra:** Docker Compose (3 servicios)

## Arquitectura: Monolito Modular Especializado

```
User -> nginx:80 (frontend SPA)
         +-- /api/* -> backend-node:3000 (nucleo del sistema)
         |               +-- HTTP -> backend-flask:5000 (motor IA aislado)
         +-- /* -> index.html (SPA fallback)
```

- **backend-node** — monolith with modular domain folders (`auth/`, `instruidos/`, `entrenamiento/`, `metabolismo/`, `dietas/`, `reportes/`, `dashboard/`).
- **backend-flask** — microservicio aislado, solo logica matematica/predictiva.
- **Flujo HITL:** Flask predice + valida con Guardian (reglas de lesiones/condiciones/carga) -> Node persiste resultado -> entrenador revisa, modifica o acepta antes de publicar.
- **Auth servicio a servicio:** Node firma un JWT interno (`{service:'backend-node'}`, 5 min) con `JWT_SECRET` compartido y lo envia como `Bearer` a todas las rutas `/api/predict/*`. Flask valida firma+exp+emisor con PyJWT (`api/auth.py`). Solo `/api/health` es publico; puerto 5000 no expuesto en docker-compose.
- **Recalibracion de pesos:** `POST /api/predict/recalibrar` recalcula pesos de scoring del RecommenderEngine desde tasas de `feedback_hitl` (minimo 5 registros), persiste en `pesos_modelo_ia` y aplica en caliente. El engine carga los pesos persistidos al iniciar.

## Comandos exactos

### Docker
```bash
docker-compose up --build   # Construye y levanta todo
docker-compose up           # Levanta con imagenes existentes
docker-compose down         # Detiene todo
```

### Backend Node (`cd backend-node`)
```bash
npm run dev              # nodemon (desarrollo, hot-reload)
npm start                # node src/server.js
npm run seed             # Crea admin por defecto
npm run seed:ejercicios  # Descarga ~1000 ejercicios desde GitHub
npm test                 # Jest --coverage (tests/ vacio actualmente)
```

### Backend Flask (`cd backend-flask`)
```bash
python app.py                        # Dev server (debug=True, puerto 5000)
python tests/test_guardian.py        # Tests manuales (13 funciones de test)
gunicorn --bind 0.0.0.0:5000 app:app # Produccion
```

### Frontend (`cd frontend`)
```bash
npm start       # CRA dev server (puerto 3000)
npm run build   # Build -> build/
npm test        # Jest (react-scripts test, sin tests aun)
```

## Tests

- **Flask:** `python tests/test_guardian.py` desde `backend-flask/`. Patron manual: NO usa pytest, es `if __name__ == '__main__'` con `assert`. Agregar funciones nuevas al bloque `__main__`.
- **Node (Jest):** `npm test` — directorio `tests/` vacio (crypto.test.js disponible).
- **Frontend (Jest):** `npm test` — sin tests aun.
- **Pendientes (segun guia PP4):** pruebas de carga/estres y usabilidad.

## Base de datos

- MySQL 8.0 en Aiven Cloud. SSL obligatorio (`rejectUnauthorized: false`).
- Schema en `database/schema.sql` (seed admin + 20 ejercicios).
- Migraciones manuales SQL en `database/migrations/`.
- Sequelize `sync()` al iniciar crea tablas si no existen.
- Tabla `pesos_modelo_ia` (migracion 003): persiste pesos de scoring del motor IA, recalibrados desde feedback. Flask tambien la crea con CREATE TABLE IF NOT EXISTS al recalibrar.

## Variables de entorno requeridas

**backend-node/.env:**
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET, JWT_EXPIRES_IN=15m, JWT_REFRESH_EXPIRES_IN=10d
ENC_KEY (32 bytes hex), ENC_IV (16 bytes hex)  <- AES-256-CBC
FLASK_IA_URL=http://localhost:5000
```

**backend-flask/.env:** mismas creds DB + `JWT_SECRET` para validar tokens.

## Detalles clave

- **Roles:** Administrador (crea entrenadores), Entrenador (gestiona clientes), Instruido (cliente final, se auto-registra).
- **Seed admin:** `admin@sistema.com` / `Admin123!` se crea automaticamente al iniciar backend-node (tambien en schema.sql).
- **Datos medicos cifrados:** `alergias`, `intolerancias`, `lesiones`, `condiciones_preexistentes` en AES-256-CBC. Node descifra antes de enviar a Flask.
- **HITL workflow:** Flask genera recomendacion + ejecuta Guardian (reglas de lesiones/condiciones/carga) -> si hay contraindicacion, bloquea y alerta -> Node persiste resultado -> entrenador acepta/modifica/rechaza -> feedback guardado en `feedback_hitl`.
- **Token blacklist:** en memoria (Set). Se pierde al reiniciar servidor.
- **Rate limiting:** 20 login/15min, 10 registros/hora en rutas de auth.
- **Swagger:** documentacion interactiva en `/api/docs`.
- **Campos `contrasenaHash`:** en JS mapea a columna `password_hash` via `field:`.
- **No hay linter/formatter/CI/CD** — cero configuracion.

## Convenciones del proyecto

- Codigo y nombres en espanol (modulos, rutas, comentarios, variables).
- Validaciones con Joi en archivos `*.validation.js` separados.
- Middleware: `authenticate.js` (JWT), `autorizar.js` (roles: administrador/entrenador/instruido), `validate.js` (Joi).
- Frontend usa Axios con interceptor para refresh automatico de JWT.
- Sequelize models: `field:` explicito para snake_case en columnas DB.
- Estructura modular por dominio (carpetas aisladas: auth, instruidos, entrenamiento, metabolismo, dietas, reportes, dashboard).

## Metodologia (guia PP4)

- Ciclo de vida hibrido: Incremental + Scrum (sprints de 2 semanas).
- MVP primero, luego iteraciones.
- Pruebas pendientes segun guia: unitarias, integracion, carga/estres, usabilidad.
- Modulo de pagos (RF11) — no implementado aun, pendiente.
