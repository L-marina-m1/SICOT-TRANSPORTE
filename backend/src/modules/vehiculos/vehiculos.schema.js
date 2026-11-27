const t = require('../../core/validation/tipos');

module.exports = {
    tabla: 'vehiculos',
    nombre: 'el vehículo',
    campos: {
        placa: t.texto({ max: 15, mayusculas: true }),
        marca: t.texto({ max: 60 }),
        modelo: t.texto({ max: 60 }),
        anio: t.entero({ min: 1901, max: 2155 }), // rango del tipo YEAR
        color: t.texto({ max: 30 }),
        tipo: t.texto({ max: 50 }),
        capacidad: t.entero({ min: 0 }),
        kilometraje: t.decimal({ min: 0, max: 99999999.99 }),
        estado: t.opcion(['disponible', 'en_ruta', 'mantenimiento', 'inactivo']),
    },
    obligatorios: ['placa'],
    noNulos: ['kilometraje', 'estado'],
    filtros: ['estado', 'tipo', 'placa'],
    unicos: { placa: 'Ya existe un vehículo con esa placa' },
    mensajeDependientes:
        'No se puede eliminar el vehículo: tiene recorridos registrados. Cambia su estado a inactivo.',
};
