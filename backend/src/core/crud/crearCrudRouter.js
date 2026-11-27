const { Router } = require('express');
const crearCrudService = require('./crearCrudService');
const { crearValidador, validarId, MODOS } = require('../validation/crearValidador');

/**
 * Genera un router REST completo a partir del esquema de una entidad:
 *   GET    /       listar (con filtros, ?limite y ?pagina)
 *   GET    /:id    obtener
 *   POST   /       crear
 *   PUT    /:id    reemplazar (exige campos obligatorios)
 *   PATCH  /:id    actualizar solo los campos enviados
 *   DELETE /:id    eliminar
 */
function crearCrudRouter(esquema) {
    const service = crearCrudService(esquema);
    const { validarDatos, validarListado } = crearValidador(esquema);
    const router = Router();

    router.get('/', async (req, res) => {
        res.json(await service.listar(validarListado(req.query)));
    });

    router.get('/:id', async (req, res) => {
        res.json(await service.obtener(validarId(req.params.id)));
    });

    router.post('/', async (req, res) => {
        const datos = validarDatos(req.body, MODOS.CREAR);
        res.status(201).json(await service.crear(datos));
    });

    router.put('/:id', async (req, res) => {
        const id = validarId(req.params.id);
        const datos = validarDatos(req.body, MODOS.REEMPLAZAR);
        res.json(await service.actualizar(id, datos));
    });

    router.patch('/:id', async (req, res) => {
        const id = validarId(req.params.id);
        const datos = validarDatos(req.body, MODOS.PARCIAL);
        res.json(await service.actualizar(id, datos));
    });

    router.delete('/:id', async (req, res) => {
        await service.eliminar(validarId(req.params.id));
        res.status(204).end();
    });

    return router;
}

module.exports = crearCrudRouter;
