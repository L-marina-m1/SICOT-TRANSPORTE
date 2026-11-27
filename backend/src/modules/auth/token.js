const jwt = require('jsonwebtoken');
const { jwt: config } = require('../../config/env');

const ALGORITMO = 'HS256';

function firmarToken(usuario) {
    return jwt.sign({ rol: usuario.rol }, config.secret, {
        subject: String(usuario.id),
        expiresIn: config.expiraEn,
        algorithm: ALGORITMO,
    });
}

/** Devuelve el id de usuario del token, o null si es inválido o expiró. */
function leerToken(token) {
    try {
        const payload = jwt.verify(token, config.secret, { algorithms: [ALGORITMO] });
        const id = Number(payload.sub);
        return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
        return null;
    }
}

module.exports = { firmarToken, leerToken };
