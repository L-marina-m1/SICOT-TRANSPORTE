import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bus, MapPin, Power, TrendingUp, TriangleAlert, Navigation, Satellite,
  ShieldCheck, CalendarDays, Clock, RefreshCw, ArrowRight, Bell, Info,
} from 'lucide-react'
import EscenaPuno from '../components/EscenaPuno'

const resumen = [
  { id: 'rutas', numero: 30, texto: 'Rutas totales', tipo: 'neutro', Icono: Bus, Deco: MapPin },
  { id: 'activos', numero: 24, texto: 'Activos (80%)', tipo: 'ok', Icono: Power, Deco: TrendingUp },
  { id: 'incidencias', numero: 2, texto: 'Incidencias (7%)', tipo: 'alerta', Icono: TriangleAlert, Deco: TriangleAlert },
  { id: 'gps', numero: 4, texto: 'Sin reporte GPS', tipo: 'error', Icono: Navigation, Deco: Satellite },
]

const vehiculos = [
  { codigo: '15', placa: 'ABC-123', ubicacion: 'Av. Principal', estado: 'En ruta', hora: '10:20' },
  { codigo: '07', placa: 'DEF-456', ubicacion: 'Mercado Central', estado: 'Detenido', hora: '10:18' },
  { codigo: '08', placa: 'GHI-321', ubicacion: 'Cerca del Mercado', estado: 'En ruta', hora: '10:17' },
  { codigo: '22', placa: 'JKL-654', ubicacion: 'Av. del Sol', estado: 'En ruta', hora: '10:19' },
  { codigo: '11', placa: 'MNO-789', ubicacion: 'Av. Universitaria', estado: 'En ruta', hora: '10:21' },
]

const capitalizar = (t) =>
  t.split(' ').map((p) => (p === 'de' || !p ? p : p[0].toUpperCase() + p.slice(1))).join(' ')

export default function Inicio() {
  const [ahora, setAhora] = useState(new Date())
  const [mapaKey, setMapaKey] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const fecha = capitalizar(
    ahora.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  )
  const hora = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="dashboard">
      <header className="gx-hero">
        <EscenaPuno />
        <div className="gx-fechas">
          <span className="gx-pill"><CalendarDays size={17} />{fecha}</span>
          <span className="gx-pill"><Clock size={17} />{hora}</span>
        </div>
        <div className="gx-hero-txt">
          <h1>Panel de <span>Gerencia</span></h1>
          <p className="gx-sub"><ShieldCheck size={20} />Transporte seguro, compromiso de todos</p>
        </div>
      </header>

      <section className="gx-stats">
        {resumen.map(({ id, numero, texto, tipo, Icono, Deco }, i) => (
          <div key={id} className={`gx-stat ${tipo}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="gx-stat-ico"><Icono size={28} /></div>
            <div className="gx-stat-txt">
              <strong>{numero}</strong>
              <span>{texto}</span>
            </div>
            <Deco className="gx-stat-deco" size={70} strokeWidth={1.6} />
          </div>
        ))}
      </section>

      <section className="dash-medio">
        <div className="caja">
          <div className="caja-titulo">
            <h2><MapPin size={20} />Mapa en tiempo real</h2>
            <div className="caja-acciones">
              <span className="etiqueta-verde"><i className="punto-vivo" />Actualización: 1 min</span>
              <button className="btn-refresh" onClick={() => setMapaKey(mapaKey + 1)} title="Actualizar mapa">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="mapa">
            <iframe
              key={mapaKey}
              title="Mapa en tiempo real"
              src="https://www.google.com/maps?q=Puno,Peru&z=14&output=embed"
              loading="lazy"
            />
          </div>
        </div>

        <div className="caja">
          <div className="caja-titulo">
            <h2><Bus size={20} />Vehículos en ruta</h2>
            <Link to="/vehiculos" className="btn-ver">Ver todos <ArrowRight size={15} /></Link>
          </div>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Código</th><th>Placa</th><th>Ubicación</th><th>Estado</th><th>Hora</th></tr>
              </thead>
              <tbody>
                {vehiculos.map((v) => (
                  <tr key={v.codigo}>
                    <td>{v.codigo}</td>
                    <td>{v.placa}</td>
                    <td>{v.ubicacion}</td>
                    <td>
                      <span className={`pill ${v.estado === 'En ruta' ? 'ok' : 'warn'}`}>
                        <i />{v.estado}
                      </span>
                    </td>
                    <td>{v.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="caja">
        <div className="caja-titulo">
          <h2><Bell size={20} />Últimas notificaciones</h2>
          <Link to="/notificaciones" className="btn-ver">Ver todas <ArrowRight size={15} /></Link>
        </div>
        <div className="notif">
          <div className="notif-ico"><Info size={22} /></div>
          <div className="notif-texto">
            <strong>SICOT · Aviso de circulación</strong>
            <p>Código 07: el código 08 está delante de ustedes. Mantenga la distancia correspondiente.</p>
          </div>
          <div className="notif-hora">
            <b>10:17 a. m.</b>
            <small>Hace 7 min</small>
          </div>
          <div className="notif-veh">
            <b>Código 08</b>
            <small>Placa GHI-321</small>
          </div>
        </div>
      </section>
    </div>
  )
}
