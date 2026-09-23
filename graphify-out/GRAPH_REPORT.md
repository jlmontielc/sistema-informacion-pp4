# Graph Report - sistema-informacion-pp4  (2026-09-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1708 nodes · 3574 edges · 107 communities (87 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 248 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4f0c1dee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- PlanesPage.jsx
- ClienteDetalle.jsx
- frontend/package.json
- Loading.jsx
- GestionRutinasView.jsx
- registro-entrenamiento.service.js
- RecommenderEngine
- plantillas.controller.js
- schema.sql
- guardian.py
- pagos.service.js
- auth.service.js
- reportes.test.js
- data_fetcher.py
- hitl.routes.js
- instruido.model.js
- instruido.routes.js
- reportes.service.js
- seed-ejercicios.js
- auth.routes.js
- app.py
- test_guardian.py
- rutinas-asignadas.controller.js
- Button.jsx
- evaluar_ejercicio_por_lesiones
- connection.js
- pagos.controller.js
- auth.service.test.js
- entrenamiento.model.js
- hitl.service.js
- rutinas-asignadas.service.js
- HitlEngine
- app.js
- plantillas.service.js
- reportes.routes.js
- ejercicios.service.js
- perfil-medico.service.js
- blacklist.js
- associations.js
- feedback_learner.py
- bash
- metabolismo.model.js
- registro-entrenamiento.routes.js
- rutinas-asignadas.routes.js
- pagos.routes.js
- auth.controller.js
- dietas.controller.js
- dietas.service.js
- plantillas.routes.js
- instruido.service.js
- flask-client.js
- hitl_routes.py
- dependencies
- authenticate.js
- dietas.routes.js
- normalizarEjercicios
- server.js
- cache.js
- backend-node/package.json
- manifest.json
- dashboard.controller.js
- cacheKeys.js
- DietasPage.jsx
- EjercicioCatalogoModal.jsx
- instruido.controller.js
- metabolismo.routes.js
- CalculadoraMetabolica.jsx
- .validar_ejercicio
- load_rules.py
- crypto.js
- dietas.model.js
- ejercicios.controller.js
- pagos.cache.test.js
- hitl.service.validate.test.js
- auth.invalidacion.test.js
- pagos.invalidacion.test.js
- perfil-medico.service.test.js
- scripts
- hitl.controller.js
- reportes.controller.js
- fetch_cliente_completo
- perfil-medico.controller.js
- swaggerConfig.js
- limpiar
- jsonwebtoken
- test_no_loguea_datos_medicos
- devDependencies
- _obtenerConfiguracion
- idx_feedback_tipo
- 003_add_pesos_modelo_ia.sql
- 20260821_crear_calculos_metabolicos.sql
- pagos
- planes_pago

