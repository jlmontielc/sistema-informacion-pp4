const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('./auth.controller');
const { validar } = require('../../shared/middleware/validate');
const { autenticar } = require('../../shared/middleware/authenticate');
const { esquemaRegistro, esquemaInicioSesion, esquemaRefrescar, esquemaActualizarPerfil } = require('./auth.validation');

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

router.post('/register', limiteRegistro, validar(esquemaRegistro), ctrl.registrar);
router.post('/login', limiteInicioSesion, validar(esquemaInicioSesion), ctrl.iniciarSesion);
router.post('/refresh', limiteRefresh, validar(esquemaRefrescar), ctrl.refrescarToken);
router.post('/logout', autenticar, ctrl.cerrarSesion);
router.get('/me', autenticar, ctrl.obtenerPerfil);
router.put('/profile', autenticar, validar(esquemaActualizarPerfil), ctrl.actualizarPerfil);

module.exports = router;
