# Plan: Actualización completa de Swagger por módulo (backend-node)

## Contexto verificado (exploración)

- Infra: `backend-node/src/shared/swagger/swaggerConfig.js` (swagger-jsdoc + swagger-ui-express). UI en `/api/docs`, JSON en `/api/docs.json`. Estrategia híbrida: components centralizados + JSDoc `@openapi` inline en los route files.
- Cobertura JSDoc actual: TODOS los módulos tienen bloques (algunos combinan GET+PUT/PUT+DELETE en un bloque). **Sin embargo hay schemas desalineados con el código real y estatus faltantes.**
- Errores: siempre `{ error: string }` (validate.js:9, errorHandler.js:18, authenticate.js, autorizar.js). Éxitos devuelven objeto/array directo.
- Validaciones Joi confirmadas: `plantillas.validation.js`, `rutinas-asignadas.validation.js`, `instruido.validation.js`, `dietas.validation.js`, `pagos.validation.js` (campos camelCase: `ejercicioId`, `cargaKg`, `descansoSegundos`, `diasSemana`, `frecuenciaSemanal`, etc.).

## Cambios

### Fase 1 — `swaggerConfig.js`

1. **`components.responses` nombrados por estatus** (el corazón del pedido "recrea los tipos de respuestas"):
   - `PeticionInvalida` (400), `NoAutenticado` (401, con los 5 mensajes de token + credenciales), `AccesoDenegado` (403), `NoEncontrado` (404), `Conflicto` (409: email duplicado / pago ya procesado), `DemasiadasSolicitudes` (429: login/registro/refresh), `ErrorServidor` (500), `SinContenido` (204), `IaRespuestaInvalida` (502 con `data`), `IaNoDisponible` (503), `IaTimeout` (504). Todos con descripción + examples reales. Se conserva `Error` por compatibilidad.
2. **Schemas corregidos** (alineados al código real):
   - `EjercicioListResponse` → `{ejercicios[], total, pagina, limite, totalPaginas}` (era `datos[]`); nota de array plano sin filtros; `limite` default 50 (clamp 1-100).
   - `EjercicioRutinaItem` → camelCase (`ejercicioId, dia, orden, series, repeticiones, cargaKg, descansoSegundos, notas`) + `nombre`.
   - `PlantillaCreateRequest` → camelCase (`diasSemana, frecuenciaSemanal, duracionSemanas, nivelDificultad`); enums confirmados (`fuerza|hipertrofia|resistencia|cardio|funcional|flexibilidad`; `perdida_peso|ganancia_muscular|mantenimiento|rendimiento|rehabilitacion`).
   - `PlantillaDiaResponse` → + `configuracionDia {diaSemana, nombre} | null`, items con `nombre`.
   - `RutinaAsignadaResponse` → + `decision, eliminado, Instruido{id,nombre}`; ejemplo camelCase.
   - `RutinaCreateRequest` → `instruidoId` (era `cliente_id`), camelCase; `RutinaClonarRequest` → `instruidoId`.
   - `RutinaDiaResponse` → + `configuracionDia`.
   - `RutinaResumenResponse` → shape real `{rutinaId, nombre, tipo, frecuenciaSemanal, totalEjercicios, configuracionDias, dias: {"1": {...}}}`.
   - `MetabolismoResultadoResponse` → shape real `{tmb, gct, nivelActividad}` (sin clienteId/pesoUsado/fechaCalculo).
   - `HITLSugerenciaDietaResponse` → camelCase (`objetivoCalorico, proteinasGramos, ...`) + `guardian {aprobado, alertas[]}`.
   - `DietaGenerarResponse` → `guardian {aprobado, alertas[{tipo, nivelRiesgo, mensaje}]}` + fechas en `dieta`.
   - `HITLFeedbackResponse` → `createdAt` (era `created_at`).
   - `SuscripcionResponse` → + `vencida`, `mensaje`; descripción de las 3 variantes reales (vigente / sin suscripciones / vencida).
   - `AuthSuccessResponse` → + `user.perfilMedicoCompleto` (solo instruido).
   - `UserInstruido` → + `nivelExperiencia`, `perfilMedicoCompleto`.
   - `PagoResponse` → + `verificadoPor, fechaVerificacion, errorPrediccionIa, plan{id,nombre,montoUsd,diasVigencia}, metodo{id,tipo}, Instruido{id,nombre}`.
   - `SerieResponse` → + `ejercicio{id, nombre, grupoMuscular}` opcional (incluido en GET registro y series).
3. **Schemas nuevos** (requests faltantes): `InstruidoCreateRequest`, `InstruidoUpdateRequest`, `InstruidoUpdatePropioRequest`, `AgregarEjercicioDiaRequest`, `EditarEjercicioDiaRequest`, `ReordenarRequest`, `EjercicioEliminadoResponse` (`{eliminado, ejercicio}`), `PlantillaUpdateRequest`, `RutinaUpdateRequest`, `DietaUpdateRequest`, `PlanPagoUpdateRequest`, `MetodoPagoUpdateRequest`, `TasaCambioRequest`.

