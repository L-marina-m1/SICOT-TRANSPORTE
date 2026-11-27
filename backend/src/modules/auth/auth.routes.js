const { Router } = require('express');
const HttpError = require('../../core/errors/HttpError');
const t = require('../../core/validation/tipos');
const { requiereAuth } = require('../../middlewares/auth');
const authService = require('./auth.service');

const validarCorreo = t.correo();
const router = Router();

router.post('/login', async (req, res) => {
    const { correo, password } = req.body || {};
    const correoValido = validarCorreo(correo ?? '');

    if (correoValido.error || typeof password !== 'string' || password === '') {
        throw HttpError.badRequest('Ingresa un correo válido y tu contraseña');
    }

    res.json(await authService.iniciarSesion(correoValido.valor, password));
});

router.get('/me', requiereAuth, (req, res) => {
    res.json(req.usuario);
});

module.exports = router;
