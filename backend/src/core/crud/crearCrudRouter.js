const { Router } = require('express');
const crearCrudService = require('./crearCrudService');
const { crearValidador, validarId, MODOS } = require('../validation/crearValidador');
const { permitirRoles } = require('../../middlewares/auth');

/**
 * Genera un router REST completo a partir del esquema de una entidad:
 *   GET    /       listar (con filtros, ?limite y ?pagina)
 *   GET    /:id    obtener
 *   POST   /       crear
 *   PUT    /:id    reemplazar (exige campos obligatorios)
 *   PATCH  /:id    actualizar solo los campos enviados
 *   DELETE /:id    eliminar
 *
 * permisos.leer / permisos.escribir: roles que pueden usar cada grupo de rutas.
 * El router asume que requiereAuth ya se aplicó antes.
 */
function crearCrudRouter(esquema, permisos) {
    const service = crearCrudService(esquema);
    const { validarDatos, validarListado } = crearValidador(esquema);
    const puedeLeer = permitirRoles(permisos.leer);
    const puedeEscribir = permitirRoles(permisos.escribir);
    const router = Router();

    router.get('/', puedeLeer, async (req, res) => {
        res.json(await service.listar(validarListado(req.query)));
    });

    router.get('/:id', puedeLeer, async (req, res) => {
        res.json(await service.obtener(validarId(req.params.id)));
    });

    router.post('/', puedeEscribir, async (req, res) => {
        const datos = validarDatos(req.body, MODOS.CREAR);
        res.status(201).json(await service.crear(datos));
    });

    router.put('/:id', puedeEscribir, async (req, res) => {
        const id = validarId(req.params.id);
        const datos = validarDatos(req.body, MODOS.REEMPLAZAR);
        res.json(await service.actualizar(id, datos));
    });

    router.patch('/:id', puedeEscribir, async (req, res) => {
        const id = validarId(req.params.id);
        const datos = validarDatos(req.body, MODOS.PARCIAL);
        res.json(await service.actualizar(id, datos));
    });

    router.delete('/:id', puedeEscribir, async (req, res) => {
        await service.eliminar(validarId(req.params.id));
        res.status(204).end();
    });

    return router;
}

module.exports = crearCrudRouter;
