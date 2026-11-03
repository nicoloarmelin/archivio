// Fondo del piedino: colonne a gradini nella sfumatura della parte, sfocate fino a fondersi.
// Il profilo sale verso il centro e ridiscende, come il ciclo di un'edizione (pre, evento, post).
const COLONNE = 9
const altezze = Array.from({ length: COLONNE }, (_, i) => {
  const c = (COLONNE - 1) / 2
  // il gradino più alto lascia spazio sopra, così la sfocatura non viene tagliata
  return 30 + (1 - Math.abs(i - c) / c) * 56
})

export default function Piedino() {
  return (
    <div aria-hidden="true" className="relative h-[clamp(200px,26vw,380px)] overflow-hidden">
      {/* Oltre i bordi, perché la sfocatura non schiarisca i lati e il fondo */}
      <div className="absolute -inset-x-10 -bottom-10 top-0 flex items-end blur-[14px] md:blur-[22px]">
        {altezze.map((h, i) => (
          <div key={i} className="flex-1" style={{ height: `${h}%`, background: 'var(--sfumatura-piede)' }} />
        ))}
      </div>
    </div>
  )
}