## God Nodes (most connected - your core abstractions)
1. `react` - 44 edges
2. `useAuth()` - 40 edges
3. `RecommenderEngine` - 38 edges
4. `GuardianSeguridad` - 34 edges
5. `Loading()` - 29 edges
6. `Button()` - 26 edges
7. `Card()` - 24 edges
8. `{ Sequelize }` - 24 edges
9. `EmptyState()` - 23 edges
10. `evaluar_ejercicio_por_lesiones()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `_ajustar_nivel_por_intensidad()` --uses--> `NivelRiesgo`  [INFERRED]
  backend-flask/models/rules/condition_rules.py → backend-flask/config/constants.py
- `evaluar_ejercicio_por_condiciones()` --uses--> `NivelRiesgo`  [INFERRED]
  backend-flask/models/rules/condition_rules.py → backend-flask/config/constants.py
- `validar_carga_ejercicio()` --uses--> `NivelRiesgo`  [INFERRED]
  backend-flask/models/rules/load_rules.py → backend-flask/config/constants.py
- `GuardianSeguridad` --uses--> `NivelRiesgo`  [INFERRED]
  backend-flask/services/guardian.py → backend-flask/config/constants.py
- `HitlEngine` --uses--> `GuardianSeguridad`  [INFERRED]
  backend-flask/services/hitl_engine.py → backend-flask/services/guardian.py

## Import Cycles
- None detected.

## Communities (107 total, 20 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.05
Nodes (48): CompleteProfilePage, Dashboard, EntrenamientoPage, MetabolismoPage, NotFound, OfflinePage, ProtectedRoute(), PublicRoute() (+40 more)

### Community 1 - "PlanesPage.jsx"
Cohesion: 0.08
Nodes (41): LoginPage, MiPlanPage, PlanesPage, Input(), ComprobanteModal(), DatosMetodo(), ETIQUETAS, EstadoBadge() (+33 more)

### Community 2 - "ClienteDetalle.jsx"
Cohesion: 0.07
Nodes (31): ClienteDetalle, PerfilPage, CAMPOS_MEDICOS, ClienteDetalle(), nivelLabels, sexoLabels, experienciaLabels, ListaInstruidos() (+23 more)

### Community 3 - "frontend/package.json"
Cohesion: 0.05
Nodes (40): browserslist, development, production, dependencies, axios, react, react-dom, react-router-dom (+32 more)

### Community 4 - "Loading.jsx"
Cohesion: 0.10
Nodes (24): ClientesPage, Card(), EmptyState(), Loading(), nivelLabels, PerfilEntrenador(), redesIconos, FiltroTiempo() (+16 more)

### Community 5 - "GestionRutinasView.jsx"
Cohesion: 0.10
Nodes (33): Modal(), modalStyles, SIZES, AsignarRutinaModal(), DIAS, DiaSelector(), obtenerAbbrDia(), obtenerDiaActual() (+25 more)

### Community 6 - "registro-entrenamiento.service.js"
Cohesion: 0.07
Nodes (35): cancelar(), crear(), crearSerie(), editarSerie(), eliminar(), eliminarSerie(), finalizar(), iniciar() (+27 more)

### Community 7 - "RecommenderEngine"
Cohesion: 0.09
Nodes (20): GuardianSeguridad, Extrae la lista de dias de la semana de una plantilla. Soporta listas simples y…, RecommenderEngine, test_clasificador_advertencia_baja_confianza(), test_clasificador_compatibilidad_sin_perfil_medico(), test_clasificador_descarta_plantilla_con_ejerciciosBloqueados(), test_clasificador_descarta_por_ejercicio_critical_en_plantilla(), test_clasificador_descarta_por_lesion_critical() (+12 more)

### Community 8 - "plantillas.controller.js"
Cohesion: 0.09
Nodes (24): actualizar(), agregarEjercicioADia(), cache, cacheKeys, crear(), editarEjercicioEnDia(), eliminar(), eliminarEjercicioDeDia() (+16 more)

### Community 9 - "schema.sql"
Cohesion: 0.15
Nodes (27): feedback_hitl, vw_feedback_patterns, vw_hitl_efficiency, configuracion_pagos, metodos_pago, pagos, planes_pago, idx_rutinas_asignadas_eliminado (+19 more)

### Community 10 - "guardian.py"
Cohesion: 0.11
Nodes (28): _ajustar_nivel_por_intensidad(), detectar_condicion(), evaluar_ejercicio_por_condiciones(), _nombre_coincide(), Detecta las condiciones medicas presentes en el texto. Normaliza acentos y…, Comprueba si el nombre del ejercicio coincide con una regla., _nombre_coincide(), Comprueba si el nombre normalizado coincide con el de una regla. (+20 more)

### Community 11 - "pagos.service.js"
Cohesion: 0.11
Nodes (26): listarPlanes(), actualizarMetodo(), actualizarPlan(), cache, cacheKeys, diasEntre(), eliminarMetodo(), eliminarPlan() (+18 more)

### Community 12 - "auth.service.js"
Cohesion: 0.11
Nodes (25): actualizarPerfil(), bcrypt, blacklist, buscarUsuario(), cache, cacheKeys, { calcularPerfilMedicoCompleto }, { Certificacion } (+17 more)

### Community 13 - "reportes.test.js"
Cohesion: 0.08
Nodes (18): RegistroEntrenamiento, { DataTypes }, { sequelize }, SerieEjecutada, { Instruido }, { RegistroEntrenamiento, RutinaAsignada, Ejercicio }, { SerieEjecutada }, service (+10 more)

### Community 14 - "data_fetcher.py"
Cohesion: 0.15
Nodes (20): Utilidades para conversión de casing entre snake_case y camelCase. Este módulo…, fetch_ejercicio_por_id(), fetch_historial_entrenamiento(), fetch_perfil_medico(), fetch_plantillas_disponibles(), fetch_plantillas_por_ids(), fetch_rendimiento_reciente(), fetch_rutinas_activas() (+12 more)

### Community 15 - "hitl.routes.js"
Cohesion: 0.10
Nodes (19): feedbackService, esquemaFeedbackHitl, Joi, { autenticar }, { autorizar }, ctrl, { esquemaClienteIdParam, esquemaIdParam, esquemaValidateParams, esquemaDecisionRutina }, { esquemaFeedbackHitl } (+11 more)

### Community 16 - "instruido.model.js"
Cohesion: 0.09
Nodes (17): { HitlFeedback }, { Instruido }, { DataTypes }, Instruido, { sequelize }, authService, cache, { Entrenador } (+9 more)

### Community 17 - "instruido.routes.js"
Cohesion: 0.11
Nodes (21): { autenticar }, { autorizar }, ctrl, { esquemaCrear, esquemaActualizar, esquemaActualizarPropio }, { esquemaPerfilMedico }, { Router }, rutasPerfilMedico, { validar } (+13 more)

### Community 18 - "reportes.service.js"
Cohesion: 0.17
Nodes (24): cache, cacheKeys, calcularEvolucionGrupo(), calcularEvolucionSemanal(), calcularMetricasGrupo(), calcularPromedioHistorico(), calcularPromedioOtrosInstruidos(), calcularRangoFechas() (+16 more)

### Community 19 - "seed-ejercicios.js"
Cohesion: 0.09
Nodes (21): fs, MIGRATION_PATH, path, { sequelize }, cache, cacheKeys, CATEGORIA_MAP, descargarJSON() (+13 more)

### Community 20 - "auth.routes.js"
Cohesion: 0.11
Nodes (22): { autenticar }, { autorizar }, ctrl, { esquemaRegistro, esquemaRegistroInstruido, esquemaInicioSesion, esquemaRefrescar, esquemaActualizarPerfil, esquemaCertificacion }, limiteInicioSesion, limiteRefresh, limiteRegistro, rateLimit (+14 more)

### Community 21 - "app.py"
Cohesion: 0.11
Nodes (19): ErrorAutenticacion, registrar_manejador_auth(), wrapper(), health(), health_detailed(), manejar_400(), manejar_404(), manejar_405() (+11 more)

### Community 22 - "test_guardian.py"
Cohesion: 0.14
Nodes (20): detectar_grupo_lesion(), Detecta los grupos anatomicos de lesion presentes en el texto. Normaliza el…, estimar_1rm_repeticiones(), calcular_macros(), guardian_dieta(), normalizar_proposito(), test_detectar_grupo_lesion(), test_estimar_1rm() (+12 more)

### Community 23 - "rutinas-asignadas.controller.js"
Cohesion: 0.12
Nodes (18): actualizar(), agregarEjercicioADia(), cache, cacheKeys, clonarDesdePlantilla(), crear(), editarEjercicioEnDia(), eliminar() (+10 more)

### Community 24 - "Button.jsx"
Cohesion: 0.15
Nodes (16): LandingPage, Button(), Carousel(), placeholderImages, Icon(), icons, NIVEL_LABELS, OBJETIVO_LABELS (+8 more)

### Community 25 - "evaluar_ejercicio_por_lesiones"
Cohesion: 0.18
Nodes (20): AccionHitl, NivelRiesgo, _alerta_existente_para_zona(), _equipo_asociado(), evaluar_ejercicio_por_lesiones(), _grupo_muscular_asociado(), _nivel_para_ejercicio_en_grupo(), _orden_riesgo() (+12 more)

### Community 26 - "connection.js"
Cohesion: 0.13
Nodes (15): { DataTypes }, { sequelize }, { DataTypes }, HitlFeedback, { sequelize }, { DataTypes }, PerfilMedico, { sequelize } (+7 more)

### Community 27 - "pagos.controller.js"
Cohesion: 0.11
Nodes (20): actualizarMetodo(), actualizarPlan(), cache, cacheKeys, crearMetodo(), crearPlan(), eliminarMetodo(), eliminarPlan() (+12 more)

### Community 28 - "auth.service.test.js"
Cohesion: 0.12
Nodes (12): { DataTypes }, Entrenador, { sequelize }, bcrypt, config, { Entrenador }, authService, bcrypt (+4 more)

### Community 29 - "entrenamiento.model.js"
Cohesion: 0.14
Nodes (16): { DataTypes }, PlantillaEntrenamiento, RutinaAsignada, { sequelize }, main(), { PlantillaEntrenamiento, RutinaAsignada }, procesarRegistros(), { sequelize } (+8 more)

### Community 30 - "hitl.service.js"
Cohesion: 0.15
Nodes (18): { CalculoMetabolico }, CAMPOS_EDITABLES_RUTINA, descifrarCampos(), { HitlFeedback }, {
  httpRequest,
  descifrarSeguro,
  parsearCampoJson,
  limpiarArrayMedico,
  CAMPOS_SENSIBLES,
}, { Instruido }, { Op }, { PerfilMedico } (+10 more)

### Community 31 - "rutinas-asignadas.service.js"
Cohesion: 0.15
Nodes (18): obtenerResumenSemanal(), actualizar(), agregarEjercicioADia(), cache, cacheKeys, clonarDesdePlantilla(), editarEjercicioEnDia(), eliminarEjercicioDeDia() (+10 more)

### Community 32 - "HitlEngine"
Cohesion: 0.16
Nodes (10): keys_to_camel_case(), Convierte una cadena snake_case a camelCase., Convierte recursivamente las claves de un dict/lista a camelCase., to_camel_case(), HitlEngine, Normaliza un perfil medico recibido desde Node para la validacion. Soporta…, Convierte diasSemana a una lista ordenada de enteros 1-7. Si no se recibe…, test_poolSeguro_vacio_raises_error() (+2 more)

### Community 33 - "app.js"
Cohesion: 0.11
Nodes (17): app, authRoutes, cors, dashboardRoutes, dietasRoutes, entrenamientoRoutes, express, hitlRoutes (+9 more)

### Community 34 - "plantillas.service.js"
Cohesion: 0.16
Nodes (18): normalizarPayloadRutina(), actualizar(), agregarEjercicioADia(), cache, cacheKeys, crear(), editarEjercicioEnDia(), eliminar() (+10 more)

### Community 35 - "reportes.routes.js"
Cohesion: 0.12
Nodes (15): { autorizar }, ctrl, { Router }, { autenticar }, { autorizar }, ctrl, reportesValidation, { Router } (+7 more)

### Community 36 - "ejercicios.service.js"
Cohesion: 0.12
Nodes (11): cache, cacheKeys, { Ejercicio }, { Op }, Ejercicio, cache, { Ejercicio }, ejerciciosService (+3 more)

### Community 37 - "perfil-medico.service.js"
Cohesion: 0.18
Nodes (18): obtenerMiPerfilMedico(), obtenerPorInstruido(), calcularPerfilMedicoCompleto(), CAMPOS_SENSIBLES, { cifrar, descifrar }, construirPerfilDescifradoRespuesta(), descifrarCampos(), descifrarSeguro() (+10 more)

### Community 38 - "blacklist.js"
Cohesion: 0.18
Nodes (15): cerrarSesion(), config, crearCliente(), estaConectado(), obtenerCliente(), Redis, agregar(), cacheKeys (+7 more)

### Community 39 - "associations.js"
Cohesion: 0.14
Nodes (16): Certificacion, ConfiguracionPago, { DataTypes }, MetodoPago, Pago, PlanPago, { sequelize }, { CalculoMetabolico } (+8 more)

### Community 40 - "feedback_learner.py"
Cohesion: 0.23
Nodes (13): fetch_calculos_metabolicos(), execute_insert(), execute_one(), get_connection(), get_pool(), calcular_nuevos_pesos(), cargar_pesos_persistidos(), ensure_tabla_pesos() (+5 more)

### Community 41 - "bash"
Cohesion: 0.12
Nodes (16): docker *, docker-compose *, git *, gunicorn *, npm *, python *, X-Goog-Api-Key, mcp (+8 more)

### Community 42 - "metabolismo.model.js"
Cohesion: 0.17
Nodes (12): generarDieta(), verificarPertenencia(), calcular(), metabolismoService, CalculoMetabolico, { DataTypes }, { sequelize }, calcular() (+4 more)

### Community 43 - "registro-entrenamiento.routes.js"
Cohesion: 0.19
Nodes (14): ctrl, {
  esquemaCrearRegistro,
  esquemaIniciar,
  esquemaSerie,
  esquemaEditarSerie,
  esquemaFinalizar,
  esquemaCancelar,
  esquemaIdParams,
  esquemaSerieIdParams,
}, { Router }, { validar }, esquemaCancelar, esquemaCrearRegistro, esquemaEditarSerie, esquemaFinalizar (+6 more)

### Community 44 - "rutinas-asignadas.routes.js"
Cohesion: 0.17
Nodes (14): { autorizar }, ctrl, {
  esquemaCrear,
  esquemaActualizar,
  esquemaAgregarEjercicio,
  esquemaEditarEjercicio,
  esquemaReordenar,
  esquemaClonar,
}, { Router }, { validar }, diasSemanaMap, ejercicioRutina, esquemaActualizar (+6 more)

### Community 45 - "pagos.routes.js"
Cohesion: 0.18
Nodes (14): { autenticar }, { autorizar }, ctrl, {
  esquemaCrearPlan,
  esquemaActualizarPlan,
  esquemaCrearMetodo,
  esquemaActualizarMetodo,
  esquemaActualizarTasa,
  esquemaCrearPago,
  esquemaRechazarPago,
}, { Router }, { validar }, esquemaActualizarMetodo, esquemaActualizarPlan (+6 more)

### Community 46 - "auth.controller.js"
Cohesion: 0.14
Nodes (14): actualizarPerfil(), authService, cache, cacheKeys, cerrarSesion(), crearCertificacion(), eliminarCertificacion(), iniciarSesion() (+6 more)

### Community 47 - "dietas.controller.js"
Cohesion: 0.18
Nodes (12): cache, cacheKeys, create(), decidir(), dietasService, generar(), invalidarCacheDieta(), remove() (+4 more)

### Community 48 - "dietas.service.js"
Cohesion: 0.13
Nodes (13): cache, cacheKeys, { calcularTMB, calcularGCT }, { CalculoMetabolico }, CAMPOS_EDITABLES, CAMPOS_SENSIBLES_PERFIL, { Dieta }, { HitlFeedback } (+5 more)

### Community 49 - "plantillas.routes.js"
Cohesion: 0.18
Nodes (13): { autorizar }, ctrl, {
  esquemaCrear,
  esquemaActualizar,
  esquemaAgregarEjercicio,
  esquemaEditarEjercicio,
  esquemaReordenar,
}, { Router }, { validar }, diasSemanaMap, ejercicioRutina, esquemaActualizar (+5 more)

### Community 50 - "instruido.service.js"
Cohesion: 0.16
Nodes (11): obtenerMiPerfil(), actualizar(), actualizarPropio(), ATRIBUTOS_SEGUROS, bcrypt, cache, cacheKeys, crear() (+3 more)

### Community 51 - "flask-client.js"
Cohesion: 0.15
Nodes (13): CAMPOS_SENSIBLES, config, { descifrar }, http, https, jwt, limpiarArrayMedico(), normalizarTextoLimpieza() (+5 more)

### Community 52 - "hitl_routes.py"
Cohesion: 0.34
Nodes (13): require_jwt(), estadisticas(), historial(), predict_dieta(), predict_routine(), route, recalibrar_pesos(), registrar_feedback() (+5 more)

### Community 53 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, bcryptjs, cors, dotenv, express, express-rate-limit, ioredis, joi (+6 more)

### Community 54 - "authenticate.js"
Cohesion: 0.18
Nodes (11): { autenticar }, ctrl, { Router }, { autenticar }, { Router }, autenticar(), blacklist, config (+3 more)

### Community 55 - "dietas.routes.js"
Cohesion: 0.20
Nodes (12): { autenticar }, { autorizar }, ctrl, {
  esquemaCrearDieta,
  esquemaActualizarDieta,
  esquemaIdParam,
  esquemaGenerarDieta,
  esquemaDecisionDieta,
}, { Router }, { validar }, esquemaActualizarDieta, esquemaCrearDieta (+4 more)

### Community 56 - "normalizarEjercicios"
Cohesion: 0.24
Nodes (12): { Ejercicio }, normalizarDiaSemana(), normalizarDiasSemana(), normalizarEjercicio(), normalizarEjercicios(), _obtenerPorDia(), _obtenerPorDia(), _obtenerResumenSemanal() (+4 more)

### Community 57 - "server.js"
Cohesion: 0.18
Nodes (11): obtenerTodos(), app, { conectarRedis }, config, ejerciciosService, sembrarAdmin, { sequelize, connectDB }, start() (+3 more)

### Community 58 - "cache.js"
Cohesion: 0.14
Nodes (7): cache, crypto, metricas, { obtenerCliente, estaConectado }, cache, reportesService, cache

### Community 59 - "backend-node/package.json"
Cohesion: 0.15
Nodes (12): description, main, name, version, cors, dotenv, express-rate-limit, jest (+4 more)

### Community 60 - "manifest.json"
Cohesion: 0.15
Nodes (12): background_color, categories, description, display, icons, lang, name, orientation (+4 more)

### Community 61 - "dashboard.controller.js"
Cohesion: 0.24
Nodes (11): cache, cacheKeys, { Entrenador }, { Instruido }, { Op }, primerDiaMes(), { sequelize }, stats() (+3 more)

### Community 62 - "cacheKeys.js"
Cohesion: 0.18
Nodes (11): auth, blacklist(), dashboard, dietas, ejercicios, instruidos, pagos, plantillas (+3 more)

### Community 63 - "DietasPage.jsx"
Cohesion: 0.20
Nodes (8): DietasPage, celdaEstilo, DietasPage(), formatearFecha(), PROPUESTOS, tablaEstilo, TABS, dietasApi

### Community 64 - "EjercicioCatalogoModal.jsx"
Cohesion: 0.24
Nodes (11): compiledRegexes, EjercicioCatalogoModal(), GRUPO_EMOJI, GRUPOS_MUSCULARES, NAME_MAP_ENTRIES, preComputeTranslations(), TARGET_MAP, traducirNombre() (+3 more)

### Community 65 - "instruido.controller.js"
Cohesion: 0.22
Nodes (10): actualizar(), actualizarMiPerfil(), cache, cacheKeys, crear(), eliminar(), instruidoService, obtenerPorId() (+2 more)

### Community 66 - "metabolismo.routes.js"
Cohesion: 0.22
Nodes (8): { autenticar }, ctrl, { esquemaCalculoMetabolico }, { Router }, { validar }, esquemaCalculoMetabolico, Joi, validar()

### Community 67 - "CalculadoraMetabolica.jsx"
Cohesion: 0.27
Nodes (7): CalculadoraMetabolica(), NIVELES_ACTIVIDAD, SEXOS, ESTILO_RESULTADO, NIVELES_ACTIVIDAD_LABELS, ResultadoMetabolico(), metabolismoApi

### Community 68 - ".validar_ejercicio"
Cohesion: 0.27
Nodes (3): obtener_precauciones_cliente(), True si no hay antecedentes medicos, False si hay alguno, None si falta perfil.…, Normaliza una lista de strings medicos y descarta valores vacios o negativos.

### Community 69 - "load_rules.py"
Cohesion: 0.29
Nodes (8): calcular_carga_maxima_recomendada(), calcular_imc(), _factor_por_edad(), _factor_por_nivel(), validar_carga_ejercicio(), test_calcular_imc(), test_carga_maxima_recomendada(), test_validar_carga_ejercicio()

### Community 70 - "crypto.js"
Cohesion: 0.20
Nodes (8): actualizarMiPerfilMedico(), cifrarCampos(), crearOActualizar(), cifrar(), config, crypto, ref_crypto, crypto

### Community 71 - "dietas.model.js"
Cohesion: 0.28
Nodes (7): { DataTypes }, Dieta, { sequelize }, persistDietaFromPrediction(), cache, { Dieta }, dietasService

### Community 72 - "ejercicios.controller.js"
Cohesion: 0.25
Nodes (8): actualizar(), cache, cacheKeys, crear(), ejerciciosService, eliminar(), obtenerPorId(), obtenerTodos()

### Community 73 - "pagos.cache.test.js"
Cohesion: 0.22
Nodes (8): backend_node_src_shared_database_associations_configuracionpago, { Instruido }, backend_node_src_shared_database_associations_metodopago, backend_node_src_shared_database_associations_pago, backend_node_src_shared_database_associations_planpago, cache, pagosService, {
  PlanPago, MetodoPago, ConfiguracionPago, Pago, Instruido,
}

### Community 74 - "hitl.service.validate.test.js"
Cohesion: 0.22
Nodes (4): hitlService, { httpRequest }, { Instruido }, perfilMedicoService

### Community 75 - "auth.invalidacion.test.js"
Cohesion: 0.25
Nodes (5): authController, authService, cache, cacheKeys, next

### Community 76 - "pagos.invalidacion.test.js"
Cohesion: 0.25
Nodes (4): cache, next, pagosController, pagosService

### Community 77 - "perfil-medico.service.test.js"
Cohesion: 0.25
Nodes (4): { cifrar, descifrar }, { Instruido }, { PerfilMedico }, perfilMedicoService

### Community 78 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, dev, seed, seed:ejercicios, start, test

### Community 79 - "hitl.controller.js"
Cohesion: 0.33
Nodes (5): decidirRutina(), hitlService, sugerirDieta(), sugerirRutina(), validarEjercicio()

### Community 82 - "fetch_cliente_completo"
Cohesion: 0.40
Nodes (5): fetch_cliente_completo(), _filtrar_dias_validos(), _parsear_dias_semana(), Convierte el valor almacenado de dias_semana a una lista de enteros 1-7.…, Filtra y devuelve enteros unicos entre 1 y 7.

### Community 83 - "perfil-medico.controller.js"
Cohesion: 0.40
Nodes (4): cache, cacheKeys, crearOActualizar(), perfilMedicoService

### Community 84 - "swaggerConfig.js"
Cohesion: 0.40
Nodes (4): options, swaggerJsdoc, swaggerSpec, swagger-jsdoc

### Community 85 - "limpiar"
Cohesion: 0.50
Nodes (4): limpiar(), _listarMisPagos(), _listarPagosEntrenador(), rechazarPago()

### Community 86 - "jsonwebtoken"
Cohesion: 0.50
Nodes (3): blacklist, jwt, jsonwebtoken

### Community 88 - "devDependencies"
Cohesion: 0.67
Nodes (3): devDependencies, jest, nodemon

### Community 89 - "_obtenerConfiguracion"
Cohesion: 0.67
Nodes (3): actualizarConfiguracion(), actualizarTasa(), _obtenerConfiguracion()

## Knowledge Gaps
- **568 isolated node(s):** `iconMap`, `AuthContext`, `ThemeContext`, `UIContext`, `CAMPOS_MEDICOS` (+563 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 745 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `error()` connect `pagos.service.js` to `ClienteDetalle.jsx`, `limpiar`?**
  _High betweenness centrality (0.249) - this node is a cross-community bridge._
- **Why does `sequelize` connect `connection.js` to `plantillas.service.js`, `ejercicios.service.js`, `registro-entrenamiento.service.js`, `dietas.model.js`, `associations.js`, `metabolismo.model.js`, `pagos.service.js`, `reportes.test.js`, `instruido.model.js`, `entrenamiento.model.js`, `reportes.service.js`, `backend-node/package.json`, `auth.service.test.js`, `dashboard.controller.js`, `hitl.service.js`, `rutinas-asignadas.service.js`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `{ Sequelize }` connect `connection.js` to `dietas.model.js`, `associations.js`, `metabolismo.model.js`, `pagos.service.js`, `reportes.test.js`, `instruido.model.js`, `reportes.service.js`, `dashboard.controller.js`, `seed-ejercicios.js`, `normalizarEjercicios`, `server.js`, `auth.service.test.js`, `entrenamiento.model.js`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `RecommenderEngine` (e.g. with `HitlEngine` and `GuardianSeguridad`) actually correct?**
  _`RecommenderEngine` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `GuardianSeguridad` (e.g. with `NivelRiesgo` and `HitlEngine`) actually correct?**
  _`GuardianSeguridad` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `iconMap`, `AuthContext`, `ThemeContext` to the rest of the system?**
  _568 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05441400304414003 - nodes in this community are weakly interconnected._