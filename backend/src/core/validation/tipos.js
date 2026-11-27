/**
 * Tipos de campo reutilizables. Cada tipo es una función (valor) => { valor } | { error }
 * que valida y normaliza un valor ya distinto de null/''.
 */

const ok = (valor) => ({ valor });
const error = (mensaje) => ({ error: mensaje });

const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const FECHA_HORA = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2})?$/;
const HORA = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function aNumero(valor) {
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string' && valor.trim() !== '') return Number(valor);
    return NaN;
}

function validarRango(n, { min, max }) {
    if (min !== undefined && n < min) return `debe ser mayor o igual a ${min}`;
    if (max !== undefined && n > max) return `debe ser menor o igual a ${max}`;
    return null;
}

function texto({ min = 1, max, mayusculas = false, minusculas = false } = {}) {
    return (valor) => {
        if (typeof valor !== 'string' && typeof valor !== 'number') return error('debe ser texto');

        let s = String(valor).trim();
        if (mayusculas) s = s.toUpperCase();
        if (minusculas) s = s.toLowerCase();

        if (s.length < min) return error(`debe tener al menos ${min} caracteres`);
        if (max !== undefined && s.length > max) return error(`debe tener como máximo ${max} caracteres`);
        return ok(s);
    };
}

function entero(rango = {}) {
    return (valor) => {
        const n = aNumero(valor);
        if (!Number.isInteger(n)) return error('debe ser un número entero');
        const fueraDeRango = validarRango(n, rango);
        return fueraDeRango ? error(fueraDeRango) : ok(n);
    };
}

function decimal(rango = {}) {
    return (valor) => {
        const n = aNumero(valor);
        if (!Number.isFinite(n)) return error('debe ser un número');
        const fueraDeRango = validarRango(n, rango);
        return fueraDeRango ? error(fueraDeRango) : ok(n);
    };
}

/** Clave foránea: entero positivo. */
function id() {
    return entero({ min: 1 });
}

function opcion(valores) {
    return (valor) => {
        const s = String(valor).trim().toLowerCase();
        return valores.includes(s) ? ok(s) : error(`debe ser uno de: ${valores.join(', ')}`);
    };
}

function esFechaReal(anio, mes, dia) {
    const d = new Date(Date.UTC(anio, mes - 1, dia));
    return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

/** 'YYYY-MM-DD' */
function fecha() {
    return (valor) => {
        const m = FECHA.exec(String(valor).trim());
        if (!m || !esFechaReal(Number(m[1]), Number(m[2]), Number(m[3]))) {
            return error('debe ser una fecha válida con formato YYYY-MM-DD');
        }
        return ok(m[0]);
    };
}

/** 'HH:MM' o 'HH:MM:SS' → 'HH:MM:SS' */
function hora() {
    return (valor) => {
        const m = HORA.exec(String(valor).trim());
        const [h, min, seg = 0] = m ? [m[1], m[2], m[3]].map((x) => (x === undefined ? 0 : Number(x))) : [];
        if (!m || h > 23 || min > 59 || seg > 59) {
            return error('debe ser una hora válida con formato HH:MM o HH:MM:SS');
        }
        return ok(`${m[1]}:${m[2]}:${m[3] || '00'}`);
    };
}

/** 'YYYY-MM-DD HH:MM[:SS]' (también acepta 'T') → 'YYYY-MM-DD HH:MM:SS' */
function fechaHora() {
    const validarFecha = fecha();
    const validarHora = hora();
    return (valor) => {
        const m = FECHA_HORA.exec(String(valor).trim());
        const f = m && validarFecha(m[1]);
        const h = m && validarHora(m[2] + (m[3] || ''));
        if (!m || f.error || h.error) {
            return error('debe ser una fecha y hora válida con formato YYYY-MM-DD HH:MM:SS');
        }
        return ok(`${f.valor} ${h.valor}`);
    };
}

function correo({ max = 120 } = {}) {
    return (valor) => {
        const s = String(valor).trim().toLowerCase();
        if (s.length > max || !CORREO.test(s)) return error('debe ser un correo electrónico válido');
        return ok(s);
    };
}

module.exports = { texto, entero, decimal, id, opcion, fecha, hora, fechaHora, correo };