### Fase 2 — Route files (ajustes quirúrgicos + upgrade de refs de error)

En todos los archivos: convertir cada `$ref: '#/components/responses/Error'` al componente nombrado según su estatus (400→`PeticionInvalida`, 401→`NoAutenticado`, 403→`AccesoDenegado`, 404→`NoEncontrado`, 409→`Conflicto`, 429→`DemasiadasSolicitudes`, 500→`ErrorServidor`, 502/503/504→`Ia*`). Reemplazo mecánico por contexto de estatus.

Correcciones de contenido por archivo:

- **auth.routes.js**: añadir `perfilMedicoCompleto: true` a los ejemplos de instruido (login 200 y register/instruido 201).
- **instruido.routes.js**: PUT `/yo` → `InstruidoUpdatePropioRequest`; POST `/` → `InstruidoCreateRequest` y quitar 409 (email duplicado real → 500, se documenta en la descripción); PUT `/{id}` → `InstruidoUpdateRequest`, quitar 409; DELETE `/{id}` → summary "Eliminar instruido (borrado físico)" y quitar 404 (responde 204 aunque no exista — gotcha documentado).
- **perfil-medico.routes.js**: corregir ejemplo 403 al mensaje real (`Acceso denegado` / redirección a `/api/instruidos/yo/perfil-medico`).
- **ejercicios.routes.js**: `limite` default 50; GET 200 describe array plano vs paginado; POST/PUT sin Joi → quitar 400; DELETE → quitar 404 (204 aunque no exista), gotcha en descripción.
- **plantillas.routes.js**: PUT `/{id}` → `PlantillaUpdateRequest`; POST/PUT ejercicios de día → `AgregarEjercicioDiaRequest`/`EditarEjercicioDiaRequest`; DELETE índice → 200 `EjercicioEliminadoResponse` (shape real `{eliminado, ejercicio}`); 400 con ejemplo "El día X no está configurado en esta plantilla".
- **rutinas-asignadas.routes.js**: GET `/` + query params (`instruidoId, activa, ia`); POST + 404 "Instruido no encontrado o no pertenece al entrenador"; PUT → `RutinaUpdateRequest`; clonar + 404s reales (Plantilla/Instruido); DELETE índice → `EjercicioEliminadoResponse`; 400 "El día X no está configurado en esta rutina".
- **registro-entrenamiento.routes.js**: GET `/` + query params (`instruidoId, rutinaId, estado, desde, hasta`); POST + 400 "instruidoId es requerido..." y 404; `/iniciar` + 403 "No tienes permiso para iniciar esta rutina" y 404s; series POST/GET/PUT/DELETE + 404 (Registro/Serie no encontrada) y 400 reales ("No se pueden modificar series de una sesión que no está en progreso", "El ejercicio no pertenece a la rutina asignada"); `finalizar` 400 "La sesión ya fue finalizada o cancelada"; `cancelar` 400 "Solo se pueden cancelar sesiones en progreso".
- **hitl.routes.js**: corregir ejemplo 503 → `{error: 'Servicio de IA no disponible'}`; añadir 504 (timeout) en sugerir rutina / validate / sugerir dieta; nota de errores Flask propagados (`Flask API error: <status>`).
- **dietas.routes.js**: PUT `/{id}` → `DietaUpdateRequest`; `/generar` + 502 y 504, 503 con mensaje real; PUT 400 "No se proporcionaron campos para actualizar" (ya está).
- **pagos.routes.js**: POST `/` 404 examples reales ("Plan no encontrado o no está disponible", "Método de pago no encontrado o no está disponible"); catálogo 403 "No estás asignado a este entrenador"; comprobante 403 "No tienes acceso a este comprobante"; verificar 409 "El pago ya fue procesado (estado actual: ...)" + 400 "El plan asociado al pago ya no existe" + 200 → `PagoResponse` completo; rechazar 409 mensaje real; PUT planes/métodos → `PlanPagoUpdateRequest`/`MetodoPagoUpdateRequest`; configuración PUT → `TasaCambioRequest`.
- **reportes.routes.js**: en los 3 endpoints de entrenador, 403/404 inline con mensajes reales ("No puede consultar reportes de otro instruido", "Instruido no encontrado").
- **dashboard.routes.js**: sin cambios de contenido (refs de error se actualizan por el pase mecánico).
- **metabolismo.routes.js**: schema corregido heredado de Fase 1; sin más cambios.

### Fase 3 — Verificación

- `cd backend-node && node -e "const s=require('./src/shared/swagger/swaggerConfig'); console.log(Object.keys(s.paths).length + ' paths, ' + Object.keys(s.components.schemas).length + ' schemas')"` — swagger-jsdoc lanza excepción si algún bloque JSDoc es inválido.
- Validar que todos los `$ref` apuntan a componentes existentes (grep + script Node que recorra el spec).
- Sin cambios de lógica de la API; solo documentación.

## No se hace (acordado)
- Ejemplos de error adicionales por endpoint (solo los de los componentes nombrados); ejemplos completos van en estatus OK.
- Cambiar comportamiento del código (gotchas como DELETE 204-sin-404 se documentan tal cual).
