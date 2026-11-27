// Express 5 envía aquí automáticamente los errores de los handlers async.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    // JSON mal formado en el body (lo lanza express.json())
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' });
    }

    const status = err.status || err.statusCode || 500;

    if (status >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, err);
    }

    const respuesta = {
        mensaje: status >= 500 ? 'Error interno del servidor' : err.message,
    };
    if (err.detalles) respuesta.errores = err.detalles;

    res.status(status).json(respuesta);
}

module.exports = errorHandler;
