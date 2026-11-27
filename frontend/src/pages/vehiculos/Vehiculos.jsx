import { useMemo, useState } from 'react'
import { Bus, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { vehiculosApi } from '../../api/recursos'
import { useCarga } from '../../hooks/useCarga'
import { useAuth } from '../../auth/AuthContext'
import { puedeAdministrar } from '../../auth/roles'
import { ESTADOS_VEHICULO } from '../../utils/estados'
import { formatearNumero } from '../../utils/formato'
import EstadoPill from '../../components/ui/EstadoPill'
import EstadoTabla from '../../components/ui/EstadoTabla'
import VehiculoFormulario from './VehiculoFormulario'

const TODOS = 'todos'

function coincide(vehiculo, texto) {
  if (!texto) return true
  const buscado = texto.toLowerCase()
  return [vehiculo.placa, vehiculo.marca, vehiculo.modelo, vehiculo.tipo]
    .some((valor) => valor?.toLowerCase().includes(buscado))
}

export default function Vehiculos() {
  const { usuario } = useAuth()
  const esAdmin = puedeAdministrar(usuario)
  const { datos, error, cargando, recargar } = useCarga(() => vehiculosApi.listar(), 'vehiculos')
  const vehiculos = useMemo(() => datos || [], [datos])

  const [filtro, setFiltro] = useState(TODOS)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo, vehiculo = editar
  const [eliminando, setEliminando] = useState(null)
  const [aviso, setAviso] = useState(null)

  const conteo = useMemo(() => {
    const c = { [TODOS]: vehiculos.length }
    for (const v of vehiculos) c[v.estado] = (c[v.estado] || 0) + 1
    return c
  }, [vehiculos])

  const visibles = vehiculos.filter(
    (v) => (filtro === TODOS || v.estado === filtro) && coincide(v, busqueda.trim())
  )

  const alGuardar = (vehiculo, esEdicion) => {
    setEditando(null)
    setAviso({ tipo: 'ok', texto: `Vehículo ${vehiculo.placa} ${esEdicion ? 'actualizado' : 'registrado'} correctamente.` })
    recargar()
  }

  const eliminar = async (vehiculo) => {
    if (!window.confirm(`¿Eliminar el vehículo ${vehiculo.placa}? Esta acción no se puede deshacer.`)) return
    setEliminando(vehiculo.id)
    try {
      await vehiculosApi.eliminar(vehiculo.id)
      setAviso({ tipo: 'ok', texto: `Vehículo ${vehiculo.placa} eliminado.` })
      recargar()
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message })
    } finally {
      setEliminando(null)
    }
  }

  const columnas = esAdmin ? 8 : 7

  return (
    <div className="dashboard">
      <header className="dash-top">
        <div>
          <h1>Vehículos</h1>
          <p>Flota registrada en SICOT</p>
        </div>
        {esAdmin && (
          <button className="btn-primario" onClick={() => setEditando({})}>
            <Plus size={18} />Nuevo vehículo
          </button>
        )}
      </header>

      {aviso && (
        <div className={`aviso ${aviso.tipo}`} role="status">
          <span>{aviso.texto}</span>
          <button onClick={() => setAviso(null)} aria-label="Cerrar aviso"><X size={16} /></button>
        </div>
      )}

      <div className="barra-acciones">
        <div className="filtros">
          {[[TODOS, 'Todos'], ...Object.entries(ESTADOS_VEHICULO).map(([k, v]) => [k, v.texto])].map(([valor, texto]) => (
            <button key={valor} className={filtro === valor ? 'on' : ''} onClick={() => setFiltro(valor)}>
              {texto}<span>{conteo[valor] || 0}</span>
            </button>
          ))}
        </div>
        <label className="buscador">
          <Search size={16} />
          <input
            placeholder="Buscar placa, marca, tipo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
      </div>

      <section className="caja">
        <div className="caja-titulo"><h2><Bus size={20} />Listado de vehículos</h2></div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Placa</th><th>Marca / modelo</th><th>Año</th><th>Tipo</th>
                <th>Capacidad</th><th>Kilometraje</th><th>Estado</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              <EstadoTabla
                columnas={columnas}
                cargando={cargando && !datos}
                error={error}
                vacio={visibles.length === 0}
                mensajeVacio={vehiculos.length === 0 ? 'Aún no hay vehículos registrados' : 'Ningún vehículo coincide con el filtro'}
                onReintentar={recargar}
              />
              {!error && visibles.map((v) => (
                <tr key={v.id}>
                  <td><b>{v.placa}</b></td>
                  <td>{[v.marca, v.modelo].filter(Boolean).join(' ') || '—'}</td>
                  <td>{v.anio ?? '—'}</td>
                  <td>{v.tipo || '—'}</td>
                  <td>{v.capacidad ?? '—'}</td>
                  <td>{formatearNumero(v.kilometraje, 0)} km</td>
                  <td><EstadoPill estado={v.estado} catalogo={ESTADOS_VEHICULO} /></td>
                  {esAdmin && (
                    <td className="acciones">
                      <button onClick={() => setEditando(v)}><Pencil size={14} />Editar</button>
                      <button className="peligro" disabled={eliminando === v.id} onClick={() => eliminar(v)}>
                        <Trash2 size={14} />{eliminando === v.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editando && (
        <VehiculoFormulario
          vehiculo={editando.id ? editando : null}
          onCerrar={() => setEditando(null)}
          onGuardado={alGuardar}
        />
      )}
    </div>
  )
}
