const HttpError = require('../errors/HttpError');
const { entero } = require('./tipos');

const MODOS = Object.freeze({ CREAR: 'crear', REEMPLAZAR: 'reemplazar', PARCIAL: 'parcial' });
const LIMITE_MAXIMO = 1000;

const validarLimite = entero({ min: 1, max: LIMITE_MAXIMO });
const validarPagina = entero({ min: 1 });

const esObjetoPlano = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Crea las funciones de validación de una entidad a partir de su esquema.
 * - obligatorios: requeridos al crear/reemplazar y nunca nulos
 * - noNulos: opcionales, pero si se envían no pueden ser null (ej. estado)
 * - opcionalesAlReemplazar: obligatorios al crear pero no en PUT (ej. password)
 */
function crearValidador({ nombre, campos, obligatorios = [], noNulos = [], opcionalesAlReemplazar = [], filtros = [] }) {
    const noAnulables = new Set([...obligatorios, ...noNulos]);

    function requeridosPara(modo) {
        if (modo === MODOS.PARCIAL) return [];
        if (modo === MODOS.REEMPLAZAR) return obligatorios.filter((c) => !opcionalesAlReemplazar.includes(c));
        return obligatorios;
    }

    function validarCampo(campo, valor, errores, datos) {
        if (!Object.hasOwn(campos, campo)) {
            errores[campo] = 'campo no permitido';
            return;
        }
        if (valor === null || valor === '') {
            if (noAnulables.has(campo)) errores[campo] = 'no puede estar vacío';
            else datos[campo] = null;
            return;
        }
        const resultado = campos[campo](valor);
        if ('error' in resultado) errores[campo] = resultado.error;
        else datos[campo] = resultado.valor;
    }

    /** Valida el body de una petición de escritura. Devuelve solo campos permitidos y normalizados. */
    function validarDatos(body, modo = MODOS.CREAR) {
        if (!esObjetoPlano(body)) {
            throw HttpError.badRequest('El cuerpo de la petición debe ser un objeto JSON');
        }

        const errores = {};
        const datos = {};

        for (const [campo, valor] of Object.entries(body)) {
            validarCampo(campo, valor, errores, datos);
        }
        for (const campo of requeridosPara(modo)) {
            if (!Object.hasOwn(body, campo)) errores[campo] = 'es obligatorio';
        }

        if (Object.keys(errores).length > 0) {
            throw HttpError.badRequest(`Datos inválidos para ${nombre}`, errores);
        }
        if (Object.keys(datos).length === 0) {
            throw HttpError.badRequest('Debes enviar al menos un campo');
        }
        return datos;
    }

    /** Valida ?filtro=valor&limite=N&pagina=N de un listado. */
    function validarListado(query = {}) {
        const errores = {};
        const resultado = { filtros: {}, limite: undefined, pagina: 1 };

        for (const [param, valor] of Object.entries(query)) {
            if (typeof valor !== 'string') {
                errores[param] = 'debe enviarse una sola vez';
                continue;
            }
            if (param === 'limite' || param === 'pagina') {
                const r = (param === 'limite' ? validarLimite : validarPagina)(valor);
                if (r.error) errores[param] = r.error;
                else resultado[param] = r.valor;
                continue;
            }
            if (!filtros.includes(param)) {
                errores[param] = `filtro no permitido. Usa: ${[...filtros, 'limite', 'pagina'].join(', ')}`;
                continue;
            }
            const r = campos[param](valor);
            if (r.error) errores[param] = r.error;
            else resultado.filtros[param] = r.valor;
        }

        if (Object.keys(errores).length > 0) {
            throw HttpError.badRequest('Parámetros de búsqueda inválidos', errores);
        }
        return resultado;
    }

    return { validarDatos, validarListado };
}

function validarId(valor) {
    const resultado = entero({ min: 1 })(valor);
    if (resultado.error) throw HttpError.badRequest('El id debe ser un entero positivo');
    return resultado.valor;
}

module.exports = { crearValidador, validarId, MODOS };
