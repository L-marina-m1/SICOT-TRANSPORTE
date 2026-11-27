/** Etiqueta + control + mensaje de error del backend. */
export default function Campo({ etiqueta, error, obligatorio = false, children }) {
  return (
    <label className={`f-campo ${error ? 'con-error' : ''}`}>
      <span className="f-etiqueta">
        {etiqueta}
        {obligatorio && <b aria-hidden="true"> *</b>}
      </span>
      {children}
      {error && <small className="f-error">{error}</small>}
    </label>
  )
}
