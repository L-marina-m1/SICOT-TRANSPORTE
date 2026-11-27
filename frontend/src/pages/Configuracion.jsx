import { useState } from 'react'

const generarClave = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export default function Configuracion() {
  const [form, setForm] = useState({ nombre: '', dni: '', placa: '' })
  const [conductores, setConductores] = useState([])
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const registrar = (e) => {
    e.preventDefault()
    setError('')
    if (!form.nombre.trim() || !form.dni.trim() || !form.placa.trim()) {
      setError('Completa todos los campos')
      return
    }
    if (!/^\d{8}$/.test(form.dni)) {
      setError('El DNI debe tener 8 números')
      return
    }
    setConductores([
      ...conductores,
      { id: Date.now(), nombre: form.nombre, dni: form.dni, placa: form.placa.toUpperCase(), activo: true },
    ])
    setAviso(`${form.nombre} registrado. Contraseña temporal: ${generarClave()}`)
    setForm({ nombre: '', dni: '', placa: '' })
  }

  const alternarBaja = (id) =>
    setConductores(conductores.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c)))

  const restablecer = (c) => setAviso(`Nueva contraseña temporal de ${c.nombre}: ${generarClave()}`)

  return (
    <div className="inicio">
      <header className="dash-top">
        <div>
          <h1>Configuración</h1>
          <p>Registro y control de conductores</p>
        </div>
      </header>

      <form className="caja" onSubmit={registrar}>
        <div className="caja-titulo"><h2>Añadir conductor</h2></div>
        <div className="form-campos">
          <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={cambiar} />
          <input name="dni" placeholder="DNI" maxLength={8} value={form.dni} onChange={cambiar} />
          <input name="placa" placeholder="Placa" value={form.placa} onChange={cambiar} />
          <button type="submit" className="btn-ingresar">Registrar</button>
        </div>
        {error && <p className="msg-error">{error}</p>}
        {aviso && <p className="msg-aviso">{aviso}</p>}
      </form>

      <div className="caja">
        <div className="caja-titulo"><h2>Conductores registrados</h2></div>
        <table className="tabla">
          <thead>
            <tr><th>Nombre</th><th>DNI</th><th>Placa</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {conductores.length === 0 && (
              <tr><td colSpan={5}>Aún no hay conductores registrados</td></tr>
            )}
            {conductores.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.dni}</td>
                <td>{c.placa}</td>
                <td className={c.activo ? 'est-ok' : 'est-alerta'}>● {c.activo ? 'Activo' : 'De baja'}</td>
                <td className="acciones">
                  <button onClick={() => restablecer(c)}>Restablecer clave</button>
                  <button onClick={() => alternarBaja(c.id)}>{c.activo ? 'Dar de baja' : 'Reactivar'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}