const { Router } = require('express');
const crearCrudRouter = require('../core/crud/crearCrudRouter');
const healthRoutes = require('../modules/health/health.routes');

const router = Router();

router.use('/', healthRoutes);

// Cada recurso REST se genera a partir de su esquema.
const recursos = {
    '/usuarios': require('../modules/usuarios/usuarios.schema'),
    '/conductores': require('../modules/conductores/conductores.schema'),
    '/contratos': require('../modules/contratos/contratos.schema'),
    '/vehiculos': require('../modules/vehiculos/vehiculos.schema'),
    '/recorridos': require('../modules/recorridos/recorridos.schema'),
    '/asistencias': require('../modules/asistencias/asistencias.schema'),
    '/ubicaciones-gps': require('../modules/ubicaciones-gps/ubicacionesGps.schema'),
};

for (const [ruta, esquema] of Object.entries(recursos)) {
    router.use(ruta, crearCrudRouter(esquema));
}

module.exports = router;
