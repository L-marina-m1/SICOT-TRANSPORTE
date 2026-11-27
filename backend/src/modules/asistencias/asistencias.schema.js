const t = require('../../core/validation/tipos');
const { noAntesDe } = require('../../core/validation/reglas');

module.exports = {
    tabla: 'asistencias',
    nombre: 'la asistencia',
    campos: {
        conductor_id: t.id(),
        fecha: t.fecha(),
        hora_entrada: t.hora(),
        hora_salida: t.hora(),
        estado: t.opcion(['presente', 'tardanza', 'falta', 'justificado']),
        observaciones: t.texto({ max: 65535 }),
    },
    obligatorios: ['conductor_id', 'fecha'],
    noNulos: ['estado'],
    filtros: ['conductor_id', 'fecha', 'estado'],
    orden: 'fecha DESC, id DESC',
    unicos: { uk_asistencia_dia: 'El conductor ya tiene una asistencia registrada en esa fecha' },
    relaciones: { conductor_id: 'el conductor' },
    reglas: [noAntesDe('hora_salida', 'hora_entrada')],
};
