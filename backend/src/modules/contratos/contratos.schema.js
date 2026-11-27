const t = require('../../core/validation/tipos');
const { noAntesDe } = require('../../core/validation/reglas');

module.exports = {
    tabla: 'contratos',
    nombre: 'el contrato',
    campos: {
        conductor_id: t.id(),
        numero_contrato: t.texto({ max: 50, mayusculas: true }),
        tipo_contrato: t.texto({ max: 50 }),
        fecha_inicio: t.fecha(),
        fecha_fin: t.fecha(),
        salario: t.decimal({ min: 0, max: 99999999.99 }),
        descripcion: t.texto({ max: 65535 }),
        estado: t.opcion(['vigente', 'finalizado', 'cancelado']),
    },
    obligatorios: ['conductor_id', 'numero_contrato', 'fecha_inicio'],
    noNulos: ['estado'],
    filtros: ['conductor_id', 'estado'],
    orden: 'fecha_inicio DESC, id DESC',
    unicos: { numero_contrato: 'Ya existe un contrato con ese número' },
    relaciones: { conductor_id: 'el conductor' },
    reglas: [noAntesDe('fecha_fin', 'fecha_inicio')],
};
