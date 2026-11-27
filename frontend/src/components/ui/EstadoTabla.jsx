/** Fila única para "cargando", "error" o "vacío" dentro de un <tbody>. */
export default function EstadoTabla({ columnas, cargando, error, vacio, mensajeVacio, onReintentar }) {
  let contenido = null
  if (error) {
    contenido = (
      <span className="t-error">
        {error.message}{' '}
        {onReintentar && <button type="button" className="btn-link" onClick={onReintentar}>Reintentar</button>}
      </span>
    )
  } else if (cargando) {
    contenido = <span className="t-muted">Cargando…</span>
  } else if (vacio) {
    contenido = <span className="t-muted">{mensajeVacio}</span>
  }

  if (!contenido) return null
  return (
    <tr className="fila-estado">
      <td colSpan={columnas}>{contenido}</td>
    </tr>
  )
}
