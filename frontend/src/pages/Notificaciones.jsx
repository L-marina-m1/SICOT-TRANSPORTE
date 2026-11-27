const lista = [
  { id: 1, titulo: 'Aviso de circulación', mensaje: 'Código 07: el código 08 está delante de ustedes. Mantenga la distancia correspondiente.', hora: '10:17 a. m.', veh: 'Código 08 · GHI-321' },
  { id: 2, titulo: 'Demora en ruta', mensaje: 'Código 22 lleva más tiempo del permitido en su recorrido.', hora: '10:05 a. m.', veh: 'Código 22 · JKL-654' },
  { id: 3, titulo: 'Sin reporte GPS', mensaje: 'Código 11 no reporta ubicación hace 5 minutos.', hora: '09:58 a. m.', veh: 'Código 11 · MNO-789' },
]

export default function Notificaciones() {
  return (
    <div className="dashboard">
      <header className="dash-top">
        <div>
          <h1>Notificaciones</h1>
          <p>Alertas de vehículos en ruta</p>
        </div>
      </header>
      <section className="caja">
        <div className="caja-titulo"><h2>Todas las notificaciones</h2></div>
        {lista.map((n) => (
          <div key={n.id} className="notif">
            <div className="notif-texto">
              <strong>SICOT · {n.titulo}</strong>
              <p>{n.mensaje}</p>
            </div>
            <div className="notif-hora"><b>{n.hora}</b></div>
            <div className="notif-veh"><b>{n.veh}</b></div>
          </div>
        ))}
      </section>
    </div>
  )
}