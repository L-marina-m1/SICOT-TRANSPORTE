export default function EstadoPill({ estado, catalogo }) {
  const { texto, tono } = catalogo[estado] || { texto: estado || '—', tono: 'mute' }
  return (
    <span className={`pill ${tono}`}>
      <i />
      {texto}
    </span>
  )
}
