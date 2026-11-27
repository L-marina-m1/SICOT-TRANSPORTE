require('dotenv').config({ quiet: true });

const REQUIRED_VARS = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const LONGITUD_MINIMA_SECRETO = 32;

const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
}
if (process.env.JWT_SECRET.length < LONGITUD_MINIMA_SECRETO) {
    throw new Error(`JWT_SECRET debe tener al menos ${LONGITUD_MINIMA_SECRETO} caracteres`);
}

module.exports = Object.freeze({
    port: Number(process.env.PORT) || 3000,
    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiraEn: process.env.JWT_EXPIRA_EN || '8h',
    },
    corsOrigen: process.env.CORS_ORIGEN || 'http://localhost:5173',
});
