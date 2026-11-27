const app = require('./app');
const { port } = require('./config/env');
const pool = require('./config/database');

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`SICOT API funcionando en http://localhost:${port}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${port} ya está en uso.`);
    } else {
        console.error('Error al iniciar el servidor:', error);
    }
    process.exit(1);
});

async function shutdown(signal) {
    console.log(`${signal} recibido, cerrando servidor...`);
    server.close();
    await pool.end().catch(() => {});
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
