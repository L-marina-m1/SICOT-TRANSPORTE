import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORES = ['#ef233c', '#ffb703', '#16a34a', '#6b7280']

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

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState('q1')
  const d = datos[periodo]
  const diaTop = [...d.dias].sort((a, b) => b.entradas - a.entradas)[0]

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
      <header className="dash-top">
        <div>
          <h1>Estadísticas</h1>
          <p>{d.titulo}</p>
        </div>
        <button className="btn-pdf" onClick={descargarPDF}>Descargar PDF</button>
      </header>

      <div className="toggle">
        <button className={periodo === 'q1' ? 'on' : ''} onClick={() => setPeriodo('q1')}>1ra quincena</button>
        <button className={periodo === 'q2' ? 'on' : ''} onClick={() => setPeriodo('q2')}>2da quincena</button>
        <button className={periodo === 'mes' ? 'on' : ''} onClick={() => setPeriodo('mes')}>Mes completo</button>
      </div>

      <section className="tarjetas">
        <div className="tarjeta neutro"><strong>{d.total}</strong><span>Entradas (rutas iniciadas)</span></div>
        <div className="tarjeta ok"><strong>{diaTop.dia}</strong><span>Día con más entradas ({diaTop.entradas})</span></div>
        <div className="tarjeta alerta"><strong>{d.actividad[2].value}</strong><span>Demoras</span></div>
        <div className="tarjeta error"><strong>{d.actividad[3].value}</strong><span>Sin reporte GPS</span></div>
      </section>

      <section className="graficos">
        <div className="caja">
          <div className="caja-titulo"><h2>Entradas por día</h2></div>
          <div className="caja-cuerpo">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.dias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entradas" fill="#ef233c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="caja">
          <div className="caja-titulo"><h2>Actividad en ruta</h2></div>
          <div className="caja-cuerpo">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={d.actividad} dataKey="value" nameKey="name" outerRadius={90} label>
                  {d.actividad.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="caja">
          <div className="caja-titulo"><h2>Viajes por ruta</h2></div>
          <div className="caja-cuerpo">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.rutas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ruta" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="viajes" fill="#ffb703" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="caja">
          <div className="caja-titulo"><h2>Reparto de rutas</h2></div>
          <div className="caja-cuerpo">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={d.rutas} dataKey="viajes" nameKey="ruta" outerRadius={90} label>
                  {d.rutas.map((_, i) => (
                    <Cell key={i} fill={['#ef233c', '#ff8fa3', '#ffb703', '#16a34a', '#6b7280'][i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="caja">
        <div className="caja-titulo"><h2>Historial de entradas</h2></div>
        <table className="tabla">
          <thead>
            <tr><th>Fecha</th><th>Conductor</th><th>Ruta</th><th>Placa</th><th>Hora</th></tr>
          </thead>
          <tbody>
            {d.historial.map((f, i) => (
              <tr key={i}>
                {f.map((c, j) => <td key={j}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
