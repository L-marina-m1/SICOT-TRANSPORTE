import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const IconoUsuario = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
)

const IconoCandado = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

const IconoOjo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconoBus = () => (
  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="15" rx="3" />
    <path d="M4 11h16M8 18v2M16 18v2" />
    <circle cx="8" cy="14.5" r="0.8" />
    <circle cx="16" cy="14.5" r="0.8" />
  </svg>
)

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const navigate = useNavigate()

  const entrar = (e) => {
    e.preventDefault()
    navigate('/inicio')
  }

  return (
    <div className="login-fondo">
      <div className="login-tarjeta">
        <section className="login-marca">
          <IconoBus />
          <h1>SICOT</h1>
          <p>Sistema de Control y Seguimiento de Transporte</p>
          <span>Transporte seguro, compromiso de todos</span>
        </section>

        <form className="login-form" onSubmit={entrar}>
          <h2>Bienvenido</h2>
          <p className="login-sub">Ingresa tus datos para continuar</p>

          <label className="campo">
            <span className="campo-icono"><IconoUsuario /></span>
            <input
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </label>

          <label className="campo">
            <span className="campo-icono"><IconoCandado /></span>
            <input
              type={verClave ? 'text' : 'password'}
              placeholder="Contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
            <button type="button" className="campo-ojo" onClick={() => setVerClave(!verClave)}>
              <IconoOjo />
            </button>
          </label>

          <button type="submit" className="btn-ingresar">Ingresar</button>
          <p className="login-pie">¿Problemas para entrar? Contacta a Soporte TI</p>
        </form>
      </div>
    </div>
  )
}