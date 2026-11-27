const t = require('../../core/validation/tipos');

module.exports = {
    tabla: 'ubicaciones_gps',
    nombre: 'la ubicación GPS',
    campos: {
        recorrido_id: t.id(),
        latitud: t.decimal({ min: -90, max: 90 }),
        longitud: t.decimal({ min: -180, max: 180 }),
        velocidad: t.decimal({ min: 0, max: 99999.99 }),
        fecha_hora: t.fechaHora(),
    },
    obligatorios: ['recorrido_id', 'latitud', 'longitud', 'fecha_hora'],
    noNulos: ['velocidad'],
    filtros: ['recorrido_id'],
    orden: 'fecha_hora DESC, id DESC',
    relaciones: { recorrido_id: 'el recorrido' },
};
