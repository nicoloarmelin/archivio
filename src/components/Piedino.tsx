import { useEffect, useRef } from 'react'

// Fondo del piedino: colonne nella sfumatura della parte, sfocate fino a fondersi.
// Lo scorrimento ne fa un ciclo di vita: all'ingresso la sfumatura nasce piatta dal basso (pre),
// a metà le colonne salgono a gradini verso il centro (evento), in fondo alla pagina tornano
// tutte alla stessa altezza e la sfumatura resta orizzontale (post).
const COLONNE = 9
const PIATTA = 58 // altezza delle colonne a riposo, in %
const PICCO = 30 // quanto sale la colonna centrale al culmine; lascia spazio sopra alla sfocatura
const profilo = Array.from({ length: COLONNE }, (_, i) => {
  const c = (COLONNE - 1) / 2
  return 1 - Math.abs(i - c) / c
})
const clamp = (x: number) => Math.min(1, Math.max(0, x))

export default function Piedino() {
  const box = useRef<HTMLDivElement>(null)
  const scena = useRef<HTMLDivElement>(null)
  const col = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const draw = () => {
      raf = 0
      const r = box.current?.getBoundingClientRect()
      if (!r) return
      // 0 quando il piedino entra dal basso, 1 quando la pagina è finita
      const p = still ? 1 : clamp((window.innerHeight - r.top) / r.height)
      const nasce = clamp(p / 0.4)
      const culmine = Math.sin(Math.PI * p)
      scena.current!.style.transform = `scaleY(${nasce})`
      profilo.forEach((k, i) => {
        const el = col.current[i]
        if (el) el.style.height = `${PIATTA + PICCO * k * culmine}%`
      })
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  return (
    <div ref={box} aria-hidden="true" className="relative h-[clamp(200px,26vw,380px)] overflow-hidden">
      {/* Oltre i bordi, perché la sfocatura non schiarisca i lati e il fondo */}
      <div ref={scena} className="absolute -inset-x-10 -bottom-10 top-0 flex origin-bottom items-end blur-[14px] will-change-transform md:blur-[22px]">
        {profilo.map((_, i) => (
          <div
            key={i}
            ref={(el) => { col.current[i] = el }}
            className="flex-1"
            style={{ height: `${PIATTA}%`, background: 'var(--sfumatura-piede)' }}
          />
        ))}
      </div>
    </div>
  )
}
