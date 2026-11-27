class HttpError extends Error {
    constructor(status, message, detalles) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.detalles = detalles;
    }

    static badRequest(message, detalles) {
        return new HttpError(400, message, detalles);
    }

    static unauthorized(message = 'Debes iniciar sesión') {
        return new HttpError(401, message);
    }

    static forbidden(message = 'No tienes permiso para realizar esta acción') {
        return new HttpError(403, message);
    }

    static notFound(message) {
        return new HttpError(404, message);
    }

    static conflict(message) {
        return new HttpError(409, message);
    }
}

module.exports = HttpError;
