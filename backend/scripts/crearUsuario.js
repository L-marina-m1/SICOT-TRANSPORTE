/**
 * Crea un usuario desde la terminal (sirve para el primer administrador,
 * que no puede crearse desde la web porque aún nadie puede iniciar sesión).
 *
 *   npm run crear-usuario -- --nombre "Ana Quispe" --correo ana@sicot.pe --rol gerencia --password "Clave-Segura1"
 *
 * Roles: gerencia, admin_ti, conductor
 */
const { parseArgs } = require('node:util');
const crearCrudService = require('../src/core/crud/crearCrudService');
const { crearValidador } = require('../src/core/validation/crearValidador');
const esquemaUsuarios = require('../src/modules/usuarios/usuarios.schema');
const pool = require('../src/config/database');

async function main() {
    const { values } = parseArgs({
        options: {
            nombre: { type: 'string' },
            correo: { type: 'string' },
            rol: { type: 'string' },
            password: { type: 'string' },
        },
    });

    const datos = crearValidador(esquemaUsuarios).validarDatos(values);
    const usuario = await crearCrudService(esquemaUsuarios).crear(datos);
    console.log('Usuario creado:', usuario);
}

main()
    .catch((error) => {
        console.error(error.message);
        if (error.detalles) console.error(error.detalles);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
