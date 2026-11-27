const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const LONGITUD_CLAVE = 64;

/** Devuelve 'scrypt$<salt>$<hash>' listo para guardar en password_hash. */
async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await scrypt(password, salt, LONGITUD_CLAVE);
    return `scrypt$${salt}$${hash.toString('hex')}`;
}

/** Para el futuro login: compara en tiempo constante. */
async function verificarPassword(password, almacenado) {
    const [algoritmo, salt, hashHex] = String(almacenado).split('$');
    if (algoritmo !== 'scrypt' || !salt || !hashHex) return false;

    const esperado = Buffer.from(hashHex, 'hex');
    const calculado = await scrypt(password, salt, esperado.length);
    return crypto.timingSafeEqual(esperado, calculado);
}

module.exports = { hashPassword, verificarPassword };
