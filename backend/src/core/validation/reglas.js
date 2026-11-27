/**
 * Reglas entre campos reutilizables. Reciben el registro final (existente + cambios)
 * y devuelven { campo: mensaje } si algo está mal, o null.
 * Funcionan comparando strings porque fechas/horas vienen como 'YYYY-MM-DD[ HH:MM:SS]' o 'HH:MM:SS'.
 */
function noAntesDe(campoFin, campoInicio) {
    return (registro) => {
        const inicio = registro[campoInicio];
        const fin = registro[campoFin];
        if (inicio && fin && String(fin) < String(inicio)) {
            return { [campoFin]: `no puede ser anterior a ${campoInicio}` };
        }
        return null;
    };
}

module.exports = { noAntesDe };
