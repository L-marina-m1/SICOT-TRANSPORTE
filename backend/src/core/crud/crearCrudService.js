const pool = require('../../config/database');
const HttpError = require('../errors/HttpError');

const ER_DUP_ENTRY = 1062;
const ER_ROW_IS_REFERENCED = 1451;
const ER_NO_REFERENCED_ROW = 1452;

const ER_DUP_KEY = /for key '(?:[^.']+\.)?([^']+)'/;
const ER_FK_COLUMN = /FOREIGN KEY \(`([^`]+)`\)/;

/**
 * Acceso a datos genérico para una tabla.
 * Los nombres de columna siempre salen del esquema o del validador (lista blanca),
 * nunca directamente del cliente; los valores van siempre como parámetros (?).
 */
function crearCrudService(esquema) {
    const {
        tabla,
        nombre,
        columnas = '*',
        orden = 'id DESC',
        unicos = {},
        relaciones = {},
        mensajeDependientes,
        reglas = [],
        antesDeGuardar = async (datos) => datos,
    } = esquema;

    async function listar({ filtros = {}, limite, pagina = 1 } = {}) {
        const condiciones = Object.keys(filtros).map((columna) => `${columna} = ?`);
        const valores = Object.values(filtros);

        let sql = `SELECT ${columnas} FROM ${tabla}`;
        if (condiciones.length > 0) sql += ` WHERE ${condiciones.join(' AND ')}`;
        sql += ` ORDER BY ${orden}`;
        if (limite) {
            sql += ' LIMIT ? OFFSET ?';
            valores.push(limite, (pagina - 1) * limite);
        }

        return pool.query(sql, valores);
    }

    async function obtener(id) {
        const [registro] = await pool.query(`SELECT ${columnas} FROM ${tabla} WHERE id = ?`, [id]);
        if (!registro) throw HttpError.notFound(`No existe ${nombre} con id ${id}`);
        return registro;
    }

    async function crear(datos) {
        aplicarReglas(datos);
        const fila = await antesDeGuardar(datos);

        const lista = Object.keys(fila);
        const sql = `INSERT INTO ${tabla} (${lista.join(', ')}) VALUES (${lista.map(() => '?').join(', ')})`;

        const resultado = await ejecutar(sql, Object.values(fila));
        return obtener(resultado.insertId);
    }

    async function actualizar(id, datos) {
        const existente = await obtenerFilaCompleta(id);
        aplicarReglas({ ...existente, ...datos });
        const fila = await antesDeGuardar(datos);

        const asignaciones = Object.keys(fila).map((columna) => `${columna} = ?`).join(', ');
        await ejecutar(`UPDATE ${tabla} SET ${asignaciones} WHERE id = ?`, [...Object.values(fila), id]);
        return obtener(id);
    }

    async function eliminar(id) {
        await obtener(id);
        await ejecutar(`DELETE FROM ${tabla} WHERE id = ?`, [id]);
    }

    // Para las reglas entre campos se necesita la fila completa, no solo las columnas públicas.
    async function obtenerFilaCompleta(id) {
        const [registro] = await pool.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id]);
        if (!registro) throw HttpError.notFound(`No existe ${nombre} con id ${id}`);
        return registro;
    }

    function aplicarReglas(registro) {
        const errores = Object.assign({}, ...reglas.map((regla) => regla(registro) || {}));
        if (Object.keys(errores).length > 0) {
            throw HttpError.badRequest(`Datos inválidos para ${nombre}`, errores);
        }
    }

    async function ejecutar(sql, valores) {
        try {
            return await pool.query(sql, valores);
        } catch (error) {
            throw traducirErrorBD(error);
        }
    }

    function traducirErrorBD(error) {
        switch (error.errno) {
            case ER_DUP_ENTRY: {
                const indice = ER_DUP_KEY.exec(error.sqlMessage)?.[1];
                return HttpError.conflict(unicos[indice] || `Ya existe ${nombre} con esos datos`);
            }
            case ER_NO_REFERENCED_ROW: {
                const columna = ER_FK_COLUMN.exec(error.sqlMessage)?.[1];
                const entidad = relaciones[columna] || 'el registro relacionado';
                return HttpError.badRequest(`Datos inválidos para ${nombre}`, {
                    [columna || 'relacion']: `no existe ${entidad} indicado`,
                });
            }
            case ER_ROW_IS_REFERENCED:
                return HttpError.conflict(
                    mensajeDependientes || `No se puede eliminar ${nombre}: tiene registros relacionados`
                );
            default:
                return error;
        }
    }

    return { listar, obtener, crear, actualizar, eliminar };
}

module.exports = crearCrudService;
