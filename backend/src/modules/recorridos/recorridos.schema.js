const t = require('../../core/validation/tipos');
const { noAntesDe } = require('../../core/validation/reglas');

module.exports = {
    tabla: 'recorridos',
    nombre: 'el recorrido',
    campos: {
        conductor_id: t.id(),
        vehiculo_id: t.id(),
        fecha_inicio: t.fechaHora(),
        fecha_fin: t.fechaHora(),
        origen: t.texto({ max: 200 }),
        destino: t.texto({ max: 200 }),
        kilometros: t.decimal({ min: 0, max: 99999999.99 }),
        estado: t.opcion(['pendiente', 'en_curso', 'finalizado', 'cancelado']),
        observaciones: t.texto({ max: 65535 }),
    },
    obligatorios: ['conductor_id', 'vehiculo_id', 'fecha_inicio', 'origen', 'destino'],
    noNulos: ['kilometros', 'estado'],
    filtros: ['conductor_id', 'vehiculo_id', 'estado'],
    orden: 'fecha_inicio DESC, id DESC',
    relaciones: { conductor_id: 'el conductor', vehiculo_id: 'el vehículo' },
    reglas: [noAntesDe('fecha_fin', 'fecha_inicio')],
    // Borrar un recorrido borra en cascada sus ubicaciones GPS (ON DELETE CASCADE).
};
