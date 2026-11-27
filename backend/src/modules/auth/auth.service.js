const pool = require('../../config/database');
const HttpError = require('../../core/errors/HttpError');
const { verificarPassword, hashPassword } = require('../usuarios/password');
const { firmarToken } = require('./token');

const COLUMNAS_PUBLICAS = 'id, nombre, correo, rol, estado';
const MENSAJE_CREDENCIALES = 'Correo o contraseña incorrectos';

// Hash de relleno: si el correo no existe igual se gasta el mismo tiempo,
// así no se puede averiguar qué correos están registrados midiendo la respuesta.
const hashDeRelleno = hashPassword('relleno-para-tiempo-constante');

async function iniciarSesion(correo, password) {
    const [fila] = await pool.query(
        `SELECT ${COLUMNAS_PUBLICAS}, password_hash FROM usuarios WHERE correo = ?`,
        [correo]
    );

    const valida = await verificarPassword(password, fila ? fila.password_hash : await hashDeRelleno);
    if (!fila || !valida) throw HttpError.unauthorized(MENSAJE_CREDENCIALES);
    if (fila.estado !== 'activo') throw HttpError.forbidden('Tu cuenta está desactivada');

    const { password_hash: _omitido, ...usuario } = fila;
    return { token: firmarToken(usuario), usuario };
}

/** Usuario vigente (activo) por id, o null. Se consulta en cada petición para reflejar bajas y cambios de rol. */
async function buscarUsuarioActivo(id) {
    const [usuario] = await pool.query(
        `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ? AND estado = 'activo'`,
        [id]
    );
    return usuario || null;
}

module.exports = { iniciarSesion, buscarUsuarioActivo };
