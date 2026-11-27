import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Download, CalendarDays, Route, Flame, Clock, Satellite, Bus,
  TrendingUp, Activity, Trophy, ListChecks,
} from 'lucide-react'
import EscenaPuno from '../components/EscenaPuno'
import '../sicot-estadisticas.css'

const COLORES_ACT = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1']
const COLORES_AVATAR = ['#e31b3a', '#6366f1', '#f59e0b', '#16a34a', '#0ea5e9']

const periodos = [
  { id: 'q1', texto: '1ra quincena' },
  { id: 'q2', texto: '2da quincena' },
  { id: 'mes', texto: 'Mes completo' },
]
const datos = {
  q1: {
    titulo: '1ra quincena (1 al 15)',
    total: 186,
    dias: [
      { dia: 'Lun', entradas: 32 }, { dia: 'Mar', entradas: 28 }, { dia: 'Mié', entradas: 35 },
      { dia: 'Jue', entradas: 30 }, { dia: 'Vie', entradas: 38 }, { dia: 'Sáb', entradas: 15 }, { dia: 'Dom', entradas: 8 },
    ],
    actividad: [
      { name: 'En ruta', value: 120 }, { name: 'Detenido', value: 30 }, { name: 'Demorado', value: 22 }, { name: 'Sin GPS', value: 14 },
    ],
    rutas: [
      { ruta: 'Ruta 1', viajes: 48 }, { ruta: 'Ruta 2', viajes: 36 }, { ruta: 'Ruta 3', viajes: 52 }, { ruta: 'Ruta 4', viajes: 30 }, { ruta: 'Ruta 5', viajes: 20 },
    ],
    historial: [
      ['02/11/2026', 'Carlos Quispe', 'Ruta 1', 'ABC-123', '06:10'],
      ['03/11/2026', 'Luis Mamani', 'Ruta 3', 'DEF-456', '06:25'],
      ['05/11/2026', 'Ana Flores', 'Ruta 2', 'GHI-321', '06:40'],
      ['09/11/2026', 'Carlos Quispe', 'Ruta 1', 'ABC-123', '06:12'],
    ],
  },
  q2: {
    titulo: '2da quincena (16 al 30)',
    total: 174,
    dias: [
      { dia: 'Lun', entradas: 30 }, { dia: 'Mar', entradas: 33 }, { dia: 'Mié', entradas: 27 },
      { dia: 'Jue', entradas: 31 }, { dia: 'Vie', entradas: 34 }, { dia: 'Sáb', entradas: 13 }, { dia: 'Dom', entradas: 6 },
    ],
    actividad: [
      { name: 'En ruta', value: 112 }, { name: 'Detenido', value: 28 }, { name: 'Demorado', value: 21 }, { name: 'Sin GPS', value: 13 },
    ],
    rutas: [
      { ruta: 'Ruta 1', viajes: 42 }, { ruta: 'Ruta 2', viajes: 40 }, { ruta: 'Ruta 3', viajes: 47 }, { ruta: 'Ruta 4', viajes: 28 }, { ruta: 'Ruta 5', viajes: 17 },
    ],
    historial: [
      ['17/11/2026', 'Luis Mamani', 'Ruta 3', 'DEF-456', '06:20'],
      ['19/11/2026', 'Ana Flores', 'Ruta 2', 'GHI-321', '06:35'],
      ['24/11/2026', 'Carlos Quispe', 'Ruta 1', 'ABC-123', '06:08'],
      ['26/11/2026', 'Pedro Condori', 'Ruta 4', 'JKL-654', '06:50'],
    ],
  },
  mes: {
    titulo: 'Mes completo (noviembre 2026)',
    total: 360,
    dias: [
      { dia: 'Lun', entradas: 62 }, { dia: 'Mar', entradas: 61 }, { dia: 'Mié', entradas: 62 },
      { dia: 'Jue', entradas: 61 }, { dia: 'Vie', entradas: 72 }, { dia: 'Sáb', entradas: 28 }, { dia: 'Dom', entradas: 14 },
    ],
    actividad: [
      { name: 'En ruta', value: 232 }, { name: 'Detenido', value: 58 }, { name: 'Demorado', value: 43 }, { name: 'Sin GPS', value: 27 },
    ],
    rutas: [
      { ruta: 'Ruta 1', viajes: 90 }, { ruta: 'Ruta 2', viajes: 76 }, { ruta: 'Ruta 3', viajes: 99 }, { ruta: 'Ruta 4', viajes: 58 }, { ruta: 'Ruta 5', viajes: 37 },
    ],
    historial: [
      ['02/11/2026', 'Carlos Quispe', 'Ruta 1', 'ABC-123', '06:10'],
      ['03/11/2026', 'Luis Mamani', 'Ruta 3', 'DEF-456', '06:25'],
      ['05/11/2026', 'Ana Flores', 'Ruta 2', 'GHI-321', '06:40'],
      ['17/11/2026', 'Luis Mamani', 'Ruta 3', 'DEF-456', '06:20'],
      ['24/11/2026', 'Carlos Quispe', 'Ruta 1', 'ABC-123', '06:08'],
      ['26/11/2026', 'Pedro Condori', 'Ruta 4', 'JKL-654', '06:50'],
    ],
  },
}


