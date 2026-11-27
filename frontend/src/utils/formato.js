/** Las fechas llegan del backend como 'YYYY-MM-DD' o 'YYYY-MM-DD HH:MM:SS' (sin zona horaria). */

export function formatearFecha(valor) {
  if (!valor) return '—'
  const [anio, mes, dia] = String(valor).slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

export function formatearHora(valor) {
  if (!valor) return '—'
  const texto = String(valor)
  return (texto.includes(' ') ? texto.split(' ')[1] : texto).slice(0, 5)
}

export function formatearNumero(valor, decimales = 0) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/** Fecha de hoy en formato 'YYYY-MM-DD' según la hora local. */
export function hoyISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

const ALFABETO_CLAVE = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

/** Contraseña temporal aleatoria (sin caracteres confusos como 0/O o 1/l). */
export function generarClaveTemporal(longitud = 10) {
  const bytes = crypto.getRandomValues(new Uint32Array(longitud))
  return Array.from(bytes, (n) => ALFABETO_CLAVE[n % ALFABETO_CLAVE.length]).join('')
}
