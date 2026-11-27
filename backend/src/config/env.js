require('dotenv').config({ quiet: true });

const REQUIRED_VARS = ['DB_HOST', 'DB_USER', 'DB_NAME'];

const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
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
});
