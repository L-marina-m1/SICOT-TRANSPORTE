import { pedir } from './cliente'

/** Funciones CRUD para un recurso REST del backend. */
function crearRecurso(base) {
  return {
    listar: (filtros) => pedir(base, { consulta: filtros }),
    obtener: (id) => pedir(`${base}/${id}`),
    crear: (datos) => pedir(base, { metodo: 'POST', cuerpo: datos }),
    actualizar: (id, cambios) => pedir(`${base}/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
    eliminar: (id) => pedir(`${base}/${id}`, { metodo: 'DELETE' }),
  }
}

export const authApi = {
  login: (correo, password) => pedir('/auth/login', { metodo: 'POST', cuerpo: { correo, password } }),
  yo: () => pedir('/auth/me'),
}

export const usuariosApi = crearRecurso('/usuarios')
export const conductoresApi = crearRecurso('/conductores')
export const contratosApi = crearRecurso('/contratos')
export const vehiculosApi = crearRecurso('/vehiculos')
export const recorridosApi = crearRecurso('/recorridos')
export const asistenciasApi = crearRecurso('/asistencias')
export const ubicacionesGpsApi = crearRecurso('/ubicaciones-gps')
