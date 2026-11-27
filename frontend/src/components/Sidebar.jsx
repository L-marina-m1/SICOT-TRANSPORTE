import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Bus, BarChart3, FileText, Bell, Settings, LogOut } from 'lucide-react'
import '../sicot-fotos.css'

// pon false si tu imagen de la catedral NO trae el texto "Puno avanza..."
const TEXTO_EN_IMAGEN = true

const items = [
  { ruta: '/inicio', texto: 'Inicio', Icono: Home },
  { ruta: '/vehiculos', texto: 'Vehículos en ruta', Icono: Bus },
  { ruta: '/estadisticas', texto: 'Estadísticas', Icono: BarChart3 },
  { ruta: '/reportes', texto: 'Reportes', Icono: FileText },
  { ruta: '/notificaciones', texto: 'Notificaciones', Icono: Bell, badge: 3 },
  { ruta: '/configuracion', texto: 'Configuración', Icono: Settings },
]

const ocultar = (e) => {
  e.currentTarget.style.display = 'none'
}

export default function Sidebar({ onNavegar }) {
  const navigate = useNavigate()
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-emblema">
          <span className="logo-anillo" />
          <span className="logo-circulo"><Bus size={36} strokeWidth={2.2} /></span>
          <span className="logo-vivo" />
        </div>
        <h1>SICOT</h1>
        <svg className="logo-ruta" viewBox="0 -4 150 18" aria-hidden="true">
          <path d="M2 9 Q40 -1 75 6 T148 3" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="6" strokeLinecap="round" />
          <path d="M2 9 Q40 -1 75 6 T148 3" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 6" />
        </svg>
        <p><b>Sistema de</b> Control y Seguimiento de Transporte</p>
      </div>

      <nav>
        {items.map(({ ruta, texto, Icono, badge }) => (
          <NavLink key={ruta} to={ruta} className="enlace" onClick={onNavegar}>
            <span className="enlace-in"><Icono size={20} />{texto}</span>
            {badge && <span className="badge">{badge}</span>}
          </NavLink>
        ))}
        <button className="enlace" onClick={() => navigate('/login')}>
          <span className="enlace-in"><LogOut size={20} />Cerrar sesión</span>
        </button>
      </nav>

      <div className="sidebar-pie">
        <img className="catedral-img" src="/catedral.png" alt="" onError={ocultar} />
        {!TEXTO_EN_IMAGEN && <p>Puno avanza<br />con transporte seguro</p>}
      </div>
    </aside>
  )
}
