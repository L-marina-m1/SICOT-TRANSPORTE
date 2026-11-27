import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bus, MapPin, Power, TrendingUp, TriangleAlert, Navigation, Users, Wrench,
  ShieldCheck, CalendarDays, Clock, RefreshCw, ArrowRight, Bell, Info,
} from 'lucide-react'
import EscenaPuno from '../components/EscenaPuno'
import EstadoTabla from '../components/ui/EstadoTabla'
import { conductoresApi, recorridosApi, vehiculosApi } from '../api/recursos'
import { useCarga } from '../hooks/useCarga'
import { formatearHora } from '../utils/formato'

const SIN_DATOS = { vehiculos: [], conductores: [], recorridos: [] }

async function cargarPanel() {
  const [vehiculos, conductores, recorridos] = await Promise.all([
    vehiculosApi.listar(),
    conductoresApi.listar(),
    recorridosApi.listar({ estado: 'en_curso' }),
  ])
  return { vehiculos, conductores, recorridos }
}

function construirResumen({ vehiculos, conductores }) {
  const total = vehiculos.length
  const contar = (estado) => vehiculos.filter((v) => v.estado === estado).length
  const enRuta = contar('en_ruta')
  const porcentaje = total ? Math.round((enRuta / total) * 100) : 0

  return [
    { id: 'flota', numero: total, texto: 'Vehículos registrados', tipo: 'neutro', Icono: Bus, Deco: MapPin },
    { id: 'ruta', numero: enRuta, texto: `En ruta (${porcentaje}%)`, tipo: 'ok', Icono: Power, Deco: TrendingUp },
    { id: 'mant', numero: contar('mantenimiento'), texto: 'En mantenimiento', tipo: 'alerta', Icono: Wrench, Deco: TriangleAlert },
    {
      id: 'cond',
      numero: conductores.filter((c) => c.estado === 'activo').length,
      texto: 'Conductores activos',
      tipo: 'error',
      Icono: Users,
      Deco: Navigation,
    },
  ]
}

/** Une cada recorrido en curso con la placa del vehículo y el nombre del conductor. */
function recorridosEnCurso({ recorridos, vehiculos, conductores }) {
  const placas = Object.fromEntries(vehiculos.map((v) => [v.id, v.placa]))
  const nombres = Object.fromEntries(conductores.map((c) => [c.id, `${c.nombres} ${c.apellidos}`]))
  return recorridos.map((r) => ({
    id: r.id,
    placa: placas[r.vehiculo_id] || `#${r.vehiculo_id}`,
    conductor: nombres[r.conductor_id] || '—',
    ruta: `${r.origen} → ${r.destino}`,
    salida: formatearHora(r.fecha_inicio),
  }))
}

const capitalizar = (t) =>
  t.split(' ').map((p) => (p === 'de' || !p ? p : p[0].toUpperCase() + p.slice(1))).join(' ')

export default function Inicio() {
  const [ahora, setAhora] = useState(new Date())
  const [mapaKey, setMapaKey] = useState(0)
  const { datos, error, cargando, recargar } = useCarga(cargarPanel, 'panel')
  const panel = datos || SIN_DATOS
  const resumen = construirResumen(panel)
  const enCurso = recorridosEnCurso(panel)

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

      {error && (
        <div className="aviso error" role="alert">
          <span>{error.message}</span>
          <button className="btn-link" onClick={recargar}>Reintentar</button>
        </div>
      )}

      <section className="gx-stats">
        {resumen.map(({ id, numero, texto, tipo, Icono, Deco }, i) => (
          <div key={id} className={`gx-stat ${tipo}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="gx-stat-ico"><Icono size={28} /></div>
            <div className="gx-stat-txt">
              <strong>{datos ? numero : '…'}</strong>
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
            <h2><Bus size={20} />Recorridos en curso</h2>
            <Link to="/vehiculos" className="btn-ver">Ver vehículos <ArrowRight size={15} /></Link>
          </div>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Placa</th><th>Conductor</th><th>Ruta</th><th>Salida</th></tr>
              </thead>
              <tbody>
                <EstadoTabla
                  columnas={4}
                  cargando={cargando && !datos}
                  vacio={enCurso.length === 0}
                  mensajeVacio="No hay recorridos en curso"
                />
                {enCurso.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.placa}</b></td>
                    <td>{r.conductor}</td>
                    <td>{r.ruta}</td>
                    <td>{r.salida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Aún de ejemplo: el backend no tiene módulo de notificaciones. */}
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
