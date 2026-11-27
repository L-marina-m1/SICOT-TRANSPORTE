/** Texto y color (clase .pill) de cada estado que maneja el backend. */

export const ESTADOS_VEHICULO = {
  disponible: { texto: 'Disponible', tono: 'ok' },
  en_ruta: { texto: 'En ruta', tono: 'info' },
  mantenimiento: { texto: 'Mantenimiento', tono: 'warn' },
  inactivo: { texto: 'Inactivo', tono: 'mute' },
}

export const ESTADOS_CONDUCTOR = {
  activo: { texto: 'Activo', tono: 'ok' },
  inactivo: { texto: 'De baja', tono: 'mute' },
}
