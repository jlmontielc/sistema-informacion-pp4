const { Router } = require('express');
const ctrl = require('./auth.controller');
const { validar } = require('../../shared/middleware/validate');
const { autenticar } = require('../../shared/middleware/authenticate');
const { autorizar } = require('../../shared/middleware/autorizar');
const { esquemaRegistro, esquemaInicioSesion } = require('./auth.validation');

const router = Router();

router.post('/register', validar(esquemaRegistro), ctrl.registrar);
router.post('/login', validar(esquemaInicioSesion), ctrl.iniciarSesion);
router.get('/me', autenticar, ctrl.obtenerPerfil);
router.put('/profile', autenticar, ctrl.actualizarPerfil);

module.exports = router;
