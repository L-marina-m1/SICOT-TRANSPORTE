import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import Campo from '../../components/ui/Campo'
import { registrarConductor } from '../../services/conductores'

const VACIO = {
  nombres: '', apellidos: '', dni: '', licencia_conducir: '',
  categoria_licencia: '', fecha_vencimiento_licencia: '', telefono: '', correo: '',
}

const sinVacios = (form) =>
  Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v !== ''))

export default function ConductorFormulario({ onRegistrado }) {
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const registrar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrores({})
    setMensaje('')
    try {
      const resultado = await registrarConductor(sinVacios(form))
      setForm(VACIO)
      onRegistrado(resultado)
    } catch (error) {
      setErrores(error.errores || {})
      setMensaje(error.message)
    } finally {
      setGuardando(false)
    }
  }

  const input = (nombre, props = {}) => (
    <input name={nombre} value={form[nombre]} onChange={cambiar} {...props} />
  )

  return (
    <form className="caja" onSubmit={registrar} noValidate>
      <div className="caja-titulo"><h2><UserPlus size={20} />Añadir conductor</h2></div>
      <div className="formulario">
        {mensaje && <div className="aviso error">{mensaje}</div>}
        <div className="f-grid">
          <Campo etiqueta="Nombres" obligatorio error={errores.nombres}>{input('nombres', { maxLength: 100 })}</Campo>
          <Campo etiqueta="Apellidos" obligatorio error={errores.apellidos}>{input('apellidos', { maxLength: 100 })}</Campo>
          <Campo etiqueta="DNI" obligatorio error={errores.dni}>
            {input('dni', { maxLength: 15, inputMode: 'numeric' })}
          </Campo>
          <Campo etiqueta="N.° de licencia" obligatorio error={errores.licencia_conducir}>
            {input('licencia_conducir', { maxLength: 30, style: { textTransform: 'uppercase' } })}
          </Campo>
          <Campo etiqueta="Categoría" error={errores.categoria_licencia}>
            {input('categoria_licencia', { maxLength: 20, placeholder: 'A-IIb' })}
          </Campo>
          <Campo etiqueta="Vence licencia" error={errores.fecha_vencimiento_licencia}>
            {input('fecha_vencimiento_licencia', { type: 'date' })}
          </Campo>
          <Campo etiqueta="Teléfono" error={errores.telefono}>
            {input('telefono', { maxLength: 20, inputMode: 'tel' })}
          </Campo>
          <Campo etiqueta="Correo (para su acceso)" error={errores.correo}>
            {input('correo', { type: 'email', maxLength: 120, placeholder: 'opcional' })}
          </Campo>
        </div>
        <p className="f-ayuda">
          Si escribes un correo se le crea una cuenta de conductor con una contraseña temporal.
        </p>
        <div className="f-botones">
          <button type="submit" className="btn-primario" disabled={guardando}>
            {guardando ? 'Registrando…' : 'Registrar conductor'}
          </button>
        </div>
      </div>
    </form>
  )
}
