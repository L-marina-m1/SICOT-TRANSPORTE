import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

const RUTAS_CON_BANNER = ['/inicio', '/estadisticas']

export default function Layout() {
  const [abierto, setAbierto] = useState(window.innerWidth > 900)
  const { pathname } = useLocation()
  const cerrarEnCelular = () => {
    if (window.innerWidth <= 900) setAbierto(false)
  }
  return (
    <div className={`app ${abierto ? 'menu-abierto' : 'menu-cerrado'}`}>
      <Sidebar onNavegar={cerrarEnCelular} />
      {abierto && <div className="fondo-menu" onClick={() => setAbierto(false)} />}
      <main className={`contenido ${RUTAS_CON_BANNER.includes(pathname) ? 'con-hero' : ''}`}>
        <button className="btn-menu" onClick={() => setAbierto(!abierto)} aria-label="Menú">
          <Menu size={22} />
        </button>
        <Outlet />
      </main>
    </div>
  )
}
