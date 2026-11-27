import { conductoresApi, usuariosApi } from '../api/recursos'
import { ApiError } from '../api/cliente'
import { ROLES } from '../auth/roles'
import { generarClaveTemporal } from '../utils/formato'

const LARGO_NOMBRE_USUARIO = 100

/**
 * Registra un conductor y, si se indica un correo, le crea su cuenta de acceso
 * con una contraseña temporal. Si falla un paso, deshace el anterior.
 * Devuelve { conductor, claveTemporal } (claveTemporal es null si no se creó cuenta).
 */
export async function registrarConductor({ correo, ...datosConductor }) {
  if (!correo) {
    return { conductor: await conductoresApi.crear(datosConductor), claveTemporal: null }
  }

  const claveTemporal = generarClaveTemporal()
  const nombre = `${datosConductor.nombres} ${datosConductor.apellidos}`.trim().slice(0, LARGO_NOMBRE_USUARIO)

  let usuario
  try {
    usuario = await usuariosApi.crear({ nombre, correo, password: claveTemporal, rol: ROLES.CONDUCTOR })
  } catch (error) {
    throw conErroresDeCampo(error, { nombre: 'nombres' })
  }

  try {
    const conductor = await conductoresApi.crear({ ...datosConductor, usuario_id: usuario.id })
    return { conductor, claveTemporal }
  } catch (error) {
    await usuariosApi.eliminar(usuario.id).catch(() => {})
    throw error
  }
}

/** Genera y guarda una nueva contraseña temporal para la cuenta del conductor. */
export async function restablecerClave(conductor) {
  const claveTemporal = generarClaveTemporal()
  await usuariosApi.actualizar(conductor.usuario_id, { password: claveTemporal })
  return claveTemporal
}

/** Da de baja o reactiva al conductor y, si tiene cuenta, también su acceso. */
export async function cambiarEstadoConductor(conductor, activo) {
  const estado = activo ? 'activo' : 'inactivo'
  if (conductor.usuario_id) await usuariosApi.actualizar(conductor.usuario_id, { estado })
  return conductoresApi.actualizar(conductor.id, { estado })
}

// Los errores de la cuenta de usuario se muestran en el campo equivalente del formulario.
function conErroresDeCampo(error, equivalencias) {
  if (!(error instanceof ApiError) || !error.errores) return error
  const errores = Object.fromEntries(
    Object.entries(error.errores).map(([campo, msg]) => [equivalencias[campo] || campo, msg])
  )
  return new ApiError(error.status, error.message, errores)
}
