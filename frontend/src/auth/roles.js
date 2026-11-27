export const ROLES = Object.freeze({
  GERENCIA: 'gerencia',
  ADMIN_TI: 'admin_ti',
  CONDUCTOR: 'conductor',
})

export const ROLES_ADMINISTRACION = [ROLES.GERENCIA, ROLES.ADMIN_TI]

export const NOMBRE_ROL = {
  [ROLES.GERENCIA]: 'Gerencia',
  [ROLES.ADMIN_TI]: 'Administrador TI',
  [ROLES.CONDUCTOR]: 'Conductor',
}

export const puedeAdministrar = (usuario) => ROLES_ADMINISTRACION.includes(usuario?.rol)
