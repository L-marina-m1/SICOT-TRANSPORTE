const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const CLAVE_TOKEN = 'sicot_token'
const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.'

export class ApiError extends Error {
  constructor(status, mensaje, errores = {}) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.errores = errores
  }
}

// localStorage puede fallar (modo privado, bloqueos del navegador): nunca debe romper la app.
export const tokenSesion = {
  leer() {
    try { return localStorage.getItem(CLAVE_TOKEN) } catch { return null }
  },
  guardar(token) {
    try { localStorage.setItem(CLAVE_TOKEN, token) } catch { /* sin persistencia */ }
  },
  borrar() {
    try { localStorage.removeItem(CLAVE_TOKEN) } catch { /* nada que borrar */ }
  },
}

let alExpirarSesion = () => {}

/** El AuthProvider registra aquí qué hacer cuando el backend responde 401. */
export function alPerderSesion(callback) {
  alExpirarSesion = callback
}

function construirUrl(ruta, consulta) {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(consulta || {})) {
    if (valor !== undefined && valor !== null && valor !== '') params.set(clave, valor)
  }
  const query = params.toString()
  return `${API_URL}${ruta}${query ? `?${query}` : ''}`
}

/**
 * Hace una petición a la API y devuelve el JSON de respuesta.
 * Lanza ApiError con { status, message, errores } si algo sale mal.
 */
export async function pedir(ruta, { metodo = 'GET', cuerpo, consulta } = {}) {
  const token = tokenSesion.leer()
  const headers = { Accept: 'application/json' }
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(construirUrl(ruta, consulta), {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ApiError(0, MENSAJE_SIN_CONEXION)
  }

  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) alExpirarSesion()
    // Sin JSON y con 5xx: casi siempre es el proxy de Vite sin backend detrás.
    const mensaje = datos?.mensaje || (respuesta.status >= 500 ? MENSAJE_SIN_CONEXION : `Error ${respuesta.status}`)
    throw new ApiError(respuesta.status, mensaje, datos?.errores)
  }
  return datos
}
