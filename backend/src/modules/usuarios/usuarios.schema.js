const t = require('../../core/validation/tipos');
const { hashPassword } = require('./password');

module.exports = {
    tabla: 'usuarios',
    nombre: 'el usuario',
    // password_hash nunca se devuelve en las respuestas
    columnas: 'id, nombre, correo, rol, estado, fecha_creacion',
    campos: {
        nombre: t.texto({ max: 100 }),
        correo: t.correo({ max: 120 }),
        password: t.texto({ min: 8, max: 72 }),
        rol: t.opcion(['gerencia', 'admin_ti', 'conductor']),
        estado: t.opcion(['activo', 'inactivo']),
    },
    obligatorios: ['nombre', 'correo', 'password', 'rol'],
    noNulos: ['estado'],
    // En PUT la contraseña es opcional: si no se envía, se conserva la actual.
    opcionalesAlReemplazar: ['password'],
    filtros: ['rol', 'estado', 'correo'],
    unicos: { correo: 'Ya existe un usuario con ese correo' },

    async antesDeGuardar({ password, ...datos }) {
        if (password === undefined) return datos;
        return { ...datos, password_hash: await hashPassword(password) };
    },
};
