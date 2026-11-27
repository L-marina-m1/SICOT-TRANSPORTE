const { Router } = require('express');
const crearCrudRouter = require('../core/crud/crearCrudRouter');
const healthRoutes = require('../modules/health/health.routes');
const authRoutes = require('../modules/auth/auth.routes');
const { requiereAuth, ROLES } = require('../middlewares/auth');

const { GERENCIA, ADMIN_TI, CONDUCTOR } = ROLES;
const ADMINISTRACION = [GERENCIA, ADMIN_TI];
const TODOS = [GERENCIA, ADMIN_TI, CONDUCTOR];

// Cada recurso REST se genera a partir de su esquema y sus permisos por rol.
const recursos = [
    { ruta: '/usuarios', esquema: 'usuarios/usuarios.schema', leer: ADMINISTRACION, escribir: ADMINISTRACION },
    { ruta: '/contratos', esquema: 'contratos/contratos.schema', leer: ADMINISTRACION, escribir: ADMINISTRACION },
    { ruta: '/conductores', esquema: 'conductores/conductores.schema', leer: TODOS, escribir: ADMINISTRACION },
    { ruta: '/vehiculos', esquema: 'vehiculos/vehiculos.schema', leer: TODOS, escribir: ADMINISTRACION },
    { ruta: '/recorridos', esquema: 'recorridos/recorridos.schema', leer: TODOS, escribir: ADMINISTRACION },
    // Los conductores registran su asistencia y envían su ubicación GPS.
    { ruta: '/asistencias', esquema: 'asistencias/asistencias.schema', leer: TODOS, escribir: TODOS },
    { ruta: '/ubicaciones-gps', esquema: 'ubicaciones-gps/ubicacionesGps.schema', leer: TODOS, escribir: TODOS },
];

const router = Router();

// Públicas
router.use('/', healthRoutes);
router.use('/auth', authRoutes);

// Protegidas: todo lo que sigue exige sesión
router.use(requiereAuth);

for (const { ruta, esquema, leer, escribir } of recursos) {
    router.use(ruta, crearCrudRouter(require(`../modules/${esquema}`), { leer, escribir }));
}

module.exports = router;
