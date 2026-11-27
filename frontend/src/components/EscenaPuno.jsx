const ocultar = (e) => {
  e.currentTarget.style.display = 'none'
}

export default function EscenaPuno() {
  return (
    <>
      <div
        className="gx-foto"
        style={{ backgroundImage: "url('/banner-puno.jpg'), linear-gradient(180deg, #b5dcf5, #eef7fd)" }}
      />
      <img className="gx-bus" src="/bus-sicot.png" alt="" onError={ocultar} />
    </>
  )
}
