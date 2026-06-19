const { Router } = require('express');
const ctrl = require('./auth.controller');
const { validate } = require('../../shared/middleware/validate');
const { authenticate } = require('../../shared/middleware/authenticate');
const { registerSchema, loginSchema, updateProfileSchema } = require('./auth.validation');

const router = Router();

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.get('/me', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), ctrl.updateProfile);

module.exports = router;
