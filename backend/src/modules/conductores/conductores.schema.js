const t = require('../../core/validation/tipos');

module.exports = {
    tabla: 'conductores',
    nombre: 'el conductor',
    campos: {
        usuario_id: t.id(),
        dni: t.texto({ max: 15 }),
        nombres: t.texto({ max: 100 }),
        apellidos: t.texto({ max: 100 }),
        telefono: t.texto({ max: 20 }),
        direccion: t.texto({ max: 200 }),
        licencia_conducir: t.texto({ max: 30, mayusculas: true }),
        categoria_licencia: t.texto({ max: 20, mayusculas: true }),
        fecha_vencimiento_licencia: t.fecha(),
        estado: t.opcion(['activo', 'inactivo']),
    },
    obligatorios: ['dni', 'nombres', 'apellidos', 'licencia_conducir'],
    noNulos: ['estado'],
    filtros: ['estado', 'dni', 'usuario_id'],
    orden: 'apellidos, nombres',
    unicos: {
        dni: 'Ya existe un conductor con ese DNI',
        licencia_conducir: 'Ya existe un conductor con esa licencia de conducir',
        usuario_id: 'Ese usuario ya está asignado a otro conductor',
    },
    relaciones: { usuario_id: 'el usuario' },
    mensajeDependientes:
        'No se puede eliminar el conductor: tiene contratos, recorridos o asistencias registrados. Cambia su estado a inactivo.',
};
