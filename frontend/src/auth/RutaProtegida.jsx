import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Solo deja pasar con sesión iniciada y, si se indican, con alguno de los roles. */
export default function RutaProtegida({ roles, children }) {
  const { usuario, verificando } = useAuth()
  const { pathname } = useLocation()

  if (verificando) return <div className="cargando-pagina">Cargando…</div>
  if (!usuario) return <Navigate to="/login" replace state={{ desde: pathname }} />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/inicio" replace />

  return children ?? <Outlet />
}
