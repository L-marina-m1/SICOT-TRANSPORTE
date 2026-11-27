import { useCallback, useEffect, useState } from 'react'

/**
 * Ejecuta `cargar()` (una función que devuelve una promesa) y vuelve a hacerlo cuando cambia `clave`
 * o cuando se llama a `recargar()`. Ignora respuestas que llegan tarde.
 *
 *   const { datos, error, cargando, recargar } = useCarga(() => vehiculosApi.listar(), 'vehiculos')
 */
export function useCarga(cargar, clave = '') {
  const [version, setVersion] = useState(0)
  const [estado, setEstado] = useState({ datos: null, error: null, solicitud: null })
  const solicitud = `${clave}#${version}`

  useEffect(() => {
    let vigente = true
    cargar().then(
      (datos) => vigente && setEstado({ datos, error: null, solicitud }),
      (error) => vigente && setEstado((previo) => ({ datos: previo.datos, error, solicitud }))
    )
    return () => { vigente = false }
    // `cargar` suele ser una función nueva en cada render: la recarga la controla `solicitud`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitud])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return {
    datos: estado.datos,
    error: estado.error,
    cargando: estado.solicitud !== solicitud,
    recargar,
  }
}
