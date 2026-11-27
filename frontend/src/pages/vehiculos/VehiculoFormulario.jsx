import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import Campo from '../../components/ui/Campo'
import { vehiculosApi } from '../../api/recursos'
import { ESTADOS_VEHICULO } from '../../utils/estados'

const CAMPOS_VACIOS = {
  placa: '', marca: '', modelo: '', anio: '', color: '', tipo: '',
  capacidad: '', kilometraje: '', estado: 'disponible',
}

const aFormulario = (vehiculo) =>
  Object.fromEntries(Object.keys(CAMPOS_VACIOS).map((c) => [c, vehiculo?.[c] ?? CAMPOS_VACIOS[c]]))

/** Al crear se omiten los campos vacíos; al editar se envían como null para poder borrarlos. */
function aPeticion(form, esEdicion) {
  const datos = {}
  for (const [campo, valor] of Object.entries(form)) {
    const limpio = typeof valor === 'string' ? valor.trim() : valor
    if (limpio === '') {
      if (esEdicion) datos[campo] = null
    } else {
      datos[campo] = limpio
    }
  }
  return datos
}

export default function VehiculoFormulario({ vehiculo, onCerrar, onGuardado }) {
  const esEdicion = Boolean(vehiculo)
  const [form, setForm] = useState(() => aFormulario(vehiculo))
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrores({})
    setMensaje('')
    try {
      const datos = aPeticion(form, esEdicion)
      const guardado = esEdicion
        ? await vehiculosApi.actualizar(vehiculo.id, datos)
        : await vehiculosApi.crear(datos)
      onGuardado(guardado, esEdicion)
    } catch (error) {
      setErrores(error.errores || {})
      setMensaje(error.message)
      setGuardando(false)
    }
  }

  const input = (nombre, props = {}) => (
    <input name={nombre} value={form[nombre]} onChange={cambiar} {...props} />
  )

  return (
    <Modal titulo={esEdicion ? `Editar vehículo ${vehiculo.placa}` : 'Nuevo vehículo'} onCerrar={onCerrar}>
      <form className="formulario" onSubmit={guardar} noValidate>
        {mensaje && <div className="aviso error">{mensaje}</div>}

        <div className="f-grid">
          <Campo etiqueta="Placa" obligatorio error={errores.placa}>
            {input('placa', { maxLength: 15, placeholder: 'ABC-123', autoFocus: true, style: { textTransform: 'uppercase' } })}
          </Campo>
          <Campo etiqueta="Estado" error={errores.estado}>
            <select name="estado" value={form.estado} onChange={cambiar}>
              {Object.entries(ESTADOS_VEHICULO).map(([valor, { texto }]) => (
                <option key={valor} value={valor}>{texto}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Marca" error={errores.marca}>{input('marca', { maxLength: 60 })}</Campo>
          <Campo etiqueta="Modelo" error={errores.modelo}>{input('modelo', { maxLength: 60 })}</Campo>
          <Campo etiqueta="Año" error={errores.anio}>
            {input('anio', { type: 'number', min: 1901, max: 2155, placeholder: '2020' })}
          </Campo>
          <Campo etiqueta="Color" error={errores.color}>{input('color', { maxLength: 30 })}</Campo>
          <Campo etiqueta="Tipo" error={errores.tipo}>
            {input('tipo', { maxLength: 50, placeholder: 'Minivan, bus, combi…' })}
          </Campo>
          <Campo etiqueta="Capacidad (pasajeros)" error={errores.capacidad}>
            {input('capacidad', { type: 'number', min: 0, step: 1 })}
          </Campo>
          <Campo etiqueta="Kilometraje" error={errores.kilometraje}>
            {input('kilometraje', { type: 'number', min: 0, step: '0.01', placeholder: '0' })}
          </Campo>
        </div>

        <div className="f-botones">
          <button type="button" className="btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Registrar vehículo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
