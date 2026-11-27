import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { authApi } from '../api/recursos'
import { alPerderSesion, tokenSesion } from '../api/cliente'

const SIN_SESION = { usuario: null, verificando: false }

export default function AuthProvider({ children }) {
  // Si hay un token guardado, hay que confirmarlo con el backend antes de mostrar la app.
  const [sesion, setSesion] = useState(() =>
    tokenSesion.leer() ? { usuario: null, verificando: true } : SIN_SESION
  )

  const cerrarSesion = useCallback(() => {
    tokenSesion.borrar()
    setSesion(SIN_SESION)
  }, [])

  useEffect(() => {
    alPerderSesion(cerrarSesion)
  }, [cerrarSesion])

  useEffect(() => {
    if (!tokenSesion.leer()) return undefined
    let vigente = true

    authApi.yo().then(
      (usuario) => vigente && setSesion({ usuario, verificando: false }),
      (error) => {
        if (!vigente) return
        if (error.status === 401) tokenSesion.borrar()
        setSesion(SIN_SESION)
      }
    )
    return () => { vigente = false }
  }, [])

  const iniciarSesion = useCallback(async (correo, password) => {
    const { token, usuario } = await authApi.login(correo, password)
    tokenSesion.guardar(token)
    setSesion({ usuario, verificando: false })
    return usuario
  }, [])

  const valor = useMemo(
    () => ({ ...sesion, iniciarSesion, cerrarSesion }),
    [sesion, iniciarSesion, cerrarSesion]
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