function TooltipBonito({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]
  const etiqueta = p.dataKey === 'entradas' ? 'Entradas' : 'Cantidad'
  return (
    <div className="st-tooltip">
      <b>{label ?? p.name}</b>
      <span>{etiqueta}: <strong>{p.value}</strong></span>
    </div>
  )
}

const iniciales = (nombre) => nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState('q1')
  const d = datos[periodo]
  const diaTop = [...d.dias].sort((a, b) => b.entradas - a.entradas)[0]
  const totalAct = d.actividad.reduce((s, a) => s + a.value, 0)
  const ranking = [...d.rutas].sort((a, b) => b.viajes - a.viajes)
  const maxViajes = ranking[0].viajes
  const totalViajes = d.rutas.reduce((s, r) => s + r.viajes, 0)

  const tarjetas = [
    { tipo: 'neutro', Icono: Bus, Deco: Route, numero: d.total, texto: 'Entradas (rutas iniciadas)' },
    { tipo: 'ok', Icono: Flame, Deco: TrendingUp, numero: diaTop.dia, texto: `Día con más entradas (${diaTop.entradas})` },
    { tipo: 'alerta', Icono: Clock, Deco: Clock, numero: d.actividad[2].value, texto: 'Demoras' },
    { tipo: 'error', Icono: Satellite, Deco: Satellite, numero: d.actividad[3].value, texto: 'Sin reporte GPS' },
  ]

  const descargarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('SICOT - Reporte de estadisticas', 14, 18)
    doc.setFontSize(11)
    doc.text(d.titulo, 14, 26)

    autoTable(doc, {
      startY: 32,
      head: [['Fecha', 'Conductor', 'Ruta', 'Placa', 'Hora']],
      body: d.historial,
      headStyles: { fillColor: [200, 16, 46] },
    })
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Actividad en ruta', 'Cantidad']],
      body: d.actividad.map((a) => [a.name, a.value]),
      headStyles: { fillColor: [200, 16, 46] },
    })
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Ruta', 'Viajes']],
      body: d.rutas.map((r) => [r.ruta, r.viajes]),
      headStyles: { fillColor: [200, 16, 46] },
    })
    doc.save(`estadisticas-${periodo}.pdf`)
  }

  return (
    <div className="dashboard">
      <header className="gx-hero corto">
        <EscenaPuno />
        <div className="gx-fechas">
          <span className="gx-pill"><CalendarDays size={17} />{d.titulo}</span>
          <button className="gx-pill st-pdf" onClick={descargarPDF}>
            <Download size={17} />Descargar PDF
          </button>
        </div>
        <div className="gx-hero-txt">
          <h1>Estadísticas de <span>Transporte</span></h1>
          <p className="gx-sub"><Activity size={20} />Resumen de entradas, rutas y actividad de los vehículos</p>
        </div>
      </header>

      <div className="st-seg">
        {periodos.map((p) => (
          <button key={p.id} className={periodo === p.id ? 'on' : ''} onClick={() => setPeriodo(p.id)}>
            <CalendarDays size={16} />{p.texto}
          </button>
        ))}
      </div>

      <section className="gx-stats" key={`t-${periodo}`}>
        {tarjetas.map(({ tipo, Icono, Deco, numero, texto }, i) => (
          <div key={texto} className={`gx-stat ${tipo}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="gx-stat-ico"><Icono size={28} /></div>
            <div className="gx-stat-txt">
              <strong>{numero}</strong>
              <span>{texto}</span>
            </div>
            <Deco className="gx-stat-deco" size={70} strokeWidth={1.6} />
          </div>
        ))}
      </section>

      <section className="st-fila" key={`a-${periodo}`}>
        <div className="caja">
          <div className="caja-titulo"><h2><TrendingUp size={20} />Entradas por día</h2></div>
          <div className="caja-cuerpo">
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={d.dias} margin={{ top: 18, right: 14, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="stArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef233c" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#ef233c" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#f0d6d9" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#7a4a52', fontWeight: 700, fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a57a82', fontSize: 12 }} />
                <Tooltip content={<TooltipBonito />} cursor={{ stroke: '#ef233c', strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  stroke="#d90f2f"
                  strokeWidth={3}
                  fill="url(#stArea)"
                  dot={{ r: 4, fill: '#fff', stroke: '#d90f2f', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="caja">
          <div className="caja-titulo"><h2><Activity size={20} />Actividad en ruta</h2></div>
          <div className="caja-cuerpo">
            <div className="st-donut">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={d.actividad}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={64}
                    outerRadius={94}
                    paddingAngle={3}
                    cornerRadius={8}
                    stroke="none"
                  >
                    {d.actividad.map((_, i) => (
                      <Cell key={i} fill={COLORES_ACT[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipBonito />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="st-donut-centro">
                <strong>{totalAct}</strong>
                <span>en total</span>
              </div>
            </div>
            <ul className="st-leyenda">
              {d.actividad.map((a, i) => (
                <li key={a.name}>
                  <i style={{ background: COLORES_ACT[i] }} />
                  <span>{a.name}</span>
                  <b>{a.value}</b>
                  <em>{Math.round((a.value / totalAct) * 100)}%</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="st-fila inv" key={`r-${periodo}`}>
        <div className="caja">
          <div className="caja-titulo"><h2><Trophy size={20} />Viajes por ruta</h2></div>
          <div className="caja-cuerpo">
            <ol className="st-ranking">
              {ranking.map((r, i) => (
                <li key={r.ruta}>
                  <span className={`st-pos p${i + 1}`}>{i === 0 ? <Trophy size={16} /> : i + 1}</span>
                  <div className="st-rank-cuerpo">
                    <div className="st-rank-fila">
                      <b>{r.ruta}</b>
                      <span>{r.viajes} viajes · {Math.round((r.viajes / totalViajes) * 100)}%</span>
                    </div>
                    <div className="st-barra">
                      <div style={{ width: `${(r.viajes / maxViajes) * 100}%`, animationDelay: `${i * 0.08}s` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="caja">
          <div className="caja-titulo"><h2><ListChecks size={20} />Historial de entradas</h2></div>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Fecha</th><th>Conductor</th><th>Ruta</th><th>Placa</th><th>Hora</th></tr>
              </thead>
              <tbody>
                {d.historial.map((f, i) => (
                  <tr key={i}>
                    <td>{f[0]}</td>
                    <td>
                      <div className="st-persona">
                        <span className="st-avatar" style={{ background: COLORES_AVATAR[f[1].length % COLORES_AVATAR.length] }}>
                          {iniciales(f[1])}
                        </span>
                        {f[1]}
                      </div>
                    </td>
                    <td><span className="st-chip">{f[2]}</span></td>
                    <td><span className="st-placa">{f[3]}</span></td>
                    <td><span className="st-hora"><Clock size={15} />{f[4]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
