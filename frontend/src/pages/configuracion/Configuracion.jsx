import { useMemo, useState } from 'react'
import { KeyRound, UserCheck, Users, UserX, X } from 'lucide-react'
import { conductoresApi, usuariosApi } from '../../api/recursos'
import { useCarga } from '../../hooks/useCarga'
import { cambiarEstadoConductor, restablecerClave } from '../../services/conductores'
import { ESTADOS_CONDUCTOR } from '../../utils/estados'
import { formatearFecha, hoyISO } from '../../utils/formato'
import EstadoPill from '../../components/ui/EstadoPill'
import EstadoTabla from '../../components/ui/EstadoTabla'
import ConductorFormulario from './ConductorFormulario'

const cargarDatos = async () => {
  const [conductores, usuarios] = await Promise.all([
    conductoresApi.listar(),
    usuariosApi.listar({ rol: 'conductor' }),
  ])
  return { conductores, correos: Object.fromEntries(usuarios.map((u) => [u.id, u.correo])) }
}

function Aviso({ aviso, onCerrar }) {
  if (!aviso) return null
  return (
    <div className={`aviso ${aviso.tipo}`} role="status">
      <span>
        {aviso.texto}
        {aviso.clave && <> Contraseña temporal: <code>{aviso.clave}</code> (anótala, no se volverá a mostrar)</>}
      </span>
      <button onClick={onCerrar} aria-label="Cerrar aviso"><X size={16} /></button>
    </div>
  )
}

export default function Configuracion() {
  const { datos, error, cargando, recargar } = useCarga(cargarDatos, 'conductores')
  const [aviso, setAviso] = useState(null)
  const [procesando, setProcesando] = useState(null)
  const conductores = useMemo(() => datos?.conductores || [], [datos])
  const hoy = hoyISO()

  const alRegistrar = ({ conductor, claveTemporal }) => {
    setAviso({ tipo: 'ok', texto: `${conductor.nombres} ${conductor.apellidos} registrado.`, clave: claveTemporal })
    recargar()
  }

  const ejecutar = async (conductor, accion) => {
    setProcesando(conductor.id)
    try {
      setAviso(await accion())
      recargar()
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message })
    } finally {
      setProcesando(null)
    }
  }

  const restablecer = (c) =>
    ejecutar(c, async () => ({
      tipo: 'ok',
      texto: `Nueva contraseña para ${c.nombres} ${c.apellidos}.`,
      clave: await restablecerClave(c),
    }))

  const alternarBaja = (c) => {
    const activar = c.estado !== 'activo'
    return ejecutar(c, async () => {
      await cambiarEstadoConductor(c, activar)
      return { tipo: 'ok', texto: `${c.nombres} ${c.apellidos} ${activar ? 'reactivado' : 'dado de baja'}.` }
    })
  }

  return (
    <div className="inicio">
      <header className="dash-top">
        <div>
          <h1>Configuración</h1>
          <p>Registro y control de conductores</p>
        </div>
      </header>

      <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />
      <ConductorFormulario onRegistrado={alRegistrar} />

      <section className="caja">
        <div className="caja-titulo"><h2><Users size={20} />Conductores registrados</h2></div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr><th>Conductor</th><th>DNI</th><th>Licencia</th><th>Vence</th><th>Acceso</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <EstadoTabla
                columnas={7}
                cargando={cargando && !datos}
                error={error}
                vacio={conductores.length === 0}
                mensajeVacio="Aún no hay conductores registrados"
                onReintentar={recargar}
              />
              {!error && conductores.map((c) => {
                const vencida = c.fecha_vencimiento_licencia && c.fecha_vencimiento_licencia < hoy
                const ocupado = procesando === c.id
                return (
                  <tr key={c.id}>
                    <td>
                      {c.nombres} {c.apellidos}
                      {c.telefono && <span className="t-sub">{c.telefono}</span>}
                    </td>
                    <td>{c.dni}</td>
                    <td>
                      {c.licencia_conducir}
                      {c.categoria_licencia && <span className="t-sub">Cat. {c.categoria_licencia}</span>}
                    </td>
                    <td className={vencida ? 't-alerta' : ''}>
                      {formatearFecha(c.fecha_vencimiento_licencia)}
                      {vencida && <span className="t-sub t-alerta">Vencida</span>}
                    </td>
                    <td>{c.usuario_id ? datos.correos[c.usuario_id] || 'Con cuenta' : <span className="t-muted">Sin acceso</span>}</td>
                    <td><EstadoPill estado={c.estado} catalogo={ESTADOS_CONDUCTOR} /></td>
                    <td className="acciones">
                      {c.usuario_id && (
                        <button disabled={ocupado} onClick={() => restablecer(c)}>
                          <KeyRound size={14} />Restablecer clave
                        </button>
                      )}
                      <button className={c.estado === 'activo' ? 'peligro' : ''} disabled={ocupado} onClick={() => alternarBaja(c)}>
                        {c.estado === 'activo' ? <><UserX size={14} />Dar de baja</> : <><UserCheck size={14} />Reactivar</>}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
